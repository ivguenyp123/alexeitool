import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { table } from '../lib/eleves.js';
import { LISIBLES, refus, pile, deposer, reconnaitre, attribuer, retirer,
         etat, caviarderLaPile, direLaPile } from '../lib/pile.js';
import { textePile } from '../lib/contexte.js';
import { GESTES, ici } from '../lib/gestes.js';

const CLASSE = table([
  { prenom: 'Camille', niveau: 'CE2' },
  { prenom: 'Léa', niveau: 'CE2' },
  { prenom: 'Camille', nom: 'Bernard', niveau: 'CM1' },
  { prenom: 'Marie-Lou', niveau: 'CM1' },
  { prenom: 'Tom', niveau: 'CM1' }
]);

describe('ce qui peut entrer dans la pile', () => {
  test('les fichiers texte passent', () => {
    for (const ext of ['.txt', '.md', '.text']) assert.equal(refus(`copie${ext}`), null);
    // Un fichier sans extension : c'est un export d'appareil, on le lit.
    assert.equal(refus('copie'), null);
  });

  test('une photo est refusée, et pour les DEUX raisons', () => {
    const dit = refus('IMG_4211.jpg');
    assert.ok(dit, 'une photo doit être refusée');
    assert.match(dit, /ne lit que du texte/);
    // La raison qui compte le plus : le prénom sur l'image ne peut pas être masqué.
    assert.match(dit, /prénom.*ne peut.*pas être masqué/s);
  });

  test('un PDF et un .docx sont refusés en disant quoi faire à la place', () => {
    assert.match(refus('sujet.pdf'), /colle le texte/);
    assert.match(refus('copie.docx'), /colle le texte/);
  });

  test('un format inconnu est refusé en le nommant', () => {
    assert.match(refus('truc.xyz'), /« \.xyz »/);
  });

  test('LISIBLES et refus disent la même chose', () => {
    for (const ext of LISIBLES) assert.equal(refus(`a${ext}`), null);
  });
});

describe('déposer une copie', () => {
  test('le nom du fichier suffit à reconnaître un élève unique', () => {
    const p = pile({ exercice: 'Problème 3' });
    const r = deposer(p, { nom: '04-tom.txt', texte: 'Il reste 12 billes.' }, CLASSE);
    assert.equal(r.ok, true);
    assert.equal(r.copie.pseudo, CLASSE.parPrenom.get('tom')[0].pseudo);
  });

  test('à défaut, la première ligne', () => {
    const p = pile({});
    const r = deposer(p, { nom: 'scan001.txt', texte: 'Léa\nLe chat dort.' }, CLASSE);
    assert.equal(r.ok, true);
    assert.equal(r.copie.pseudo, CLASSE.parPrenom.get('lea')[0].pseudo);
  });

  test('DEUX élèves du même prénom : on n\'attribue pas, et on dit pourquoi', () => {
    const p = pile({});
    const r = deposer(p, { nom: 'camille.txt', texte: 'un texte' }, CLASSE);
    assert.equal(r.copie.pseudo, '', 'se tromper d\'enfant est la faute la plus chère');
    assert.match(r.copie.pourquoiPas, /deux élèves s'appellent Camille/);
  });

  test('deux prénoms DIFFÉRENTS dans le nom : on ne devine pas lequel est l\'auteur', () => {
    const { pseudo, pourquoiPas } = reconnaitre('tom-corrige-par-lea.txt', '', CLASSE);
    assert.equal(pseudo, '');
    assert.match(pourquoiPas, /plusieurs prénoms/);
  });

  test('un prénom composé n\'est pas coupé par un prénom plus court', () => {
    const { pseudo } = reconnaitre('marie-lou.txt', '', CLASSE);
    assert.equal(pseudo, CLASSE.parPrenom.get('marie-lou')[0].pseudo);
  });

  test('accents et casse ne changent rien', () => {
    assert.equal(reconnaitre('LEA.txt', '', CLASSE).pseudo,
                 reconnaitre('léa.txt', '', CLASSE).pseudo);
  });

  test('aucun prénom trouvé : la copie entre quand même, orpheline', () => {
    const p = pile({});
    const r = deposer(p, { nom: 'scan_0031.txt', texte: 'une production' }, CLASSE);
    assert.equal(r.ok, true);
    assert.equal(r.copie.pseudo, '');
    assert.match(r.copie.pourquoiPas, /aucun prénom/);
  });

  test('une copie vide est refusée — il n\'y a rien à corriger', () => {
    assert.equal(deposer(pile({}), { nom: 'a.txt', texte: '   \n ' }, CLASSE).ok, false);
  });

  test('une photo déposée ne rentre pas dans la pile', () => {
    const p = pile({});
    assert.equal(deposer(p, { nom: 'copie.jpeg', texte: 'peu importe' }, CLASSE).ok, false);
    assert.equal(p.copies.length, 0);
  });

  test('attribuer à la main, et retirer', () => {
    const p = pile({});
    const { copie } = deposer(p, { nom: 'camille.txt', texte: 'un texte' }, CLASSE);
    assert.equal(attribuer(p, copie.id, 'Élève 02'), true);
    assert.equal(p.copies[0].pseudo, 'Élève 02');
    assert.equal(p.copies[0].pourquoiPas, '');
    assert.equal(retirer(p, copie.id), true);
    assert.equal(p.copies.length, 0);
    assert.equal(retirer(p, copie.id), false);
  });
});

describe('l\'état de la pile — et surtout qui manque', () => {
  test('les élèves sans copie sont nommés', () => {
    const p = pile({});
    deposer(p, { nom: 'tom.txt', texte: 'a' }, CLASSE);
    deposer(p, { nom: 'lea.txt', texte: 'b' }, CLASSE);
    const e = etat(p, CLASSE);
    assert.equal(e.deposees, 2);
    assert.equal(e.attribuees, 2);
    assert.equal(e.classe, 5);
    assert.equal(e.sansCopie.length, 3);
  });

  test('une copie orpheline ne fait croire à personne qu\'un élève a rendu', () => {
    const p = pile({});
    deposer(p, { nom: 'scan1.txt', texte: 'a' }, CLASSE);
    const e = etat(p, CLASSE);
    assert.equal(e.orphelines.length, 1);
    assert.equal(e.attribuees, 0);
    assert.equal(e.sansCopie.length, 5, 'aucun élève n\'est réputé avoir rendu');
  });
});

describe('rien ne part en clair', () => {
  test('un prénom écrit DANS une copie est caviardé', () => {
    const p = pile({});
    deposer(p, { nom: 'tom.txt', texte: 'Je joue avec Léa et Marie-Lou.' }, CLASSE);
    const c = caviarderLaPile(p, CLASSE);
    assert.doesNotMatch(c.copies[0].texte, /Léa|Marie-Lou/);
    assert.equal(c.combien, 2);
  });

  test('la consigne de l\'exercice est caviardée elle aussi', () => {
    const p = pile({ consigneDonnee: 'Raconte la journée de Tom.' });
    assert.doesNotMatch(caviarderLaPile(p, CLASSE).consigneDonnee, /Tom/);
  });

  test('les restes sont calculés sur toute la pile, pas copie par copie', () => {
    const p = pile({});
    for (const n of ['tom', 'lea']) {
      deposer(p, { nom: `${n}.txt`, texte: 'Nous sommes allés voir Mathis.' }, CLASSE);
    }
    const restes = caviarderLaPile(p, CLASSE).restes;
    const m = restes.find((r) => r.mot === 'Mathis');
    assert.ok(m, 'un prénom hors classe doit remonter');
    assert.equal(m.n, 2, 'compté une fois par occurrence, pas une alerte par copie');
  });

  test('AUCUN prénom de la classe ne survit dans le texte envoyé', () => {
    const p = pile({ exercice: 'Dictée', consigneDonnee: 'Dictée de Tom' });
    deposer(p, { nom: 'camille.txt', texte: 'Léa a dit à Marie-Lou de venir.' }, CLASSE);
    deposer(p, { nom: 'tom.txt', texte: 'Camille joue.' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE);
    for (const prenom of ['Camille', 'Léa', 'Marie-Lou', 'Tom']) {
      assert.doesNotMatch(texte, new RegExp(prenom),
        `« ${prenom} » ne doit jamais atteindre le fournisseur`);
    }
  });
});

describe('ce qu\'on dit au modèle', () => {
  const ATTENDUS = [{ cycle: 3, domaine: 'francais', generation: '',
                      texte: 'Rédiger un texte cohérent d\'une dizaine de lignes.',
                      source: 'officiel, CM1' }];

  test('un attendu qui vient du texte officiel est présenté comme tel', () => {
    const p = pile({ domaine: 'francais', niveau: 'CM1',
                     attendu: ATTENDUS[0].texte });
    deposer(p, { nom: 'tom.txt', texte: 'Une production.' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE, { attendus: ATTENDUS, annee: 2026 });
    assert.match(texte, /vient du texte officiel déposé/);
  });

  test('un attendu tapé à la main est signalé comme NON officiel', () => {
    const p = pile({ domaine: 'francais', niveau: 'CM1',
                     attendu: 'Écrire sans faire de fautes' });
    deposer(p, { nom: 'tom.txt', texte: 'Une production.' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE, { attendus: ATTENDUS, annee: 2026 });
    assert.match(texte, /saisi à la main/);
    assert.match(texte, /jamais comme une citation officielle/);
  });

  test('aucun attendu désigné : l\'interdiction d\'en inventer part quand même', () => {
    const p = pile({ domaine: 'francais', niveau: 'CM1' });
    deposer(p, { nom: 'tom.txt', texte: 'Une production.' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE, { attendus: ATTENDUS, annee: 2026 });
    assert.match(texte, /AUCUN ATTENDU N'A ÉTÉ DÉSIGNÉ/);
    assert.match(texte, /n'inventes aucun attendu/);
  });

  test('ceux qui n\'ont pas rendu sont nommés, avec l\'interdiction d\'en conclure', () => {
    const p = pile({});
    deposer(p, { nom: 'tom.txt', texte: 'Une production.' }, CLASSE);
    const { texte } = direLaPile(p, CLASSE);
    assert.match(texte, /SANS COPIE/);
    assert.match(texte, /Ne pas avoir rendu n'est pas\s+ne pas savoir/);
  });

  test('au-delà de huit absents, on donne le compte et pas la liste', () => {
    // Vingt-cinq numéros consécutifs noient l'instruction qui les suit — mesuré sur un
    // envoi réel. Le compte dit la même chose et laisse la consigne lisible.
    const grande = table(Array.from({ length: 26 }, (_, i) => ({ prenom: `Enfant${i}` })));
    const p = pile({});
    deposer(p, { nom: 'enfant3.txt', texte: 'production' }, grande);
    const { texte } = direLaPile(p, grande);
    assert.match(texte, /SANS COPIE : 25 élèves sur 26\./);
    assert.doesNotMatch(texte, /Élève 07, Élève 08/);
  });

  test('une pile complète ne parle pas de ceux qui manquent — il n\'y en a pas', () => {
    const p = pile({});
    for (const e of CLASSE.eleves) {
      const { copie } = deposer(p, { nom: 'x.txt', texte: 'production' }, CLASSE);
      attribuer(p, copie.id, e.pseudo);
    }
    // Une alerte affichée quand il n'y a rien à signaler est ce qui fait
    // qu'on cesse de lire les alertes.
    assert.doesNotMatch(direLaPile(p, CLASSE).texte, /SANS COPIE/);
  });

  test('les copies orphelines sont annoncées comme telles', () => {
    const p = pile({});
    deposer(p, { nom: 'scan1.txt', texte: 'Une production.' }, CLASSE);
    assert.match(direLaPile(p, CLASSE).texte, /n'invente pas leur auteur/);
  });

  test('le texte complet dit ce qu\'il n\'a pas : la copie elle-même', () => {
    const p = pile({ exercice: 'Dictée 4' });
    deposer(p, { nom: 'tom.txt', texte: 'Le chat dor.' }, CLASSE);
    const r = textePile(GESTES.find((g) => g.id === 'typologie-dictee'), p, CLASSE, {});
    assert.match(r.texte, /transcription/);
    assert.match(r.texte, /ratures/);
    assert.equal(r.etat.deposees, 1);
  });

  test('la précision de l\'enseignant vient en dernier et est nommée', () => {
    const p = pile({});
    deposer(p, { nom: 'tom.txt', texte: 'production' }, CLASSE);
    const r = textePile(GESTES[0], p, CLASSE, { precision: 'Dictée non préparée.' });
    assert.match(r.texte, /CE QUE L'ENSEIGNANT PRÉCISE[\s\S]*Dictée non préparée\./);
  });
});

describe('les gestes de la pile', () => {
  const DE_LA_PILE = GESTES.filter((g) => g.ancrage === 'pile');

  test('il y en a, et chacun porte une consigne', () => {
    assert.ok(DE_LA_PILE.length >= 5);
    for (const g of DE_LA_PILE) {
      assert.ok(g.consigne && g.consigne.length > 200,
        `${g.id} n'a pas de consigne — le bouton existerait sans rien derrière`);
    }
  });

  test('aucune ne peut produire une note ni un classement d\'élèves', () => {
    for (const g of DE_LA_PILE) {
      assert.match(g.consigne, /Tu ne (notes pas|mets aucune note|ramènes pas)|aucune note/,
        `${g.id} ne dit pas au modèle de ne pas noter`);
      // `\s+` et pas ` ` : les consignes sont écrites à la main, et une interdiction
      // coupée par un retour à la ligne reste une interdiction.
      assert.match(g.consigne, /classes?\s+pas\s+les\s+élèves\s+entre\s+eux|groupes de niveau/,
        `${g.id} ne dit pas au modèle de ne pas classer les élèves`);
    }
  });

  test('aucune n\'autorise à conclure sur un élève dont on n\'a pas la copie', () => {
    for (const g of DE_LA_PILE) {
      assert.match(g.consigne, /dont tu n'as pas la copie|n'as pas la copie/,
        `${g.id} laisse le modèle libre d'inventer sur un absent`);
    }
  });

  test('tant qu\'aucun domaine n\'est choisi, TOUS les gestes sont proposés', () => {
    // Une pile existe toujours ; son domaine, non. `!c` au lieu de `!c?.domaine` rendait
    // la dictée et le problème invisibles tant qu'un champ facultatif restait vide.
    const p = pile({});
    const noms = ici('pile', p).map((g) => g.id);
    assert.ok(noms.includes('typologie-dictee'));
    assert.ok(noms.includes('ou-casse-le-probleme'));
  });

  test('un domaine choisi écarte ce qui ne sert pas', () => {
    const noms = ici('pile', pile({ domaine: 'mathematiques' })).map((g) => g.id);
    assert.ok(noms.includes('ou-casse-le-probleme'));
    assert.ok(!noms.includes('typologie-dictee'));
  });

  test('le mot à l\'élève porte sur le travail, pas sur la personne', () => {
    const g = DE_LA_PILE.find((x) => x.id === 'mot-a-eleve');
    assert.match(g.consigne, /rien sur la PERSONNE/);
    assert.match(g.consigne, /numéros d'élève, jamais de prénom/);
  });
});
