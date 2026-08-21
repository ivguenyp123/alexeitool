/*
 * Ce qui a le droit de partir.
 *
 * Ces vérifications tournent sans clé et sans réseau : `peutEnvoyer` décide avant tout
 * appel. C'est ce qui permet de tester le refus qui compte — celui d'un envoi que la page
 * n'a pas déclaré caviardé.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { FOURNISSEUR, MAX_CARACTERES, peutEnvoyer, requete, reponse } from '../lib/appel.js';

const bon = { texte: 'Élève 07 a écrit : les chien court.', caviarde: true };

describe('rien ne part sans clé', () => {
  test('sans clé, le refus DIT où la mettre', () => {
    // Un refus qui ne dit pas quoi faire est un refus qu'on contourne — en collant la clé
    // dans le premier fichier venu.
    const r = peutEnvoyer({ cle: '', corps: bon });
    assert.equal(r.ok, false);
    assert.equal(r.code, 503);
    assert.match(r.dit, /\.env/);
    assert.match(r.dit, new RegExp(FOURNISSEUR.variable));
    assert.match(r.dit, /ignoré par git/);
  });

  test('avec clé et un envoi correct, ça passe', () => {
    assert.deepEqual(peutEnvoyer({ cle: 'sk-test', corps: bon }), { ok: true });
  });
});

describe('rien ne part sans caviardage déclaré', () => {
  test('un envoi non marqué est REFUSÉ', () => {
    /*
     * C'est une déclaration, pas une preuve : le serveur ne connaît pas la classe — elle
     * vit dans le navigateur et n'a aucune raison d'en sortir. Ce que le contrôle attrape
     * quand même : le jour où quelqu'un branche un écran en oubliant l'étape, l'envoi est
     * refusé au lieu de partir. L'oubli devient visible au lieu d'être une fuite.
     */
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

  test('au-delà de la borne, c\'est une erreur de manipulation', () => {
    const r = peutEnvoyer({ cle: 'sk-test',
                            corps: { texte: 'a'.repeat(MAX_CARACTERES + 1), caviarde: true } });
    assert.equal(r.ok, false);
    assert.equal(r.code, 413);
    assert.match(r.dit, /erreur de manipulation/);
  });

  test('une pile de copies tient largement dans la borne', () => {
    // Vingt-six copies de trois cents mots font environ cinquante mille caractères.
    assert.ok(MAX_CARACTERES > 60_000);
  });
});

describe('ce qui part et ce qui revient', () => {
  test('la requête demande peu d\'invention', () => {
    // On demande des reformulations et des classements. Un modèle bavard produit ici des
    // séances plausibles et fausses — le pire résultat possible pour un enseignant pressé.
    const q = requete({ texte: 'x', consigne: 'y' });
    assert.equal(q.model, FOURNISSEUR.modele);
    assert.ok(q.temperature <= 0.4);
    assert.equal(q.messages[0].role, 'system');
  });

  test('sans consigne, aucun message système vide n\'est ajouté', () => {
    assert.equal(requete({ texte: 'x' }).messages.length, 1);
  });

  test('on ne garde que le texte et le compte de jetons', () => {
    const r = reponse({ choices: [{ message: { content: 'voilà' } }],
                        usage: { total_tokens: 42 }, id: 'req-secret', system_fingerprint: 'x' });
    assert.deepEqual(r, { ok: true, texte: 'voilà', jetons: 42 });
    assert.ok(!('id' in r) && !('system_fingerprint' in r));
  });

  test('une réponse inattendue ne devient pas un texte vide', () => {
    // Rendre '' ferait afficher un résultat blanc comme si le modèle n'avait rien à dire,
    // alors que l'appel a échoué.
    assert.equal(reponse({}).ok, false);
    assert.equal(reponse({ choices: [] }).ok, false);
    assert.equal(reponse(null).ok, false);
  });
});
