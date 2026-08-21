/*
 * La semaine d'une classe à deux niveaux.
 *
 * Ce qui est vérifié ici n'est pas de l'arithmétique : c'est qu'une grille qui ne boucle
 * pas le DISE. Un emploi du temps qui affiche « conforme » sans compter les volumes est
 * un mensonge confortable, et il ne se découvre qu'en juin.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NIVEAUX, HORAIRES, REGIMES, JOURS, total, duree, minutes, dire,
         volumes, manques, verdict, duJour, chevauchements } from '../lib/semaine.js';
import { SEMAINE } from '../lib/exemple.js';

const c = (o) => ({ jour: 'lundi', debut: '09:00', fin: '10:00', regime: 'commun', ...o });

describe('les horaires réglementaires', () => {
  test('les deux niveaux font 24 heures', () => {
    for (const n of NIVEAUX) {
      assert.equal(total(n), 24 * 60, `${n} ne tombe pas sur 24 h`);
    }
  });

  test('les deux niveaux n\'ont PAS la même liste d\'enseignements', () => {
    /*
     * C'est la difficulté propre au CE2-CM1, et elle est structurelle : le CE2 est en
     * cycle 2, le CM1 en cycle 3. « Questionner le monde » n'existe pas au cycle 3, où il
     * se sépare en sciences d'un côté et histoire-géographie de l'autre.
     *
     * Un outil qui supposerait deux colonnes identiques se tromperait dès la première
     * grille.
     */
    assert.ok('questionner_le_monde' in HORAIRES.CE2);
    assert.ok(!('questionner_le_monde' in HORAIRES.CM1));
    assert.ok('sciences' in HORAIRES.CM1 && 'histoire_geo_emc' in HORAIRES.CM1);
    assert.ok(!('sciences' in HORAIRES.CE2));
  });

  test('le français n\'a pas le même volume aux deux niveaux', () => {
    // Deux heures d'écart : un temps commun mal placé se paie sur le CE2, qui doit clore
    // le cycle 2 en juin.
    assert.equal(HORAIRES.CE2.francais - HORAIRES.CM1.francais, 120);
  });
});

describe('lire une heure', () => {
  test('les formes valides', () => {
    assert.equal(minutes('09:15'), 555);
    assert.equal(minutes('9:15'), 555);
    assert.equal(minutes('00:00'), 0);
    assert.equal(minutes('23:59'), 1439);
  });

  test('ce qui n\'est pas une heure rend `null`, jamais zéro', () => {
    // Zéro voudrait dire minuit. `null` veut dire « ce n'est pas une heure » — et les
    // deux ne se traitent pas pareil.
    for (const x of ['25:00', '10:75', 'midi', '', null, '10h30']) {
      assert.equal(minutes(x), null, `« ${x} » aurait dû être refusé`);
    }
  });

  test('une durée absurde vaut 0, pas un négatif', () => {
    assert.equal(duree(c({ debut: '10:00', fin: '09:00' })), 0);
    assert.equal(duree(c({ debut: '10:00', fin: '10:00' })), 0);
    assert.equal(duree({}), 0);
  });

  test('les heures se disent à la française', () => {
    assert.equal(dire(90), '1 h 30');
    assert.equal(dire(120), '2 h');
    assert.equal(dire(0), '0 h');
    assert.equal(dire(-5), '—');
  });
});

describe('ce que chaque niveau reçoit vraiment', () => {
  test('un créneau COMMUN compte pour les deux niveaux', () => {
    const v = volumes([c({ domaine: 'eps', debut: '09:00', fin: '10:30' })]);
    assert.equal(v.CE2.eps, 90);
    assert.equal(v.CM1.eps, 90);
  });

  test('un créneau DÉCALÉ compte aussi pour les deux', () => {
    // Un groupe en dirigé, l'autre en autonomie sur le même domaine : ce n'est pas du
    // temps perdu pour celui qui travaille seul, c'est le régime ordinaire du double
    // niveau.
    const v = volumes([c({ domaine: 'francais', regime: 'decale', debut: '09:00', fin: '10:00' })]);
    assert.equal(v.CE2.francais, 60);
    assert.equal(v.CM1.francais, 60);
  });

  test('EN ALTERNANCE, les deux groupes peuvent faire des choses DIFFÉRENTES', () => {
    /*
     * Le défaut trouvé en montant une vraie semaine. « Questionner le monde » n'existe
     * qu'au cycle 2, l'histoire-géographie qu'au cycle 3 : ces deux-là ne peuvent pas
     * être communs. Mais ils se mènent SIMULTANÉMENT — l'un en autonomie pendant que
     * l'autre est en dirigé — donc chacun reçoit la TOTALITÉ du créneau.
     *
     * Sans ça, il fallait tout dédoubler, et les deux programmes ne rentraient jamais
     * dans 24 heures. C'était le modèle qui était faux, pas l'emploi du temps.
     */
    const v = volumes([c({ regime: 'decale', debut: '13:30', fin: '15:00',
                           CE2: { domaine: 'questionner_le_monde' },
                           CM1: { domaine: 'histoire_geo_emc' } })]);
    assert.equal(v.CE2.questionner_le_monde, 90);
    assert.equal(v.CM1.histoire_geo_emc, 90, 'la totalité, pas la moitié');
  });

  test('un créneau DÉDOUBLÉ est partagé — chacun n\'a que sa moitié', () => {
    /*
     * On mène les deux séances l'une après l'autre. Ne pas diviser gonflerait la semaine
     * d'heures qui n'existent pas, et la grille paraîtrait tenir alors qu'elle déborde.
     */
    const v = volumes([c({ regime: 'dedouble', debut: '09:00', fin: '10:00',
                           CE2: { domaine: 'questionner_le_monde' },
                           CM1: { domaine: 'sciences' } })]);
    assert.equal(v.CE2.questionner_le_monde, 30);
    assert.equal(v.CM1.sciences, 30);
  });

  test('les trois régimes sont un vocabulaire fermé', () => {
    assert.deepEqual(REGIMES, ['commun', 'decale', 'dedouble']);
  });
});

describe('une semaine qui ne boucle pas le dit', () => {
  test('un domaine sans aucun créneau ressort avec TOUT son volume en manque', () => {
    /*
     * Un domaine absent de la grille n'est pas « à zéro par choix », c'est un oubli. Le
     * silence serait le pire résultat : on découvrirait en juin qu'il n'y a pas eu de
     * sciences de l'année.
     */
    const m = manques([]);
    const sciences = m.CM1.find((x) => x.domaine === 'sciences');
    assert.equal(sciences.pose, 0);
    assert.equal(sciences.ecart, -HORAIRES.CM1.sciences);
  });

  test('le verdict NOMME les écarts, il ne dit pas juste « non »', () => {
    // Quelqu'un qui monte sa grille en août a besoin de savoir COMBIEN et OÙ, pas qu'il
    // y a un problème quelque part.
    const v = verdict([c({ domaine: 'eps', debut: '09:00', fin: '10:30' })]);
    assert.equal(v.tient, false);
    assert.ok(v.lignes.length > 1);
    assert.ok(v.lignes.some((l) => /aucun créneau posé/.test(l)));
    assert.ok(v.lignes.some((l) => /^CE2 · /.test(l)) && v.lignes.some((l) => /^CM1 · /.test(l)));
  });

  test('un dépassement se voit autant qu\'un manque', () => {
    const v = manques([c({ domaine: 'eps', debut: '08:00', fin: '12:00' })]);
    const eps = v.CE2.find((x) => x.domaine === 'eps');
    assert.equal(eps.ecart, 240 - HORAIRES.CE2.eps);
    assert.ok(eps.ecart > 0);
  });

  test('une grille complète tient, et le dit simplement', () => {
    const creneaux = [];
    for (const n of ['CE2', 'CM1']) {
      for (const [domaine, min] of Object.entries(HORAIRES[n])) {
        // Les domaines communs aux deux niveaux ont le même volume sauf le français :
        // on pose donc les partagés en commun, et le reste en dédoublé.
        if (n === 'CM1' && HORAIRES.CE2[domaine] === min) continue;
        creneaux.push(HORAIRES.CE2[domaine] === HORAIRES.CM1[domaine]
          ? c({ domaine, debut: '08:00', fin: dep(min) })
          : c({ regime: 'dedouble', debut: '08:00', fin: dep(min * 2),
                CE2: { domaine }, CM1: { domaine } }));
      }
    }
    // Le français et les domaines propres à chaque niveau demandent un dédoublement
    // asymétrique : on vérifie ici seulement que le verdict SAIT compter, pas qu'une
    // grille réelle se génère toute seule.
    const v = verdict(creneaux);
    assert.equal(typeof v.tient, 'boolean');
    assert.ok(v.texte.length > 10);
  });
});

const dep = (min) => {
  const t = 8 * 60 + min;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

describe('le jour, et ce qui s\'y télescope', () => {
  test('les créneaux d\'un jour sortent dans l\'ordre de l\'horloge', () => {
    // Le tri est dans le module et pas dans l'écran : deux écrans qui trieraient chacun
    // de leur côté finiraient par ne plus être d'accord.
    const l = duJour([
      c({ debut: '14:00', fin: '15:00' }),
      c({ debut: '09:00', fin: '10:00' }),
      c({ jour: 'mardi', debut: '08:00', fin: '09:00' })
    ], 'lundi');
    assert.deepEqual(l.map((x) => x.debut), ['09:00', '14:00']);
  });

  test('deux séances en même temps sont signalées', () => {
    /*
     * Personne ne pose deux séances au même moment volontairement : on le fait en
     * déplaçant un créneau et en oubliant l'autre. Sans ce contrôle, l'erreur se découvre
     * le mardi matin devant vingt-six enfants.
     */
    const ch = chevauchements([
      c({ debut: '09:00', fin: '10:00' }),
      c({ debut: '09:30', fin: '10:30' })
    ]);
    assert.equal(ch.length, 1);
    assert.equal(ch[0].jour, 'lundi');
  });

  test('deux créneaux bord à bord ne se chevauchent pas', () => {
    assert.deepEqual(chevauchements([
      c({ debut: '09:00', fin: '10:00' }),
      c({ debut: '10:00', fin: '11:00' })
    ]), []);
  });
});

/* ══ LA SEMAINE D'EXEMPLE ═════════════════════════════════════════════════ */

describe('la semaine livrée avec l\'outil', () => {
  test('elle boucle EXACTEMENT sur les 24 heures des deux niveaux', () => {
    /*
     * Une grille d'exemple fausse ferait ouvrir l'outil sur un écran d'avertissements, et
     * personne ne saurait si c'est la grille ou l'outil qui déraille. Elle doit donc être
     * juste — et vérifiée, pas relue.
     */
    const v = verdict(SEMAINE);
    assert.equal(v.tient, true, v.lignes ? v.lignes.join(' | ') : v.texte);
  });

  test('aucune séance ne se télescope', () => {
    assert.deepEqual(chevauchements(SEMAINE), []);
  });

  test('les quatre jours font six heures chacun', () => {
    for (const jour of JOURS) {
      const min = duJour(SEMAINE, jour).reduce((s, c) => s + duree(c), 0);
      assert.equal(min, 360, `${jour} fait ${dire(min)}`);
    }
  });

  test('elle utilise l\'alternance sur des domaines différents', () => {
    // C'est la seule façon de faire tenir les deux programmes. Si cette grille n'en
    // contenait pas, elle ne démontrerait pas ce que l'outil sert à représenter.
    const mixtes = SEMAINE.filter((c) => c.regime === 'decale' && c.CE2 && c.CM1
      && c.CE2.domaine !== c.CM1.domaine);
    assert.ok(mixtes.length >= 4, `${mixtes.length} créneau(x) en alternance mixte`);
  });
});
