import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { lireLaCorrection, lireUneErreur, estUneCorrection, affiner,
         apparier } from '../lib/correction.js';
import { marquer, parNature } from '../lib/marquage.js';
import { documentDeCorrection } from '../lib/document.js';
import { nu } from '../lib/miseenforme.js';
import { table } from '../lib/eleves.js';
import { pile, deposer } from '../lib/pile.js';
import { GESTES, TOUJOURS, consigneDe } from '../lib/gestes.js';

const REPONSE = `--- COPIE Élève 01
dor -> dort | accord sujet-verbe
tapi -> tapis | mot mal su
> Tu as écrit toute la phrase, bravo. Reprends l'accord du verbe.

--- COPIE Élève 02
> Aucune faute.

CE QUI REVIENT DANS LA CLASSE
- accord sujet-verbe : 1 élève`;

describe('lire ce que le modèle a rendu', () => {
  test('les blocs, les fautes et le mot', () => {
    const lu = lireLaCorrection(REPONSE);
    assert.equal(lu.copies.length, 2);
    assert.equal(lu.copies[0].qui, 'Élève 01');
    assert.deepEqual(lu.copies[0].erreurs[0],
      { ecrit: 'dor', attendu: 'dort', nature: 'accord sujet-verbe' });
    assert.match(lu.copies[0].mot, /Tu as écrit toute la phrase/);
    assert.equal(lu.copies[1].erreurs.length, 0);
  });

  test('ce qui n\'appartient à aucun bloc est GARDÉ', () => {
    // Un analyseur qui avale la moitié de la réponse est pire que pas d'analyseur : on
    // ne sait même pas ce qu'on a perdu.
    assert.match(lireLaCorrection(REPONSE).prose, /CE QUI REVIENT DANS LA CLASSE/);
  });

  test('les variantes de flèche et de séparateur passent', () => {
    // Un modèle ne rend jamais tout à fait la forme demandée.
    for (const ligne of ['dor → dort | accord', 'dor => dort — accord',
                         '* dor -> dort | accord', '**dor** -> **dort** | accord']) {
      const lu = lireLaCorrection(`--- COPIE Élève 01\n${ligne}`);
      assert.equal(lu.copies[0].erreurs.length, 1, `« ${ligne} » n'a pas été lue`);
      assert.equal(lu.copies[0].erreurs[0].ecrit, 'dor');
      assert.equal(lu.copies[0].erreurs[0].attendu, 'dort');
    }
  });

  test('« === COPIE 2 » et « COPIE : Élève 03 » ouvrent aussi un bloc', () => {
    assert.equal(lireLaCorrection('=== COPIE 2\nx -> y').copies[0].qui, '2');
    assert.equal(lireLaCorrection('COPIE : Élève 03\nx -> y').copies[0].qui, 'Élève 03');
  });

  test('rien de reconnu : on le dit, on ne prétend pas', () => {
    const lu = lireLaCorrection('Une réponse en prose, sans aucun bloc.');
    assert.equal(lu.reconnu, false);
    assert.equal(lu.prose, 'Une réponse en prose, sans aucun bloc.');
  });
});

describe('la forme que le modèle rend vraiment', () => {
  /*
   * Relevé sur la première vraie dictée. La consigne demandait « dor -> dort | accord » ;
   * voilà ce qui est revenu. Exiger la forme était une erreur : on ne contrôle pas ce
   * qu'un modèle rend, on contrôle ce qu'on sait lire.
   */
  const VRAIE = `Le texte attendu manque. Je ne peux donc pas corriger la dictée.

Je relève uniquement les fautes certaines dans la copie de l'élève 08 :

— « Se matin » → erreur sur le déterminant (probablement « Ce »)
— « parte » → accord sujet/verbe (« Léo et sa petite sœur » → « partent »)
— « leurs cartable » → accord nom/adjectif (« leurs » → « leur » car un seul cartable)
— « une trousse bleu » → accord de l'adjectif de couleur (« bleue »)`;

  test('le mot correct est trouvé même derrière une seconde flèche', () => {
    const e = lireUneErreur('« parte » → accord sujet/verbe (« Léo et sa sœur » → « partent »)');
    assert.equal(e.ecrit, 'parte');
    assert.equal(e.attendu, 'partent');
    assert.equal(e.nature, 'accord sujet/verbe');
  });

  test('ou entre parenthèses, à la fin', () => {
    const e = lireUneErreur('« une trousse bleu » → accord de l\'adjectif (« bleue »)');
    assert.equal(e.attendu, 'bleue');
  });

  test('le groupe fautif est RESSERRÉ sur le mot qui change', () => {
    // « Se matin » → « Ce » : remplacer les deux mots écraserait « matin ». Poser le
    // rouge sur le mauvais mot est pire que ne pas le poser.
    assert.deepEqual(affiner('Se matin', 'Ce'), { ecrit: 'Se', attendu: 'Ce' });
    assert.deepEqual(affiner('leurs cartable', 'leur'), { ecrit: 'leurs', attendu: 'leur' });
  });

  test('trop loin : on garde le groupe entier plutôt que de viser au hasard', () => {
    const a = affiner('le chat noir', 'chien');
    assert.equal(a.ecrit, 'le chat noir');
  });

  test('une phrase ordinaire n\'est pas prise pour une correction', () => {
    assert.equal(lireUneErreur('Je relève uniquement les fautes certaines.'), null);
    assert.equal(lireUneErreur('a -> ' + 'x'.repeat(90)), null);
  });

  test('sans AUCUN bloc, les fautes sont quand même récupérées', () => {
    const lu = lireLaCorrection(VRAIE);
    assert.equal(lu.reconnu, true);
    assert.equal(lu.sansBloc, true);
    // Un seul numéro d'élève cité dans la réponse : c'est à lui qu'elles s'adressent.
    assert.equal(lu.copies[0].qui, 'Élève 08');
    assert.equal(lu.copies[0].erreurs.length, 4);
    assert.match(lu.prose, /Le texte attendu manque/);
  });

  test('deux élèves cités sans bloc : on ne tranche pas', () => {
    const lu = lireLaCorrection('Copies des élèves 03 et 07 :\n« dor » → « dort »');
    assert.equal(lu.copies[0].qui, '');
  });

  test('sans destinataire ET plusieurs copies, rien n\'est posé', () => {
    const r = apparier([{ qui: '', erreurs: [{ ecrit: 'a', attendu: 'b' }], mot: '' }],
                       [{ pseudo: 'Élève 01' }, { pseudo: 'Élève 02' }]);
    assert.equal(r.appariees.length, 0);
    assert.equal(r.orphelins.length, 1);
  });

  test('sans destinataire et UNE seule copie, c\'est la sienne', () => {
    const r = apparier([{ qui: '', erreurs: [{ ecrit: 'a', attendu: 'b' }], mot: '' }],
                       [{ pseudo: 'Élève 08' }]);
    assert.equal(r.appariees.length, 1);
  });
});

describe('poser les corrections sur la copie', () => {
  test('le mot fautif est barré, le bon écrit à côté', () => {
    const m = marquer('Le chat dor sur le tapi.', [
      { ecrit: 'dor', attendu: 'dort', nature: 'accord' },
      { ecrit: 'tapi', attendu: 'tapis', nature: 'lexique' }
    ]);
    assert.equal(m.posees, 2);
    const barres = m.morceaux.filter((x) => x.barre).map((x) => x.texte);
    assert.deepEqual(barres, ['dor', 'tapi']);
    // Rien du texte de l'élève ne disparaît.
    assert.equal(m.morceaux.filter((x) => !x.gras).map((x) => x.texte).join(''),
                 'Le chat dor sur le tapi.');
  });

  test('un mot court ne se pose pas à l\'intérieur d\'un mot long', () => {
    // « dor » dans « dormait » corrigerait le mauvais mot ET raterait la vraie faute.
    const m = marquer('Il dormait quand le chat dor.', [{ ecrit: 'dor', attendu: 'dort' }]);
    assert.equal(m.posees, 1);
    const i = m.morceaux.findIndex((x) => x.barre);
    assert.ok(m.morceaux.slice(0, i).map((x) => x.texte).join('').includes('dormait'));
  });

  test('les plus longs sont posés d\'abord', () => {
    const m = marquer('les chat noir', [
      { ecrit: 'chat', attendu: 'chats' }, { ecrit: 'chat noir', attendu: 'chats noirs' }
    ]);
    assert.equal(m.posees, 1);
    assert.equal(m.morceaux.find((x) => x.barre).texte, 'chat noir');
  });

  test('accents et casse ne font pas rater la pose', () => {
    const m = marquer("L'éléve travaille.", [{ ecrit: 'Éléve', attendu: 'élève' }]);
    assert.equal(m.posees, 1);
    assert.equal(m.morceaux.find((x) => x.barre).texte, 'éléve');
  });

  test('une faute sur un mot ABSENT n\'est pas posée au hasard', () => {
    /*
     * Le modèle annonce une faute sur un mot qu'il a mal recopié, ou imaginé. La poser
     * quelque part corromprait la copie ; la taire laisserait croire qu'elle n'existe pas.
     */
    const m = marquer('Le chat dort.', [{ ecrit: 'souris', attendu: 'souris' }]);
    assert.equal(m.posees, 0);
    assert.equal(m.introuvables.length, 1);
    assert.equal(m.morceaux.map((x) => x.texte).join(''), 'Le chat dort.');
  });

  test('deux fautes au même endroit ne se superposent pas', () => {
    const m = marquer('Le chat dor.', [
      { ecrit: 'dor', attendu: 'dort' }, { ecrit: 'dor', attendu: 'dorent' }
    ]);
    assert.equal(m.posees, 1);
    assert.equal(m.introuvables.length, 1);
  });

  test('un mot présent deux fois n\'est PAS corrigé au hasard', () => {
    /*
     * Mesuré sur une vraie copie : « et -> est » s'est posé sur le premier « et », celui
     * qui était juste. Le document inventait une faute et laissait la vraie intacte.
     */
    const m = marquer('des croquette et il et content', [{ ecrit: 'et', attendu: 'est' }]);
    assert.equal(m.posees, 0);
    assert.equal(m.ambigues.length, 1);
    assert.equal(m.ambigues[0].combien, 2);
    assert.equal(m.morceaux.map((x) => x.texte).join(''), 'des croquette et il et content');
  });

  test('avec le groupe de mots autour, la pose redevient possible', () => {
    const m = marquer('des croquette et il et content',
                      [{ ecrit: 'il et content', attendu: 'il est content' }]);
    assert.equal(m.posees, 1);
    assert.equal(m.morceaux.find((x) => x.barre).texte, 'il et content');
  });

  test('on compte par NATURE, jamais un total', () => {
    // « 7 erreurs » ne dit pas quoi retravailler ; « 4 accords » le dit.
    assert.deepEqual(parNature([{ nature: 'accord' }, { nature: 'accord' }, { nature: 'son' }]),
      [{ nature: 'accord', combien: 2 }, { nature: 'son', combien: 1 }]);
  });
});

describe('le document rendu : les copies, en entier', () => {
  const CLASSE = table([{ prenom: 'Camille' }, { prenom: 'Tom' }]);
  const laPile = () => {
    const p = pile({ exercice: 'Dictée du 12 mars' });
    deposer(p, { nom: 'camille.txt', texte: 'Le chat dor sur le tapi.' }, CLASSE);
    deposer(p, { nom: 'tom.txt', texte: 'Le chat dort sur le tapis.' }, CLASSE);
    return p;
  };

  test('chaque copie sort en entier, avec son prénom et ses corrections', () => {
    const d = documentDeCorrection(REPONSE, laPile(), CLASSE, { exercice: 'Dictée du 12 mars' });
    assert.equal(d.surLaCopie, true);
    const t = d.blocs.map(nu).join('\n');
    assert.match(t, /Camille/);
    assert.match(t, /Le chat dor dort sur le tapi tapis\./);
    assert.match(t, /Tom/);
    assert.match(t, /Le chat dort sur le tapis\./);
  });

  test('le rouge et la rature sont portés par les morceaux', () => {
    const d = documentDeCorrection(REPONSE, laPile(), CLASSE, {});
    const copie = d.blocs.find((b) => b.copie);
    assert.ok(copie.morceaux.some((m) => m.barre && m.rouge));
    assert.ok(copie.morceaux.some((m) => m.gras && m.rouge && m.texte.includes('dort')));
  });

  test('une correction adressée à une copie qu\'on n\'a pas est ÉCARTÉE', () => {
    // C'est la faute qui avait produit « Alice a parfaitement réussi » : une appréciation
    // pour un enfant qui n'avait rien rendu.
    const d = documentDeCorrection('--- COPIE Élève 09\nx -> y', laPile(), CLASSE, {});
    const t = d.blocs.map(nu).join('\n');
    assert.match(t, /ne correspond à aucune copie déposée/);
    assert.doesNotMatch(t, /Élève 09 :/);
  });

  test('une copie sans correction est signalée, pas oubliée', () => {
    const d = documentDeCorrection('--- COPIE Élève 01\ndor -> dort', laPile(), CLASSE, {});
    assert.match(d.blocs.map(nu).join('\n'), /Tom : aucune correction n'est revenue/);
  });

  test('le pied vient à la fin, et il est court', () => {
    const d = documentDeCorrection(REPONSE, laPile(), CLASSE,
      { exercice: 'Dictée', quand: '21 août 2026', modele: 'deepseek', copies: 2 });
    assert.match(nu(d.blocs[d.blocs.length - 1]), /Dictée · 2 copies · 21 août 2026/);
  });

  test('sans forme reconnue, on retombe sur la prose — jamais sur du vide', () => {
    const d = documentDeCorrection('Juste de la prose.', laPile(), CLASSE, {});
    assert.equal(d.surLaCopie, false);
    assert.match(d.blocs.map(nu).join('\n'), /Juste de la prose\./);
  });
});

describe('les règles communes partent avec chaque consigne', () => {
  test('elles sont ajoutées à tous les gestes, sans exception', () => {
    for (const g of GESTES) {
      assert.ok(consigneDe(g).includes(TOUJOURS), `${g.id} partirait sans les règles`);
      assert.ok(consigneDe(g).startsWith(g.consigne), `${g.id} : sa consigne doit rester en tête`);
    }
  });

  test('elles interdisent le préambule et la fausse conversation', () => {
    // « Point de vigilance préalable… dites-le-moi en commentaire » : les deux fautes
    // constatées sur une vraie séance, et les deux venaient d'ici.
    assert.match(TOUJOURS, /TU COMMENCES PAR LE TRAVAIL/);
    assert.match(TOUJOURS, /À COMPLÉTER/);
    assert.match(TOUJOURS, /dites-le-moi/);
    // `\\s+` : l'interdiction est coupée par un retour à la ligne, elle reste entière.
    assert.match(TOUJOURS, /aucune\s+question/);
  });
});

describe('une nature n\'est pas une correction', () => {
  /*
   * Relevé sur la deuxième vraie dictée. Au lieu de « parte → partent », le modèle a
   * écrit « 2. « parte » → « accord sujet/verbe (3e personne du pluriel). » » : il NOMME
   * la faute, il ne la corrige pas. Et comme la nature était entre guillemets, je la
   * prenais pour le mot correct — douze « signalé mais introuvable », et pas une marque.
   */
  test('la numérotation de liste ne fait plus partie du mot fautif', () => {
    assert.equal(lireUneErreur('12. « leur places » → « accord (nombre). »').ecrit,
                 'leur places');
  });

  test('une nature est reconnue comme telle, et ne devient pas la correction', () => {
    const e = lireUneErreur('3. « Ils marche » → « accord sujet/verbe (3e personne du pluriel). »');
    assert.equal(e.ecrit, 'Ils marche');
    assert.equal(e.attendu, '', 'on n\'invente pas le mot manquant');
    assert.match(e.nature, /accord sujet\/verbe/);
  });

  test('une vraie correction reste une correction', () => {
    assert.equal(estUneCorrection('dort'), true);
    assert.equal(estUneCorrection('il est content'), true);
    assert.equal(estUneCorrection('accord sujet/verbe (3e personne du pluriel).'), false);
    assert.equal(estUneCorrection('erreur sur l\'adjectif démonstratif'), false);
  });

  test('sans correction, le mot est SOULIGNÉ et sa nature écrite à côté', () => {
    // Le geste d'un enseignant qui laisse l'élève trouver. C'est déjà l'essentiel :
    // voir les fautes tout de suite.
    const m = marquer('Ils marche vite.',
                      [{ ecrit: 'Ils marche', attendu: '', nature: 'accord sujet/verbe' }]);
    assert.equal(m.posees, 1);
    const mot = m.morceaux.find((x) => x.souligne);
    assert.ok(mot, 'le mot fautif doit être souligné');
    assert.equal(mot.barre, undefined, 'on ne barre pas ce qu\'on ne remplace pas');
    assert.match(m.morceaux.map((x) => x.texte).join(''), /accord sujet\/verbe/);
  });

  test('avec correction, on barre et on écrit le bon mot', () => {
    const m = marquer('Le chat dor.', [{ ecrit: 'dor', attendu: 'dort' }]);
    assert.ok(m.morceaux.find((x) => x.barre));
    assert.ok(!m.morceaux.some((x) => x.souligne));
  });

  test('la vraie réponse, en entier : douze fautes, zéro perdue', () => {
    const copie = 'Se matin, Léo et sa petite sœur parte à l\'école. Ils marche doucement '
      + 'sous la pluie. Dans leurs cartable, ils ont des cahier, une trousse bleu et deux '
      + 'livre.';
    const lignes = [
      '1. « Se matin » → « erreur sur l\'adjectif démonstratif (orthographe lexicale). »',
      '2. « parte » → « accord sujet/verbe (3e personne du pluriel). »',
      '3. « Ils marche » → « accord sujet/verbe (3e personne du pluriel). »',
      '4. « leurs cartable » → « accord nom/adjectif (nombre). »',
      '5. « des cahier » → « accord nom/adjectif (nombre). »',
      '6. « une trousse bleu » → « accord nom/adjectif (genre). »',
      '7. « deux livre » → « accord nom/adjectif (nombre). »'
    ].map(lireUneErreur);
    assert.equal(lignes.filter(Boolean).length, 7);
    const m = marquer(copie, lignes);
    assert.equal(m.posees, 7);
    assert.equal(m.introuvables.length, 0);
    assert.equal(m.ambigues.length, 0);
  });
});
