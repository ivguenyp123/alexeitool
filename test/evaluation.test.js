/*
 * « Non évalué n'est pas non atteint. »
 *
 * La règle est facile à énoncer et facile à trahir : elle se trahit au moment où un écran
 * doit remplir une case et où la case vide est plus laide que la case rouge. Ces tests
 * sont là pour que ça ne puisse pas arriver en silence.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NIVEAUX, NON_EVALUE, releve, etat, repartition, trous,
         direLAttendu } from '../lib/evaluation.js';

const ELEVES = ['Élève 01', 'Élève 02', 'Élève 03', 'Élève 04'];
const ATT = 'C2-FR-orthographe-accords';

describe('l\'absence de relevé reste une absence', () => {
  test('sans aucun relevé, l\'état est NON ÉVALUÉ — pas « non atteint »', () => {
    const e = etat([], 'Élève 01', ATT);
    assert.equal(e.niveau, NON_EVALUE);
    assert.notEqual(e.niveau, 'non_atteint');
    assert.equal(e.observations, 0);
  });

  test('`non_evalue` n\'est PAS une valeur du vocabulaire', () => {
    /*
     * S'il l'était, tout le code qui parcourt `NIVEAUX` le traiterait comme un cinquième
     * résultat — dans un tableau, dans un compte, dans un bilan. C'est précisément le
     * glissement qu'on interdit.
     */
    assert.ok(!NIVEAUX.includes(NON_EVALUE));
    assert.deepEqual(NIVEAUX, ['non_atteint', 'partiellement', 'atteint', 'depasse']);
  });

  test('un élève absent le jour de l\'évaluation n\'a pas échoué', () => {
    const r = [releve({ eleve: 'Élève 01', attendu: ATT, niveau: 'atteint', date: '2026-03-12' })];
    const absent = etat(r, 'Élève 02', ATT);
    assert.equal(absent.niveau, NON_EVALUE);
    const par = repartition(r, ELEVES, ATT);
    assert.equal(par.non_atteint, 0, 'personne ne doit tomber en « non atteint » par défaut');
    assert.equal(par[NON_EVALUE], 3);
  });

  test('la phrase dit que les non-évalués ne comptent dans AUCUN chiffre', () => {
    const r = [releve({ eleve: 'Élève 01', attendu: ATT, niveau: 'atteint', date: '2026-03-12' })];
    const p = direLAttendu(r, ELEVES, ATT, 'Les accords dans le groupe nominal');
    assert.match(p, /3 élève\(s\) N'ONT PAS été évalués/);
    assert.match(p, /surtout pas dans « non atteints »/);
  });

  test('aucun élève évalué : la phrase refuse de conclure quoi que ce soit', () => {
    const p = direLAttendu([], ELEVES, ATT, 'Les accords');
    assert.match(p, /AUCUN élève n'a été évalué/);
    assert.match(p, /mesure qui n'existe pas/);
    assert.match(p, /Rien ne peut en être conclu/);
  });
});

describe('aucune moyenne, aucun rang', () => {
  test('le module ne rend jamais de nombre agrégé sur les niveaux', () => {
    /*
     * Convertir les quatre niveaux en 0-1-2-3 et en faire une moyenne donnerait un chiffre
     * faux et cru : il additionnerait des attendus qui n'ont ni le même poids, ni le même
     * nombre d'observations, ni la même date. Et il permettrait de classer des enfants.
     */
    const r = repartition([], ELEVES, ATT);
    for (const v of Object.values(r)) {
      assert.ok(Number.isInteger(v), 'seulement des COMPTES, jamais de fraction');
    }
    assert.ok(!('moyenne' in r) && !('score' in r) && !('pourcentage' in r));
  });

  test('le dernier relevé prime — on ne moyenne pas un parcours', () => {
    // Un enfant qui ne savait pas en octobre et qui sait en mai SAIT. Moyenner lui ferait
    // payer ses débuts, ce qui est le contraire d'une évaluation par compétences.
    const r = [
      releve({ eleve: 'Élève 01', attendu: ATT, niveau: 'non_atteint', date: '2025-10-04' }),
      releve({ eleve: 'Élève 01', attendu: ATT, niveau: 'partiellement', date: '2026-01-15' }),
      releve({ eleve: 'Élève 01', attendu: ATT, niveau: 'atteint', date: '2026-05-20' })
    ];
    const e = etat(r, 'Élève 01', ATT);
    assert.equal(e.niveau, 'atteint');
    assert.equal(e.observations, 3);
    assert.equal(e.depuis, '2026-05-20');
  });

  test('une seule observation est signalée comme FRAGILE, sans changer le niveau', () => {
    /*
     * « Atteint, vu une fois en novembre » et « atteint, vu quatre fois la semaine
     * dernière » sont deux situations différentes. Le doute porte sur la MESURE, pas sur
     * l'enfant — donc on le dit sans toucher au niveau.
     */
    const un = etat([releve({ eleve: 'Élève 01', attendu: ATT, niveau: 'atteint', date: '2026-01-08' })],
                    'Élève 01', ATT);
    assert.equal(un.niveau, 'atteint');
    assert.equal(un.fragile, true);
  });

  test('un niveau inventé n\'entre pas dans le registre', () => {
    assert.equal(releve({ eleve: 'Élève 01', attendu: ATT, niveau: 'presque' }), null);
    assert.equal(releve({ eleve: 'Élève 01', attendu: ATT, niveau: 'B+' }), null);
    assert.equal(releve({ eleve: 'Élève 01', attendu: ATT, niveau: 12 }), null);
  });
});

describe('ce dont on n\'a aucune trace', () => {
  const ATTENDUS = ['A', 'B', 'C', 'D'];
  const R = [
    releve({ eleve: 'Élève 01', attendu: 'A', niveau: 'atteint', date: '2026-01-10' }),
    releve({ eleve: 'Élève 01', attendu: 'B', niveau: 'atteint', date: '2026-01-10' }),
    releve({ eleve: 'Élève 01', attendu: 'C', niveau: 'partiellement', date: '2026-02-01' }),
    releve({ eleve: 'Élève 02', attendu: 'A', niveau: 'partiellement', date: '2026-01-10' }),
    releve({ eleve: 'Élève 03', attendu: 'A', niveau: 'atteint', date: '2026-01-10' }),
    releve({ eleve: 'Élève 04', attendu: 'A', niveau: 'non_atteint', date: '2026-01-10' })
  ];

  test('un attendu que PERSONNE n\'a passé ressort comme tel', () => {
    const t = trous(R, ELEVES, ATTENDUS);
    const d = t.parAttendu.find((x) => x.attendu === 'D');
    assert.ok(d, '« D » doit ressortir');
    assert.equal(d.jamais, true);
    assert.equal(d.vus, 0);
  });

  test('l\'élève sur lequel on n\'a presque rien ressort — c\'est souvent le discret', () => {
    /*
     * Le trou d'attention ne se voit nulle part ailleurs : l'enfant qui ne gêne pas est
     * celui qu'on évalue le moins, et personne ne s'en aperçoit avant juin.
     */
    const t = trous(R, ELEVES, ATTENDUS);
    assert.equal(t.parEleve[0].vus, 1, 'les moins observés en tête');
    assert.ok(t.discrets.some((x) => x.eleve === 'Élève 02'));
    assert.ok(!t.discrets.some((x) => x.eleve === 'Élève 01'), 'celui qu\'on suit n\'y est pas');
  });

  test('un attendu couvert pour toute la classe ne ressort pas', () => {
    const t = trous(R, ELEVES, ['A']);
    assert.deepEqual(t.parAttendu, []);
  });
});
