/*
 * Les attendus — déposés, jamais récités.
 *
 * Ce qui est vérifié : qu'un domaine sans texte reste VIDE et le dise, et qu'un attendu
 * porte toujours sa provenance. Le reste — la qualité du découpage — se juge sur les
 * vrais documents, pas ici.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CYCLE, lireAttendus, pour, couverture, manquants,
         direLesAttendus } from '../lib/attendus.js';

const SRC = 'éduscol, relevé le 2026-08-21';
const brut = `ATTENDUS DE FIN D'ANNÉE
- Lire à voix haute avec fluidité un texte d'une dizaine de lignes.
· Écrire un texte de cinq à dix lignes en respectant la ponctuation.
p. 3
  Accorder le verbe avec son sujet dans des cas simples.
`;

describe('lire un texte officiel déposé', () => {
  test('les puces de toutes les formes sont retirées', () => {
    const { attendus } = lireAttendus(brut, { cycle: 2, domaine: 'francais', source: SRC });
    assert.equal(attendus.length, 3);
    for (const a of attendus) assert.ok(!/^[-–—•*·]/.test(a.texte), a.texte);
  });

  test('chaque attendu porte sa PROVENANCE', () => {
    // Un attendu sans source est un attendu qu'on ne peut pas contester — donc un attendu
    // qu'on croira sur parole, ce que tout ce projet refuse.
    const { attendus } = lireAttendus(brut, { cycle: 2, domaine: 'francais', source: SRC });
    for (const a of attendus) assert.equal(a.source, SRC);
  });

  test('les titres et les fragments sont ÉCARTÉS, et rendus', () => {
    // Rendus, pas jetés : quelqu'un qui dépose trois pages et obtient huit attendus doit
    // pouvoir constater que soixante lignes sont parties, plutôt que de croire que le
    // programme en compte huit.
    const { ecartees } = lireAttendus(brut, { cycle: 2, domaine: 'francais' });
    const dits = ecartees.map((e) => e.ligne);
    assert.ok(dits.includes('ATTENDUS DE FIN D\'ANNÉE'));
    assert.ok(dits.includes('p. 3'));
    assert.ok(ecartees.some((e) => /capitales/.test(e.pourquoi)));
  });

  test('un texte vide ne rend rien, et ne lève pas', () => {
    assert.deepEqual(lireAttendus('', {}).attendus, []);
    assert.deepEqual(lireAttendus(null, {}).attendus, []);
  });
});

describe('ce qui n\'est pas déposé reste vide, visiblement', () => {
  const registre = lireAttendus(brut, { cycle: 2, domaine: 'francais', source: SRC }).attendus;

  test('le CE2 est en cycle 2, le CM1 en cycle 3', () => {
    assert.deepEqual(CYCLE, { CE2: 2, CM1: 3 });
  });

  test('un domaine sans texte ne rend aucun attendu — pas un attendu vague', () => {
    assert.deepEqual(pour(registre, 'sciences', 'CM1'), []);
    assert.equal(pour(registre, 'francais', 'CE2').length, 3);
    // Le français du CM1 est en cycle 3 : le texte du CE2 ne vaut pas pour lui.
    assert.deepEqual(pour(registre, 'francais', 'CM1'), []);
  });

  test('la couverture dit ce qu\'il RESTE à déposer', () => {
    const m = manquants(registre);
    assert.ok(m.some((x) => x.niveau === 'CE2' && x.domaine === 'mathematiques'));
    assert.ok(m.some((x) => x.niveau === 'CM1' && x.domaine === 'sciences'));
    assert.ok(!m.some((x) => x.niveau === 'CE2' && x.domaine === 'francais'));
    assert.ok(couverture(registre).CE2.length > 0);
  });
});

describe('ce qui part au modèle', () => {
  const registre = lireAttendus(brut, { cycle: 2, domaine: 'francais', source: SRC }).attendus;
  const creneau = { regime: 'decale', CE2: { domaine: 'francais' }, CM1: { domaine: 'sciences' } };

  test('sans aucun attendu, le texte INTERDIT d\'en inventer', () => {
    const { texte, combien } = direLesAttendus([], creneau);
    assert.equal(combien, 0);
    assert.match(texte, /Aucun texte officiel n'a été déposé/);
    assert.match(texte, /ni de mémoire, ni approximativement/);
  });

  test('avec des attendus, ils partent — et l\'interdiction d\'en ajouter reste', () => {
    const { texte, combien } = direLesAttendus(registre, creneau);
    assert.equal(combien, 3);
    assert.match(texte, /Lire à voix haute avec fluidité/);
    assert.match(texte, /Tu n'en ajoutes aucun autre/);
    assert.match(texte, /source : éduscol/);
  });

  test('le niveau qui n\'a RIEN est nommé — on ne devine pas pour lui', () => {
    /*
     * Une fiche qui traite bien un groupe et devine l'autre est pire qu'une fiche qui
     * traite mal les deux : la moitié fausse a l'air aussi sûre que la moitié juste.
     */
    const { texte } = direLesAttendus(registre, creneau);
    assert.match(texte, /Rien n'a été déposé pour CM1/);
    assert.match(texte, /tu n'inventes rien et tu le DIS/);
  });
});
