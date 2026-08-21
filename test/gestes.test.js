/*
 * « Un geste se range là où vit ce qu'il lit. »
 *
 * Ce qui est vérifié ici n'est pas une liste : c'est qu'il n'y AIT PAS de liste. Une
 * grille de cartes qu'on fait défiler est une machine à ne pas trouver — et la même
 * erreur a déjà été payée une fois ailleurs.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ANCRAGES, GESTES, ici, geste, parAncrage } from '../lib/gestes.js';

const creneau = (o = {}) => ({ jour: 'lundi', debut: '09:00', fin: '10:00',
                               regime: 'commun', domaine: 'francais', ...o });

describe('chaque geste sait où il vit et ce qu\'il refuse', () => {
  test('tout geste déclare un ancrage connu', () => {
    for (const g of GESTES) {
      assert.ok(ANCRAGES.includes(g.ancrage), `${g.id} : ancrage « ${g.ancrage} » inconnu`);
    }
  });

  test('tout geste déclare ce qu\'il lit, ce qu\'il rend, et ce qu\'il ne fait JAMAIS', () => {
    /*
     * Le troisième champ est celui qui a le plus de valeur : c'est lui qui empêche un
     * outil d'aide de devenir un outil qui décide. Il doit vivre dans les données, pas
     * dans la tête de celui qui a codé le bouton.
     */
    for (const g of GESTES) {
      /*
       * Le nom du geste PRINCIPAL a le droit d'être court — c'est même tout l'intérêt.
       *
       * Cette règle exigeait onze caractères partout, et elle a contribué au défaut :
       * des noms longs et fins (« Ce qui bloque, et pour qui »), et aucun qui dise
       * simplement « Corriger ». Un nom court sur le bouton qu'on cherche vaut mieux
       * qu'un nom juste sur un bouton qu'on ne trouve pas.
       */
      assert.ok(g.nom?.length > (g.principal ? 4 : 10),
        `${g.id} : « nom » vide ou trop court`);
      for (const champ of ['lit', 'rend', 'jamais']) {
        assert.ok(g[champ]?.length > 10, `${g.id} : « ${champ} » vide ou trop court`);
      }
    }
  });

  test('un seul geste principal par ancrage, au plus', () => {
    // Deux boutons en grand sur le même écran, c'est de nouveau un choix à faire avant
    // d'avoir compris qu'on avait le choix.
    const parAncrage = {};
    for (const g of GESTES.filter((x) => x.principal)) {
      parAncrage[g.ancrage] = (parAncrage[g.ancrage] || 0) + 1;
      assert.ok(g.consigne, `${g.id} est principal mais n'a pas de consigne`);
    }
    for (const [a, n] of Object.entries(parAncrage)) {
      assert.equal(n, 1, `${a} déclare ${n} gestes principaux`);
    }
  });

  test('aucun identifiant en double', () => {
    const vus = GESTES.map((g) => g.id);
    assert.equal(new Set(vus).size, vus.length);
  });

  test('aucun endroit de l\'écran n\'est désert', () => {
    // Un ancrage sans geste serait un endroit où l'outil ne sert à rien, et personne ne
    // s'en apercevrait avant d'y être.
    for (const [a, n] of Object.entries(parAncrage())) {
      assert.ok(n > 0, `« ${a} » ne porte aucun geste`);
    }
  });

  test('un identifiant inconnu rend `null` — on ne devine pas', () => {
    assert.equal(geste('nexiste-pas'), null);
    assert.ok(geste('preparer-seance'));
  });
});

describe('ce qui est proposé dépend de l\'objet, pas d\'une liste figée', () => {
  test('le travail en autonomie n\'apparaît QUE quand quelqu\'un travaille seul', () => {
    /*
     * Sur un créneau où les deux groupes sont ensemble, personne n'est en autonomie : le
     * proposer serait proposer de préparer quelque chose qui n'aura pas lieu.
     */
    const enAlternance = ici('creneau', creneau({ regime: 'decale' })).map((g) => g.id);
    const ensemble = ici('creneau', creneau({ regime: 'commun' })).map((g) => g.id);
    assert.ok(enAlternance.includes('plan-autonome'));
    assert.ok(!ensemble.includes('plan-autonome'));
  });

  test('« peut-on éviter de dédoubler » n\'apparaît que sur un créneau dédoublé', () => {
    assert.ok(ici('creneau', creneau({ regime: 'dedouble' })).some((g) => g.id === 'cout-dedoublement'));
    assert.ok(!ici('creneau', creneau({ regime: 'commun' })).some((g) => g.id === 'cout-dedoublement'));
  });

  test('« deux tâches » n\'a pas de sens quand les deux groupes font la même chose', () => {
    assert.ok(!ici('creneau', creneau({ regime: 'commun' })).some((g) => g.id === 'deux-taches'));
    assert.ok(ici('creneau', creneau({ regime: 'decale' })).some((g) => g.id === 'deux-taches'));
  });

  test('la dictée ne se propose pas sur un créneau de sport', () => {
    const eps = ici('pile', creneau({ domaine: 'eps' })).map((g) => g.id);
    assert.ok(!eps.includes('typologie-dictee'));
    assert.ok(!eps.includes('ou-casse-le-probleme'));
    // Ce qui vaut pour n'importe quelle pile reste proposé.
    assert.ok(eps.includes('pile-ou-ca-bloque'));
  });

  test('sans objet, on ne filtre pas — on ne devine pas non plus', () => {
    // Une pile qu'on n'a pas encore rattachée à un créneau : tout est possible, et c'est
    // plus honnête que de choisir à la place de quelqu'un.
    const sansObjet = ici('pile').map((g) => g.id);
    assert.ok(sansObjet.includes('typologie-dictee') && sansObjet.includes('ou-casse-le-probleme'));
  });

  test('un ancrage inconnu rend une liste vide, pas une erreur', () => {
    assert.deepEqual(ici('nulle-part', {}), []);
  });
});

describe('les interdits qui touchent des enfants sont écrits', () => {
  test('aucun geste ne classe les élèves entre eux', () => {
    const suspects = GESTES.filter((g) => /\bclasser les élèves|\brang\b|moyenne/i.test(g.rend));
    assert.deepEqual(suspects.map((g) => g.id), []);
  });

  test('le geste d\'aide personnalisée refuse explicitement le diagnostic', () => {
    /*
     * C'est la limite la plus importante du lot : un trouble des apprentissages relève du
     * RASED, du médecin scolaire et de professionnels de santé. Un outil qui l'évoquerait,
     * même prudemment, pèserait sur le regard porté sur un enfant pendant des années.
     */
    const g = geste('ppre');
    assert.match(g.jamais, /diagnostic/);
    assert.match(g.jamais, /RASED|médecin scolaire/);
  });

  test('le bilan de période refuse de transformer une absence en résultat', () => {
    assert.match(geste('bilan-periode').jamais, /non atteint/);
    assert.match(geste('sans-trace').jamais, /estimation/);
  });

  test('le document laissé à un remplaçant protège les élèves', () => {
    assert.match(geste('cahier-remplacant').jamais, /sensibles.*élève|élève.*bureau/);
  });
});
