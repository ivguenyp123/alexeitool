/*
 * Ce qui a le droit de partir.
 *
 * Le client DeepSeek est porté tel quel de la plateforme technique et n'est pas retesté
 * ici : il l'a été là-bas, en appels réels. Ce qui est propre à ce produit, c'est la
 * garde — parce qu'ailleurs on envoie du code, et ici du travail d'enfants.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_CARACTERES, peutEnvoyer } from '../lib/garde.js';

const bon = { texte: 'Élève 07 a écrit : les chien court.', caviarde: true };

describe('rien ne part sans clé', () => {
  test('sans clé, le refus DIT où la mettre', () => {
    // Un refus qui ne dit pas quoi faire est un refus qu'on contourne — en collant la clé
    // dans le premier fichier venu.
    const r = peutEnvoyer({ cle: '', corps: bon });
    assert.equal(r.ok, false);
    assert.equal(r.code, 503);
    assert.match(r.dit, /DEEPSEEK_API_KEY/);
    assert.match(r.dit, /ignoré par git/);
  });

  test('avec clé et un envoi correct, ça passe', () => {
    assert.deepEqual(peutEnvoyer({ cle: 'sk-test', corps: bon }), { ok: true });
  });
});

describe('rien ne part sans caviardage déclaré', () => {
  test('un envoi non marqué est REFUSÉ', () => {
    const r = peutEnvoyer({ cle: 'sk-test', corps: { texte: 'Tom a écrit…' } });
    assert.equal(r.ok, false);
    assert.match(r.dit, /caviardé/);
    assert.match(r.dit, /travail d'enfants/);
  });

  test('« caviarde » doit valoir VRAI, pas juste être présent', () => {
    // Sans ça, `caviarde: 'non'` passerait — une chaîne non vide est vraie en JavaScript,
    // et c'est exactement le genre de laxisme qui laisse fuir quelque chose.
    for (const v of ['non', 'false', 1, {}, 'oui']) {
      assert.equal(peutEnvoyer({ cle: 'sk-test', corps: { texte: 'x', caviarde: v } }).ok,
                   false, `« ${JSON.stringify(v)} » aurait dû être refusé`);
    }
  });
});

describe('les bornes', () => {
  test('un envoi vide est refusé', () => {
    assert.equal(peutEnvoyer({ cle: 'sk-test', corps: { texte: '   ', caviarde: true } }).ok, false);
  });

  test('au-delà de la borne, c\'est une fausse manœuvre', () => {
    const r = peutEnvoyer({ cle: 'sk-test',
                            corps: { texte: 'a'.repeat(MAX_CARACTERES + 1), caviarde: true } });
    assert.equal(r.code, 413);
    assert.match(r.dit, /fausse manœuvre/);
  });

  test('une pile de copies tient largement dans la borne', () => {
    // Vingt-six copies de trois cents mots font environ cinquante mille caractères.
    assert.ok(MAX_CARACTERES > 60_000);
  });
});
