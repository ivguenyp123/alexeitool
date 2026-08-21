/*
 * Les prénoms ne sortent pas d'ici.
 *
 * Ces tests ne vérifient pas une fonction : ils vérifient une promesse faite à propos
 * d'enfants. C'est la raison pour laquelle ils sont écrits avant le premier agent.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { table, caviarder, restituer, restes } from '../lib/eleves.js';

const CLASSE = table([
  { prenom: 'Camille', niveau: 'CE2' },
  { prenom: 'Léa', niveau: 'CM1' },
  { prenom: 'Léandre', niveau: 'CE2' },
  { prenom: 'Marie-Lou', niveau: 'CM1' },
  { prenom: 'Marie', niveau: 'CE2' },
  { prenom: 'Tom', niveau: 'CM1' }
]);

describe('un prénom ne part pas', () => {
  test('le prénom est remplacé par un pseudonyme', () => {
    const r = caviarder('Tom a réussi les trois problèmes.', CLASSE);
    assert.ok(!/Tom/.test(r.texte), 'le prénom ne doit plus être là');
    assert.match(r.texte, /Élève \d\d a réussi/);
  });

  test('la casse et les accents ne le laissent pas passer', () => {
    /*
     * Une copie manuscrite retranscrite arrive dans n'importe quelle forme : capitales
     * d'imprimerie, accents perdus au scan. Un caviardage sensible à la casse ne servirait
     * à rien sur la matière réelle de cet outil.
     */
    for (const forme of ['LÉA', 'léa', 'Lea', 'LEA']) {
      const r = caviarder(`${forme} n'a pas fini.`, CLASSE);
      assert.ok(!new RegExp(forme, 'i').test(r.texte), `« ${forme} » a fui`);
    }
  });

  test('un prénom PLUS LONG n'
    + ' est pas coupé par un plus court', () => {
    // « Marie » ne doit pas manger le début de « Marie-Lou » et laisser « -Lou » en clair.
    const r = caviarder('Marie-Lou et Marie ont travaillé ensemble.', CLASSE);
    assert.ok(!/Lou/.test(r.texte), 'le reste de « Marie-Lou » est resté en clair');
    assert.ok(!/Marie/.test(r.texte));
  });

  test('un prénom n\'en abîme pas un autre qui le contient', () => {
    // « Léa » ne doit pas transformer « Léandre » en « Élève 03ndre ».
    const r = caviarder('Léandre a aidé Léa.', CLASSE);
    assert.ok(!/ndre/.test(r.texte.replace(/Léandre/g, '')), 'un prénom a été tronqué');
    assert.ok(!/Léandre|Léa/.test(r.texte));
    assert.equal(r.combien, 2);
  });

  test('deux enfants qui portent le même prénom ne se confondent pas', () => {
    /*
     * Remplacer par l'un des deux inventerait une information — et sur un bilan, cette
     * information désignerait le mauvais enfant. On rend l'ambiguïté visible.
     */
    const deux = table([{ prenom: 'Jade' }, { prenom: 'Jade' }, { prenom: 'Tom' }]);
    const r = caviarder('Jade a progressé.', deux);
    assert.match(r.texte, /Élève \d\d ou \d\d/);
  });

  test('ce qui a été remplacé est DIT, pas avalé', () => {
    // Sans ce compte, personne ne peut vérifier que le caviardage a fonctionné — et un
    // caviardage qu'on ne peut pas vérifier ne vaut rien.
    const r = caviarder('Tom, Tom et Léa.', CLASSE);
    assert.equal(r.combien, 3);
    assert.deepEqual(r.remplaces[0], { prenom: 'Tom', n: 2 });
  });
});

describe('l\'aller-retour', () => {
  test('l\'enseignant relit des prénoms, le modèle n\'a vu que des numéros', () => {
    const envoye = caviarder('Tom bloque sur la soustraction.', CLASSE);
    // ce que le modèle rend, en reprenant le pseudonyme
    const repondu = envoye.texte.replace('bloque sur', 'a besoin de revoir');
    const affiche = restituer(repondu, CLASSE);
    assert.match(affiche, /^Tom a besoin de revoir/);
    assert.ok(!/Tom/.test(envoye.texte), 'le trajet aller ne contenait aucun prénom');
  });

  test('le pseudonyme est STABLE d\'un envoi à l\'autre', () => {
    // Un pseudonyme qui changerait interdirait de suivre un enfant dans le temps — soit
    // exactement ce à quoi sert l'outil.
    const a = caviarder('Tom.', CLASSE).texte;
    const b = caviarder('Tom encore.', CLASSE).texte;
    assert.equal(a.match(/Élève \d\d/)[0], b.match(/Élève \d\d/)[0]);
  });

  test('un élève ajouté en cours d\'année ne renumérote pas la classe', () => {
    /*
     * Sans ça, un bilan écrit en novembre désignerait d'autres enfants en mars. Le
     * classement est alphabétique, donc l'arrivant s'insère sans décaler ceux d'avant —
     * sauf ceux qui viennent après lui, ce que ce test délimite honnêtement.
     */
    const avant = table([{ prenom: 'Ana' }, { prenom: 'Zoé' }]);
    const apres = table([{ prenom: 'Ana' }, { prenom: 'Zoé' }, { prenom: 'Yanis' }]);
    assert.equal(avant.parPrenom.get('ana')[0].pseudo, apres.parPrenom.get('ana')[0].pseudo);
  });
});

describe('ce que le module NE garantit pas', () => {
  test('un prénom hors classe n\'est pas couvert — et il est signalé', () => {
    /*
     * Un enfant qui écrit le prénom de son frère dans une rédaction ne peut pas être
     * couvert par une liste de classe, et aucune liste ne le pourrait. Le module refuse
     * donc de se déclarer complet : il rend les mots suspects.
     */
    const r = caviarder('Tom parle de Gabriel, son frère.', CLASSE);
    assert.ok(/Gabriel/.test(r.texte), 'on ne prétend pas l\'avoir attrapé');
    const suspects = restes(r.texte, CLASSE).map((x) => x.mot);
    assert.ok(suspects.includes('Gabriel'), 'mais on le SIGNALE');
  });

  test('les mots courants capitalisés ne sont pas signalés comme prénoms', () => {
    // Sinon la liste des suspects contiendrait « Lundi » et « Dictée » à chaque texte,
    // et plus personne ne la lirait — ce qui reviendrait à ne pas l'avoir.
    const suspects = restes('Lundi, la Dictée était difficile. Bravo à tous.', CLASSE)
      .map((x) => x.mot);
    for (const m of ['Lundi', 'Dictée', 'Bravo']) {
      assert.ok(!suspects.includes(m), `« ${m} » signalé à tort`);
    }
  });

  test('un texte vide ou une table vide ne lèvent pas', () => {
    assert.equal(caviarder('', CLASSE).texte, '');
    assert.equal(caviarder('Tom.', table([])).texte, 'Tom.');
    assert.equal(caviarder(null, CLASSE).combien, 0);
  });
});
