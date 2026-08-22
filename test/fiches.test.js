import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { semeur, GENERATEURS, pourLeNiveau } from '../lib/calculs.js';
import { comprendre, fabriquer, lireLesExercices } from '../lib/exercices.js';
import { blocsDeFiche, blocsDeCorrige, aucuneReponse } from '../lib/fiche.js';
import { nu } from '../lib/miseenforme.js';
import { laListe, lAnnee, etat, SEMAINES, PAR_JOUR } from '../lib/mots.js';
import { lAnneeDouble, protegees, libre, laPoesie } from '../lib/poesies.js';
import { FABRIQUES, planche, FORMATS, lireLesItems } from '../lib/materiel.js';

describe('les réponses se calculent, elles ne se demandent pas', () => {
  test('chaque générateur rend des réponses JUSTES', () => {
    /*
     * Le test qui justifie tout le module. Un modèle qui rate une multiplication produit
     * un corrigé impeccable et faux — que personne ne relit, parce qu'on ne relit pas un
     * corrigé de tables. Ici, on vérifie.
     */
    const r = semeur(12345);
    const verifs = {
      tables: (e) => {
        const [a, , b] = e.enonce.replace(' =', '').split(' ');
        return String(Number(a) * Number(b)) === e.reponse;
      },
      'addition-posee': (e) => {
        const [a, , b] = e.enonce.split(' ');
        return String(Number(a) + Number(b)) === e.reponse;
      },
      'soustraction-posee': (e) => {
        const [a, , b] = e.enonce.split(' ');
        return String(Number(a) - Number(b)) === e.reponse && Number(e.reponse) > 0;
      },
      'multiplication-posee': (e) => {
        const [a, , b] = e.enonce.split(' ');
        return String(Number(a) * Number(b)) === e.reponse;
      },
      division: (e) => {
        const [a, , b] = e.enonce.split(' ');
        const [q, , reste] = e.reponse.split(' ');
        return Number(q) * Number(b) + Number(reste) === Number(a) && Number(reste) < Number(b);
      },
      'multiplier-10': (e) => {
        const [a, , f] = e.enonce.replace(' =', '').split(' ');
        return String(Number(a) * Number(f)) === e.reponse;
      }
    };
    for (const g of GENERATEURS) {
      const items = g.faire(semeur(99), { niveau: g.niveaux[0] });
      assert.ok(items.length > 0, `${g.id} ne produit rien`);
      const verif = verifs[g.id];
      if (!verif) continue;
      for (const e of items) {
        assert.ok(verif(e), `${g.id} : « ${e.enonce} » → « ${e.reponse} » est FAUX`);
      }
    }
  });

  test('« avec retenue » et « sans retenue » sont vérifiés, pas espérés', () => {
    const g = GENERATEURS.find((x) => x.id === 'addition-posee');
    for (const retenue of [true, false]) {
      for (const e of g.faire(semeur(7), { retenue, combien: 8, niveau: 'CE2' })) {
        const [a, , b] = e.enonce.split(' ');
        const chiffres = String(a).split('').reverse();
        const autres = String(b).split('').reverse();
        const aRetenue = chiffres.some((c, i) => Number(c) + Number(autres[i] || 0) >= 10);
        assert.equal(aRetenue, retenue, `« ${e.enonce} » ne respecte pas la demande`);
      }
    }
  });

  test('la moitié n\'est demandée que sur un nombre pair', () => {
    const g = GENERATEURS.find((x) => x.id === 'doubles');
    for (const e of g.faire(semeur(5), { combien: 40 })) {
      const m = /la moitié de (\d+)/.exec(e.enonce);
      if (m) assert.equal(Number(m[1]) % 2, 0, `« ${e.enonce} » n'est pas au programme`);
    }
  });

  test('la même graine rend la même fiche — on réimprime celle qu\'on a perdue', () => {
    const a = fabriquer('table de 7', { graine: 42 });
    const b = fabriquer('table de 7', { graine: 42 });
    const c = fabriquer('table de 7', { graine: 43 });
    assert.deepEqual(a.items, b.items);
    assert.notDeepEqual(a.items, c.items);
  });

  test('le CE2 ne voit pas ce qui n\'est pas à son programme', () => {
    const ids = pourLeNiveau('CE2').map((g) => g.id);
    assert.ok(!ids.includes('fractions'));
    assert.ok(!ids.includes('division'));
    assert.ok(ids.includes('tables'));
  });
});

describe('comprendre une demande écrite en français', () => {
  test('la table demandée est lue dans la phrase', () => {
    const r = comprendre('je veux une evaluation des multiplications de table de 5');
    assert.equal(r.genre, 'calcul');
    assert.equal(r.generateur.id, 'tables');
    assert.deepEqual(r.options.tables, [5]);
  });

  test('plusieurs tables, et une quantité', () => {
    const r = comprendre('les tables de 6 et 7, 24 questions');
    assert.deepEqual(r.options.tables, [6, 7]);
    assert.equal(r.options.combien, 24);
  });

  test('le niveau écrit dans la phrase prime sur celui de l\'écran', () => {
    assert.equal(comprendre('des divisions CM1', { niveau: 'CE2' }).niveau, 'CM1');
  });

  test('le plus précis gagne', () => {
    // « multiplication posée » ne doit pas rendre des tables.
    assert.equal(comprendre('des multiplications posées').generateur.id,
                 'multiplication-posee');
  });

  test('ce qui n\'est pas calculable part au modèle, et on le dit', () => {
    const r = comprendre('une évaluation sur le passé composé');
    assert.equal(r.genre, 'modele');
  });

  test('les mots qui ont SERVI ne sont pas listés comme incompris', () => {
    // Du bruit dans une alerte, c'est ce qui fait qu'on cesse de la lire.
    for (const d of ['conversions de longueurs CE2', 'les tables de 6 et 7, 24 questions',
                     'des additions posées avec retenue pour les CM1']) {
      assert.deepEqual(comprendre(d).ignores, [], `« ${d} » signale des mots à tort`);
    }
  });

  test('on dit quand on ne peut pas donner la quantité demandée', () => {
    // Il n'existe que vingt faits sur deux tables. Silencieusement, ça ressemble à une panne.
    const r = fabriquer('les tables de 6 et 7, 24 questions');
    assert.deepEqual(r.manque, { demande: 24, obtenu: 20 });
    assert.equal(fabriquer('table de 5').manque, null);
  });
});

describe('LA FICHE DE L\'ÉLÈVE EST VIDE', () => {
  test('elle ne porte aucune réponse, quelle que soit la demande', () => {
    for (const d of ['table de 5', 'additions posées CM1', 'conversions CE2',
                     'décomposer CE2', 'durées CE2', 'périmètre CM1', 'fractions CM1',
                     'divisions CM1', 'comparer les nombres CE2', 'doubles CE2']) {
      const r = fabriquer(d, { niveau: 'CM1' });
      if (!r.fiche) continue;
      assert.equal(aucuneReponse(r.fiche).propre, true, `« ${d} » : la fiche n'est pas vide`);
      // Aucun item de la fiche ne porte de champ de réponse, sous quelque nom que ce soit.
      for (const it of r.fiche.items) {
        assert.deepEqual(Object.keys(it).sort(), ['enonce', 'numero', 'place']);
      }
    }
  });

  test('une fiche trafiquée est REFUSÉE, pas nettoyée', () => {
    const truquee = { sansReponses: true, titre: 'x',
                      items: [{ numero: 1, enonce: 'a', reponse: 'b', place: 'case' }] };
    const c = aucuneReponse(truquee);
    assert.equal(c.propre, false);
    assert.match(c.pourquoi, /portent encore une réponse/);
  });

  test('une fiche non marquée ne s\'imprime pas du tout', () => {
    assert.throws(() => blocsDeFiche({ items: [] }), /refus d'imprimer/);
  });

  test('le corrigé est un document SÉPARÉ qui dit son nom', () => {
    const r = fabriquer('table de 5');
    const b = blocsDeCorrige(r.corrige);
    const t = b.map(nu).join('\n');
    assert.match(t, /^CORRIGÉ —/);
    assert.match(t, /à ne pas distribuer/);
    // Et il porte bien les réponses, lui.
    assert.match(t, /→ \d+/);
  });

  test('les opérations posées ont la place d\'être posées', () => {
    const r = fabriquer('additions posées CM1');
    const b = blocsDeFiche(r.fiche);
    const grille = b.find((x) => x.hautesCases);
    assert.ok(grille, 'sans cases hautes, l\'élève ne peut pas poser ses colonnes');
  });
});

describe('les listes de mots', () => {
  test('trente-six semaines pleines, dans les deux niveaux', () => {
    for (const e of etat()) {
      assert.equal(e.complet, true, `${e.niveau} n'a que ${e.semaines} semaines`);
      assert.equal(e.semaines, SEMAINES);
    }
  });

  test('chaque semaine porte une règle, pas un tas de mots', () => {
    // Une liste tirée au sort n'apprend rien : l'enfant mémorise un par un et oublie.
    for (const niveau of ['CE2', 'CM1']) {
      for (const l of lAnnee(niveau)) {
        assert.ok(l.regle && l.regle.length > 5, `${niveau} s${l.semaine} : pas de règle`);
        assert.ok(l.mots.length >= 15, `${niveau} s${l.semaine} : trop peu de mots`);
      }
    }
  });

  test('le découpage est de cinq mots par jour', () => {
    const l = laListe('CE2', 3);
    assert.equal(l.jours.length, Math.ceil(l.mots.length / PAR_JOUR));
    for (const j of l.jours.slice(0, -1)) assert.equal(j.length, PAR_JOUR);
  });

  test('aucun doublon dans une même liste', () => {
    for (const niveau of ['CE2', 'CM1']) {
      for (const l of lAnnee(niveau)) {
        assert.equal(new Set(l.mots).size, l.mots.length,
          `${niveau} s${l.semaine} : deux fois le même mot dans une dictée`);
      }
    }
  });

  test('aucun caractère parasite', () => {
    // Un caractère hors alphabet latin s'était glissé dans une liste : imprimé, il aurait
    // été dicté à des enfants.
    const mauvais = /[^\p{Script=Latin}\p{M}\s'’/-]/u;
    for (const niveau of ['CE2', 'CM1']) {
      for (const l of lAnnee(niveau)) {
        for (const m of l.mots) {
          assert.ok(!mauvais.test(m), `${niveau} s${l.semaine} : « ${m} »`);
        }
      }
    }
  });
});

describe('le programme de poésies', () => {
  test('trente-six semaines pour CHAQUE niveau — aucun trou', () => {
    /*
     * Première version : les poésies difficiles étaient réservées au CM1, et le CE2 se
     * retrouvait avec onze semaines vides. Un programme troué ne s'utilise pas.
     */
    const a = lAnneeDouble();
    assert.equal(a.length, 36);
    for (const s of a) {
      assert.ok(s.CE2?.titre, `semaine ${s.semaine} : rien pour le CE2`);
      assert.ok(s.CM1?.titre, `semaine ${s.semaine} : rien pour le CM1`);
    }
  });

  test('aucun texte de poème n\'est reproduit', () => {
    // La raison est juridique autant que technique : un poème reste protégé soixante-dix
    // ans après la mort de son auteur, et un texte récité de mémoire revient faux.
    for (const s of lAnneeDouble()) {
      for (const niveau of ['CE2', 'CM1']) {
        const p = s[niveau];
        assert.ok(!('texte' in p), `semaine ${s.semaine} : un texte est reproduit`);
        assert.ok(p.titre.length < 60, 'un titre, pas un vers');
      }
    }
  });

  test('le domaine public est CALCULÉ, pas recopié', () => {
    assert.equal(libre(1896, 2026), true);   // Verlaine
    assert.equal(libre(1977, 2026), false);  // Prévert
    assert.equal(libre(1955, 2026), true);
    assert.equal(libre(1956, 2026), false);
    assert.equal(libre(0, 2026), false);
  });

  test('les auteurs encore protégés sont nommés, avec l\'année de libération', () => {
    const p = protegees(2026);
    assert.ok(p.length > 0);
    const prevert = p.find((x) => x.auteur === 'Jacques Prévert');
    assert.ok(prevert, 'Prévert est le plus récité de l\'école : il doit être signalé');
    assert.equal(prevert.libreEn, 2048);
  });

  test('chaque entrée dit où trouver le texte', () => {
    const p = laPoesie(2, { niveau: 'CM1' });
    assert.match(p.ou, /Chanson d'automne Paul Verlaine/);
    assert.match(p.ou, /deux sources/);
  });
});

describe('le matériel imprimable', () => {
  test('chaque fabrique produit quelque chose, sans réglage', () => {
    for (const f of FABRIQUES) {
      const r = f.faire({});
      assert.ok(r.titre, `${f.id} n'a pas de titre`);
      assert.ok(r.blocs.length, `${f.id} ne produit aucun bloc`);
    }
  });

  test('les dominos BOUCLENT — sinon le jeu est cassé', () => {
    /*
     * Un jeu de dominos qui ne boucle pas est un jeu cassé : les enfants arrivent au bout
     * et il reste des pièces. C'est vérifiable, donc c'est vérifié.
     */
    const d = FABRIQUES.find((f) => f.id === 'dominos-calcul').faire({ combien: 16 });
    const rangs = d.blocs.find((b) => b.type === 'tableau').rangs;
    for (let i = 0; i < rangs.length; i++) {
      const calcul = rangs[i][1][0];
      const [a, , b] = calcul.split(' ');
      const suivant = rangs[(i + 1) % rangs.length][0][0];
      assert.equal(String(Number(a) * Number(b)), suivant,
        `le domino ${i + 1} ne se raccorde pas au suivant`);
    }
  });

  test('le verso d\'une planche est en MIROIR', () => {
    // Sans l'inversion, chaque résultat tombe derrière la mauvaise carte et la planche
    // est bonne à jeter.
    const recto = planche(['a', 'b', 'c'], FORMATS.cartes);
    const verso = planche(['1', '2', '3'], FORMATS.cartes, { miroir: true });
    assert.deepEqual(recto.rangs[0].map((c) => c[0]), ['a', 'b', 'c']);
    assert.deepEqual(verso.rangs[0].map((c) => c[0]), ['3', '2', '1']);
  });

  test('une planche incomplète est complétée par des cases vides', () => {
    const p = planche(['a', 'b'], FORMATS.cartes);
    assert.equal(p.rangs[0].length, FORMATS.cartes.colonnes);
  });

  test('la bande numérique ne saute aucun nombre', () => {
    const b = FABRIQUES.find((f) => f.id === 'bande-numerique').faire({ de: 0, a: 100 });
    const tous = b.blocs[0].rangs.flat().map((c) => Number(c[0]));
    assert.equal(tous.length, 101);
    for (let i = 0; i <= 100; i++) assert.equal(tous[i], i, `il manque ${i}`);
  });

  test('ce qui n\'est pas un item est écarté, et compté', () => {
    const { items, ecartees } = lireLesItems(
      'Voici la liste des mots demandés :\n- chat || le chat\n2. chien || le chien\nfleur');
    assert.equal(items.length, 3);
    assert.deepEqual(items[0], { gauche: 'chat', droite: 'le chat' });
    assert.deepEqual(items[2], { gauche: 'fleur', droite: '' });
    assert.equal(ecartees.length, 1);
  });
});

describe('ce que le modèle doit rendre pour une fiche', () => {
  test('énoncé et réponse se séparent — sans ça, pas de fiche vide possible', () => {
    const { items, consigne } = lireLesExercices(
      'CONSIGNE : Conjugue au présent.\n1. chanter, 3e pers. pluriel || ils chantent\n'
      + '2. Contraire de rapide ? || lent');
    assert.equal(consigne, 'Conjugue au présent.');
    assert.equal(items.length, 2);
    assert.equal(items[0].reponse, 'ils chantent');
  });

  test('une ligne sans réponse n\'entre pas dans la fiche', () => {
    // Un exercice dont on ne sait pas isoler la réponse ne peut pas être donné aux enfants.
    const { items } = lireLesExercices('Voici quelques exercices pour la classe.');
    assert.equal(items.length, 0);
  });
});

describe('l\'inventaire tient dans une année', () => {
  test('chaque semaine fait un multiple de cinq mots', () => {
    /*
     * Cinq mots par jour, quatre jours. Une semaine de dix-neuf mots donne un jour à
     * quatre — ça ne se voit pas dans le code, ça se voit dans le cahier de l'enfant.
     * C'est arrivé : en retirant un caractère parasite, j'ai laissé la liste à 19.
     */
    for (const niveau of ['CE2', 'CM1']) {
      for (const l of lAnnee(niveau)) {
        assert.equal(l.mots.length % PAR_JOUR, 0,
          `${niveau} semaine ${l.semaine} : ${l.mots.length} mots`);
      }
    }
  });

  test('le compte annoncé est le compte réel', () => {
    // 36 semaines × 20 mots × 2 niveaux.
    assert.deepEqual(etat().map((e) => e.mots), [720, 720]);
  });
});
