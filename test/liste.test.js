import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { lireLaListe, cequiManque, ecrireLaListe } from '../lib/liste.js';
import { table, restituer } from '../lib/eleves.js';
import { pile, deposer, direLaPile } from '../lib/pile.js';

describe('la liste de classe se colle', () => {
  test('un prénom par ligne suffit', () => {
    const { eleves } = lireLaListe('Camille\nLéa\nTom');
    assert.equal(eleves.length, 3);
    assert.deepEqual(eleves.map((e) => e.prenom), ['Camille', 'Léa', 'Tom']);
  });

  test('le niveau est lu quand il est écrit, et JAMAIS deviné', () => {
    const { eleves } = lireLaListe('Camille CE2\nLéa CM1\nTom');
    assert.equal(eleves[0].niveau, 'CE2');
    assert.equal(eleves[1].niveau, 'CM1');
    // Répartir Tom au hasard servirait les attendus du mauvais cycle, sans que ça se voie.
    assert.equal(eleves[2].niveau, '');
    assert.equal(cequiManque(eleves).sansNiveau.length, 1);
    assert.equal(cequiManque(eleves).complet, false);
  });

  test('« DUPONT Arthur » : les capitales sont le nom, pas le prénom', () => {
    // Les exports d'établissement écrivent le nom devant, en majuscules. Se tromper ici
    // ferait chercher « DUPONT » dans les copies — un prénom qui n'y est jamais.
    const { eleves } = lireLaListe('DUPONT Arthur CM1');
    assert.equal(eleves[0].prenom, 'Arthur');
    assert.equal(eleves[0].nom, 'DUPONT');
  });

  test('les numérotations et séparateurs d\'export sont absorbés', () => {
    const { eleves } = lireLaListe('1. Camille CE2\n03 - Léa, CE2\nTom;CM1');
    assert.deepEqual(eleves.map((e) => e.prenom), ['Camille', 'Léa', 'Tom']);
    assert.deepEqual(eleves.map((e) => e.niveau), ['CE2', 'CE2', 'CM1']);
  });

  test('une ligne collée deux fois est écartée, et on dit laquelle', () => {
    const { eleves, ecartees } = lireLaListe('Camille CE2\nCamille CE2');
    assert.equal(eleves.length, 1);
    assert.equal(ecartees.length, 1);
    assert.match(ecartees[0].pourquoi, /déjà dans la liste/);
  });

  test('deux enfants du même prénom sont GARDÉS, et signalés', () => {
    // C'est la réalité d'une classe. Leurs copies ne se rattacheront pas toutes seules,
    // et il vaut mieux le savoir en septembre qu'au vingt-troisième dépôt.
    const { eleves, doublons } = lireLaListe('Camille Rossi CM1\nCamille Bernard CE2');
    assert.equal(eleves.length, 2);
    assert.deepEqual(doublons, [{ prenom: 'Camille', combien: 2 }]);
  });

  test('la liste se relit telle qu\'on l\'a corrigée', () => {
    const t = 'Camille CE2\nDUPONT Arthur CM1';
    const { eleves } = lireLaListe(t);
    assert.deepEqual(lireLaListe(ecrireLaListe(eleves)).eleves, eleves);
  });
});

describe('les numéros redeviennent des prénoms, même mal écrits', () => {
  const t = table(Array.from({ length: 12 }, (_, i) => ({ prenom: `P${i + 1}` })));
  // P1…P12 triés : P1, P10, P11, P12, P2, P3… — on lit les pseudonymes de la table.
  const nom = (n) => t.parPseudo.get(`Élève ${String(n).padStart(2, '0')}`).prenom;

  test('la forme exacte', () => {
    assert.equal(restituer('Élève 07 a réussi.', t), `${nom(7)} a réussi.`);
  });

  test('le pluriel et la liste — le cas qui a échoué en vrai', () => {
    // Mesuré sur une vraie dictée : « Élèves 10 et 07 (copies identiques) » ressortait
    // tel quel, et l'enseignant lisait des numéros.
    assert.equal(restituer('Élèves 10 et 07 (copies identiques)', t),
                 `${nom(10)} et ${nom(7)} (copies identiques)`);
  });

  test('le déterminant est conservé, la phrase reste française', () => {
    assert.equal(restituer('Les élèves 3, 5 et 9 butent.', t),
                 `Les élèves ${nom(3)}, ${nom(5)} et ${nom(9)} butent.`);
    assert.equal(restituer('À dire aux élèves 3 et 5.', t),
                 `À dire aux élèves ${nom(3)} et ${nom(5)}.`);
  });

  test('« n° » et la minuscule', () => {
    assert.equal(restituer('élève n° 02 : correct', t), `${nom(2)} : correct`);
  });

  test('un nombre NU n\'est jamais remplacé', () => {
    // « 12 erreurs » ne doit pas devenir « P… erreurs » : un faux positif ici rendrait
    // la réponse illisible.
    assert.equal(restituer('Il y a 12 erreurs dans le texte.', t),
                 'Il y a 12 erreurs dans le texte.');
    assert.equal(restituer('Élève 07 a fait 12 erreurs.', t), `${nom(7)} a fait 12 erreurs.`);
  });

  test('un numéro hors classe laisse la phrase intacte', () => {
    assert.equal(restituer('Élèves 3 et 40', t), 'Élèves 3 et 40');
  });
});

describe('ce qui ne doit PAS atteindre le fournisseur', () => {
  const CLASSE = table([{ prenom: 'Camille' }, { prenom: 'Arthur' }, { prenom: 'Léa' }]);

  test('le nom du fichier d\'une copie orpheline ne sort pas', () => {
    /*
     * Les copies s'appellent par le prénom de l'enfant. Ce prénom-là n'est pas dans le
     * texte : il est dans l'étiquette, et il traversait le caviardage sans être touché.
     */
    const p = pile({});
    deposer(p, { nom: 'mathis-cm1.txt', texte: 'une production' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE);
    assert.doesNotMatch(texte, /mathis/i, 'le nom du fichier est une fuite');
    assert.match(texte, /Copie 1 \(élève non identifié\)/);
  });

  test('les copies orphelines sont numérotées dans l\'ordre', () => {
    const p = pile({});
    for (const n of ['a.txt', 'b.txt']) deposer(p, { nom: n, texte: 'production' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE);
    assert.match(texte, /Copie 1 \(/);
    assert.match(texte, /Copie 2 \(/);
  });
});

describe('le texte attendu — sans lui, on ne compte rien', () => {
  const CLASSE = table([{ prenom: 'Camille' }]);

  test('absent : interdiction explicite de compter et de reconstituer', () => {
    // C'est ce qui a produit « a trouvé les 12 erreurs du texte » sur un exercice
    // dont le texte n'avait jamais été donné.
    const p = pile({});
    deposer(p, { nom: 'camille.txt', texte: 'Le chat dor.' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE);
    assert.match(texte, /LE TEXTE ATTENDU N'A PAS ÉTÉ DONNÉ/);
    assert.match(texte, /tu ne comptes AUCUN total d'erreurs/);
    assert.match(texte, /ne reconstitues ni l'énoncé/);
  });

  test('présent : il devient LA référence', () => {
    const p = pile({ reference: 'Le chat dort sur le tapis.' });
    deposer(p, { nom: 'camille.txt', texte: 'Le chat dor.' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE);
    assert.match(texte, /LE TEXTE ATTENDU — c'est LA référence/);
    assert.match(texte, /Le chat dort sur le tapis\./);
  });

  test('il est caviardé comme le reste', () => {
    const p = pile({ reference: 'Camille joue dans la cour.' });
    deposer(p, { nom: 'x.txt', texte: 'production' }, CLASSE);
    assert.doesNotMatch(direLaPile(p, CLASSE).texte, /Camille/);
  });
});
