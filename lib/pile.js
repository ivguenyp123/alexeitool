/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LA PILE DE COPIES
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Le dimanche soir, il y a une pile sur la table. Vingt-six copies du même exercice, et
 * une heure et demie devant soi. On corrige la première avec attention, la douzième vite,
 * la vingt-quatrième mécaniquement — et à la fin on n'a AUCUNE idée de ce que la classe
 * n'a pas compris. On l'a vu vingt-six fois de suite sans jamais le voir une seule.
 *
 * C'est ça que cet objet-là existe pour attraper. Pas « corrige à ma place » : la pile
 * entière lue d'un coup, et la question qu'aucune copie prise seule ne peut poser —
 * QU'EST-CE QUI REVIENT.
 *
 * ── CE QUI ENTRE : DU TEXTE, ET RIEN D'AUTRE ────────────────────────────────
 *
 * Pas de photos. Deux raisons, et chacune suffirait :
 *
 *   1. Le modèle branché ici lit du texte. Une image envoyée serait ignorée ou
 *      hallucinée — et une copie hallucinée, c'est une remarque écrite à un enfant sur
 *      un travail qu'il n'a pas rendu.
 *
 *   2. Une photo de copie porte le prénom écrit en haut à droite. Le caviardage
 *      travaille sur du texte : il ne peut rien contre une image. Accepter les photos,
 *      ce serait ouvrir, à côté de la porte fermée, une fenêtre ouverte.
 *
 * Donc : on tape, on colle, ou on dépose un fichier texte. C'est plus de travail, et
 * c'est le seul chemin honnête.
 *
 * ── ET CELUI QUI N'A PAS RENDU ──────────────────────────────────────────────
 *
 * Vingt-deux copies pour vingt-six élèves : quatre manquent. Personne ne s'en aperçoit en
 * corrigeant, parce qu'une copie absente ne se présente pas. La pile les nomme.
 *
 * Et la règle qui va avec, qui est celle de tout le projet répétée une fois de plus :
 * NE PAS AVOIR RENDU N'EST PAS NE PAS SAVOIR. C'est un trou dans l'information, pas un
 * résultat. On le dit à l'écran, et on le dit au modèle.
 */
import { plier, caviarder, restes } from './eleves.js';
import { DOMAINES } from './semaine.js';
import { pour } from './attendus.js';

/**
 * Ce qu'on sait lire.
 *
 * Volontairement court. Un format en plus, c'est un format dont il faut garantir que
 * l'extraction ne perd rien — et une extraction qui perd la moitié d'une copie produit
 * une remarque sur un travail tronqué, sans que rien ne le signale.
 */
export const LISIBLES = ['.txt', '.md', '.text', ''];

/** Ce qu'on refuse, et POURQUOI — le refus muet est ce qui fait recommencer trois fois. */
export function refus(nom = '') {
  const ext = (/\.[^.]+$/.exec(String(nom)) || [''])[0].toLowerCase();
  if (LISIBLES.includes(ext)) return null;

  if (['.jpg', '.jpeg', '.png', '.heic', '.webp', '.gif'].includes(ext)) {
    return 'C\'est une photo. Elle ne peut pas entrer ici, pour deux raisons : le modèle '
         + 'ne lit que du texte, et surtout le prénom écrit en haut de la copie ne peut '
         + 'pas être masqué sur une image. Recopie ce que l\'élève a écrit — fautes '
         + 'comprises, ce sont elles qui portent l\'information.';
  }
  if (ext === '.pdf') {
    return 'C\'est un PDF. S\'il contient du texte, ouvre-le et colle le texte. S\'il '
         + 'contient des pages scannées, c\'est une photo : voir plus haut.';
  }
  if (['.doc', '.docx', '.odt', '.pages'].includes(ext)) {
    return 'C\'est un document de traitement de texte. Ouvre-le et colle le texte : '
         + 'l\'extraire ici ferait perdre des morceaux sans le dire.';
  }
  return `Le format « ${ext || 'inconnu'} » n'est pas lu ici. Seuls les fichiers texte `
       + 'le sont, et le copier-coller marche toujours.';
}

/**
 * Une pile : un exercice, et les copies qu'on en a.
 *
 * `attendu` est le texte officiel VISÉ par l'exercice, choisi par l'enseignant dans ce
 * qui a été déposé. Il n'est pas deviné : deviner l'attendu d'un exercice, c'est
 * exactement l'invention qu'on interdit partout ailleurs.
 */
export function pile({ exercice = '', domaine = '', niveau = '', attendu = '',
                       consigneDonnee = '', reference = '', copies = [] } = {}) {
  return {
    exercice: String(exercice).trim(),
    domaine, niveau,
    attendu: String(attendu).trim(),
    consigneDonnee: String(consigneDonnee).trim(),
    /*
     * ── LE TEXTE ATTENDU : LE CORRIGÉ, OU LE TEXTE DE LA DICTÉE ──────────────
     *
     * Il manquait, et c'est ce qui a produit la faute la plus visible : sans savoir ce
     * qui était attendu, le modèle a inventé un exercice et « les 12 erreurs du texte ».
     *
     * Une dictée ne se corrige pas sans son texte. Un problème ne se corrige pas sans sa
     * solution. Le demander n'est pas de la bureaucratie : c'est la différence entre
     * corriger et deviner.
     */
    reference: String(reference).trim(),
    copies: copies.map(normaliser).filter(Boolean)
  };
}

let compteur = 0;
const normaliser = (c) => {
  if (!c) return null;
  const texte = String(c.texte || '').trim();
  if (!texte) return null;
  return { id: c.id || `c${++compteur}`, nom: String(c.nom || '').trim(),
           texte, pseudo: c.pseudo || '', pourquoiPas: c.pourquoiPas || '' };
};

/**
 * Déposer une copie, et essayer de savoir de qui elle est.
 *
 * ── L'ATTRIBUTION EST UNE PROPOSITION, PAS UNE DÉCISION ─────────────────────
 *
 * On cherche un prénom de la classe dans le nom du fichier, puis dans la première ligne.
 * Quand on le trouve, la copie est rattachée. Quand deux enfants portent ce prénom, on ne
 * tranche PAS : on laisse la copie orpheline en disant pourquoi.
 *
 * Se tromper d'élève est la faute la plus coûteuse que cet outil puisse commettre — c'est
 * une remarque adressée au mauvais enfant, et une observation rangée dans le mauvais
 * dossier. Mieux vaut vingt attributions à faire à la main qu'une seule fausse en silence.
 */
export function deposer(p, { nom = '', texte = '' } = {}, t) {
  const r = refus(nom);
  if (r) return { ok: false, dit: r };

  const brut = String(texte || '').trim();
  if (!brut) return { ok: false, dit: 'Cette copie est vide — rien à corriger.' };

  const c = normaliser({ nom, texte: brut });
  const trouve = reconnaitre(nom, brut, t);
  c.pseudo = trouve.pseudo;
  c.pourquoiPas = trouve.pourquoiPas;

  p.copies.push(c);
  return { ok: true, copie: c };
}

/**
 * Chercher à qui appartient une copie. Le nom du fichier d'abord : c'est ce que
 * l'enseignant a tapé lui-même, donc ce qui est le moins ambigu.
 */
export function reconnaitre(nom, texte, t) {
  if (!t?.parPrenom?.size) return { pseudo: '', pourquoiPas: 'aucune classe saisie' };

  const duNom = String(nom || '').replace(/\.[^.]+$/, '');
  const premiereLigne = String(texte || '').split('\n')[0];

  for (const source of [duNom, premiereLigne]) {
    const vus = chercherLesPrenoms(source, t);
    if (vus.size === 0) continue;

    /*
     * Deux prénoms DIFFÉRENTS dans le même nom de fichier : on ne devine pas lequel est
     * l'auteur. Ça arrive avec « camille-corrige-par-lea.txt », et choisir au hasard
     * rangerait le travail de l'une chez l'autre.
     */
    if (vus.size > 1) {
      return { pseudo: '', pourquoiPas: `plusieurs prénoms de la classe s'y trouvent `
        + `(${[...vus.values()].flat().map((f) => f.prenom).join(', ')})` };
    }
    const fiches = [...vus.values()][0];
    // Deux enfants portent ce prénom. C'est la classe qui est ambiguë, pas la copie.
    if (fiches.length > 1) {
      return { pseudo: '', pourquoiPas: `deux élèves s'appellent ${fiches[0].prenom} — `
        + 'à toi de dire lequel' };
    }
    return { pseudo: fiches[0].pseudo, pourquoiPas: '' };
  }
  return { pseudo: '', pourquoiPas: 'aucun prénom de la classe trouvé' };
}

/**
 * Chercher les prénoms de la classe dans une chaîne.
 *
 * ── POURQUOI ON NE DÉCOUPE PAS EN MOTS ──────────────────────────────────────
 *
 * La première version découpait sur tout ce qui n'est pas une lettre. « marie-lou.txt »
 * donnait « marie » et « lou » — et « Marie-Lou » n'était donc JAMAIS reconnue, alors que
 * son prénom était écrit en toutes lettres dans le nom du fichier. Sa copie serait restée
 * orpheline toute l'année sans que rien ne l'explique.
 *
 * On cherche donc les prénoms tels qu'ils sont, LES PLUS LONGS D'ABORD, et on efface ce
 * qui a été trouvé pour qu'un prénom court contenu dans un prénom long ne se déclenche pas
 * à son tour. C'est exactement la règle de `caviarder`, pour la même raison.
 */
function chercherLesPrenoms(chaine, t) {
  let reste = plier(chaine);
  const vus = new Map();

  const prenoms = [...t.parPrenom.entries()]
    .sort((a, b) => b[0].length - a[0].length);

  for (const [cle, fiches] of prenoms) {
    // Frontières « pas une lettre » : « lea » ne doit pas se déclencher sur « leandre »,
    // mais doit se déclencher sur « 03-lea » et sur « lea.txt ».
    const motif = new RegExp(`(^|[^\\p{L}])${echapper(cle)}(?![\\p{L}])`, 'u');
    const m = motif.exec(reste);
    if (!m) continue;
    vus.set(cle, fiches);
    reste = reste.slice(0, m.index) + ' '.repeat(m[0].length) + reste.slice(m.index + m[0].length);
  }
  return vus;
}

const echapper = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Rattacher une copie à la main. C'est le mot de la fin, et il appartient à l'enseignant. */
export function attribuer(p, id, pseudo) {
  const c = p.copies.find((x) => x.id === id);
  if (!c) return false;
  c.pseudo = pseudo || '';
  c.pourquoiPas = pseudo ? '' : 'non attribuée';
  return true;
}

export function retirer(p, id) {
  const i = p.copies.findIndex((x) => x.id === id);
  if (i < 0) return false;
  p.copies.splice(i, 1);
  return true;
}

/**
 * Où en est la pile — et surtout QUI MANQUE.
 *
 * C'est le seul endroit de l'outil qui compte des élèves. Le compte est utile ici, parce
 * qu'il désigne des gens qu'on peut aller voir demain matin ; ailleurs il donnerait un
 * pourcentage, qui ne désigne personne.
 */
export function etat(p, t) {
  const copies = p?.copies || [];
  const rendus = new Set(copies.filter((c) => c.pseudo).map((c) => c.pseudo));
  const tous = t?.eleves || [];

  return {
    deposees: copies.length,
    attribuees: rendus.size,
    orphelines: copies.filter((c) => !c.pseudo),
    sansCopie: tous.filter((e) => !rendus.has(e.pseudo)),
    classe: tous.length
  };
}

/**
 * Toute la pile, caviardée, prête à partir.
 *
 * Chaque copie passe par `caviarder` — et le texte de la copie EN CONTIENT souvent : les
 * enfants s'écrivent, se citent, signent. On caviarde donc le contenu autant que
 * l'en-tête.
 *
 * `restes` est calculé sur l'ENSEMBLE, pas copie par copie : un prénom hors classe qui
 * revient dans six copies est un signal, alors que la même alerte répétée six fois est
 * du bruit qu'on finit par cliquer sans lire.
 */
export function caviarderLaPile(p, t) {
  const copies = [];
  let combien = 0;
  const remplaces = [];

  for (const c of p?.copies || []) {
    const r = caviarder(c.texte, t);
    combien += r.combien;
    remplaces.push(...r.remplaces);
    copies.push({ ...c, texte: r.texte });
  }
  // La consigne et le texte attendu aussi : ils sont écrits par l'enseignant, et un
  // énoncé nomme volontiers des enfants de la classe pour les mettre en scène.
  const consigneDonnee = caviarder(p?.consigneDonnee || '', t).texte;
  const reference = caviarder(p?.reference || '', t).texte;

  return { copies, consigneDonnee, reference, combien, remplaces,
           restes: restes(copies.map((c) => c.texte).join('\n'), t) };
}

/**
 * Le bloc donné au modèle.
 *
 * Il porte les copies, l'attendu visé s'il y en a un, et — c'est le point — la liste de
 * ceux dont on n'a rien, avec l'interdiction d'en conclure quoi que ce soit.
 */
export function direLaPile(p, t, { attendus = [], annee } = {}) {
  const L = [];
  const e = etat(p, t);
  const cav = caviarderLaPile(p, t);
  const domaine = DOMAINES[p?.domaine] || p?.domaine || '';

  L.push('LA PILE');
  L.push(`  Exercice : ${p?.exercice || '(non nommé)'}`);
  if (domaine) L.push(`  Domaine : ${domaine}${p.niveau ? ` — ${p.niveau}` : ''}`);
  L.push(`  ${e.deposees} copie${e.deposees > 1 ? 's' : ''} déposée${e.deposees > 1 ? 's' : ''}`
       + `${e.classe ? ` pour une classe de ${e.classe} élèves` : ''}.`);

  if (cav.consigneDonnee) {
    L.push('');
    L.push('  La consigne telle qu\'elle a été donnée aux élèves :');
    L.push(`    ${cav.consigneDonnee.split('\n').join('\n    ')}`);
  }

  /*
   * ── LE TEXTE ATTENDU, OU L'AVEU QU'ON NE L'A PAS ───────────────────────────
   *
   * Sans lui, un modèle à qui l'on demande de corriger une dictée invente le texte qu'il
   * aurait fallu écrire, puis compte des erreurs par rapport à son invention. Le résultat
   * est un tableau chiffré, présentable, et faux de bout en bout.
   */
  L.push('');
  if (cav.reference) {
    L.push('LE TEXTE ATTENDU — c\'est LA référence, et la seule');
    L.push('  Tu compares chaque copie à CE texte, mot à mot. Tu ne corriges rien qui n\'y');
    L.push('  soit pas, et tu ne comptes rien qui n\'en vienne pas.');
    L.push('');
    L.push(`    ${cav.reference.split('\n').join('\n    ')}`);
  } else {
    L.push('LE TEXTE ATTENDU N\'A PAS ÉTÉ DONNÉ');
    L.push('  Tu ne l\'as pas, et tu ne l\'inventes pas. Tu ne reconstitues ni l\'énoncé, ni');
    L.push('  le texte de la dictée, ni le corrigé, et tu ne comptes AUCUN total d\'erreurs :');
    L.push('  un décompte sans référence est un chiffre inventé, et il aura l\'air juste.');
    L.push('  Tu relèves seulement ce qui est fautif de façon certaine dans ce que tu lis —');
    L.push('  orthographe, accords, conjugaison, calcul.');
    L.push('  Tu le signales en UNE ligne à la fin, sous « À COMPLÉTER ». Pas en préambule :');
    L.push('  une réponse qui s\'ouvre sur ce qu\'elle ne peut pas faire retarde la seule');
    L.push('  chose qu\'on attend d\'elle.');
  }

  /*
   * L'ATTENDU VISÉ — celui que l'enseignant a désigné, vérifié contre ce qui est déposé.
   *
   * Un attendu tapé à la main qui ne correspond à aucun texte officiel déposé passe quand
   * même, mais il est annoncé comme tel. Le modèle doit savoir s'il travaille sur une
   * référence sourcée ou sur une phrase écrite de mémoire un dimanche soir.
   */
  L.push('');
  if (p?.attendu) {
    const officiels = pour(attendus, p.domaine, p.niveau, annee);
    const connu = officiels.some((a) => a.texte === p.attendu);
    L.push('L\'ATTENDU VISÉ PAR CET EXERCICE');
    L.push(`  « ${p.attendu} »`);
    L.push(connu
      ? '  Il vient du texte officiel déposé. Tu peux t\'y référer, et à lui seul.'
      : '  ATTENTION : il a été saisi à la main et ne figure pas dans le texte officiel'
        + '\n  déposé. Tu l\'utilises comme intention de l\'enseignant, PAS comme référence'
        + '\n  de programme, et tu ne le présentes jamais comme une citation officielle.');
  } else {
    L.push('AUCUN ATTENDU N\'A ÉTÉ DÉSIGNÉ POUR CET EXERCICE');
    L.push('  Tu travailles sur ce que tu lis dans les copies. Tu n\'inventes aucun attendu');
    L.push('  officiel pour combler, et tu n\'écris aucune référence de programme.');
  }

  L.push('');
  L.push('LES COPIES');
  L.push('  Elles sont anonymisées : chaque élève porte un numéro, et c\'est ce numéro que');
  L.push('  tu emploies dans toute ta réponse. Les fautes sont celles des élèves — tu ne les');
  L.push('  corriges pas dans les citations, ce sont elles qui portent l\'information.');
  /*
   * ── LE NOM DU FICHIER NE SORT PAS ──────────────────────────────────────────
   *
   * La première version écrivait « Copie non attribuée (camille.txt) » pour aider à s'y
   * retrouver. C'était une fuite : les copies s'appellent par le prénom de l'enfant, et
   * ce prénom-là traversait le caviardage sans être touché — il n'est pas dans le texte,
   * il est dans l'étiquette.
   *
   * Les copies sans élève sont donc numérotées. L'enseignant, lui, voit les vrais noms de
   * fichier à l'écran : ils ne quittent simplement pas la machine.
   */
  let anonyme = 0;
  for (const c of cav.copies) {
    anonyme += c.pseudo ? 0 : 1;
    L.push('');
    L.push(`  ── ${c.pseudo || `Copie ${anonyme} (élève non identifié)`}`);
    L.push(`    ${c.texte.split('\n').join('\n    ')}`);
  }

  /*
   * CEUX DONT ON N'A RIEN. La partie que la pile seule ne montre jamais.
   */
  if (e.sansCopie.length) {
    L.push('');
    /*
     * On ne récite pas vingt-cinq numéros.
     *
     * Mesuré sur un envoi réel : avec deux copies déposées, la liste occupait quatre
     * lignes de numéros consécutifs et noyait l'instruction qui la suit. Le compte dit la
     * même chose, et la consigne qui compte reste lisible.
     */
    const NOMMABLES = 8;
    L.push(e.sansCopie.length <= NOMMABLES
      ? `SANS COPIE : ${e.sansCopie.map((x) => x.pseudo).join(', ')}`
      : `SANS COPIE : ${e.sansCopie.length} élèves sur ${e.classe}.`);
    L.push('  Tu n\'as RIEN de ces élèves-là sur cet exercice. Ne pas avoir rendu n\'est pas');
    L.push('  ne pas savoir : tu ne leur attribues aucun niveau, aucune difficulté, aucune');
    L.push('  hypothèse. Tu les cites uniquement pour dire qu\'il manque leur travail.');
  }
  if (e.orphelines.length) {
    L.push('');
    L.push(`  ${e.orphelines.length} copie(s) n'ont pas pu être rattachées à un élève. Elles`);
    L.push('  sont ci-dessus sans numéro : traite-les, mais n\'invente pas leur auteur.');
  }

  return { texte: L.join('\n'), restes: cav.restes, caviardes: cav.combien, etat: e };
}

export default { LISIBLES, refus, pile, deposer, reconnaitre, attribuer, retirer,
                 etat, caviarderLaPile, direLaPile };
