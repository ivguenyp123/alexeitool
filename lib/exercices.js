/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  D'UNE PHRASE À UNE FICHE — ET LA FICHE EST VIDE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * On tape « je veux une évaluation des multiplications de la table de 5 », on obtient la
 * fiche. Pas un menu à parcourir, pas un formulaire : la phrase qu'on aurait dite.
 *
 * ── LA FICHE DE L'ÉLÈVE NE PORTE AUCUNE RÉPONSE ─────────────────────────────
 *
 * C'est une règle absolue, et elle décide de la forme de tout ce module : ce qui sort
 * est DEUX documents. La fiche, vide, avec la place pour écrire. Le corrigé, à part.
 *
 * Un corrigé imprimé au bas de la fiche est une catastrophe silencieuse : on photocopie
 * vingt-six exemplaires le matin, on les distribue, et on s'en aperçoit quand un enfant
 * le dit tout haut. Les deux documents ne se mélangent donc jamais — ils ne sont même pas
 * construits par la même fonction.
 *
 * ── CE QUI SE CALCULE NE PART PAS AU MODÈLE ─────────────────────────────────
 *
 * `lib/calculs.js` fabrique les tables, les opérations, les conversions. Le modèle ne
 * reçoit que ce qu'il fait mieux que du code : les énoncés de problèmes, la conjugaison,
 * le vocabulaire, la compréhension.
 */
import { GENERATEURS, semeur } from './calculs.js';
import { plier } from './eleves.js';

/**
 * Comprendre la demande.
 *
 * Le vocabulaire est FERMÉ : on reconnaît ce qu'on sait faire, et on dit franchement ce
 * qu'on n'a pas compris. Un routeur qui devine finit par produire une fiche de
 * conversions quand on demandait des fractions, et personne ne comprend pourquoi.
 *
 * @returns {{genre:'calcul'|'modele', generateur?:object, options:object, compris:Array,
 *            ignores:Array}}
 */
export function comprendre(demande, { niveau = '' } = {}) {
  const texte = plier(demande || '');
  const mots = texte.split(/[^a-z0-9]+/).filter(Boolean);
  const compris = [];

  /* Le niveau, s'il est dans la phrase. Il prime sur celui de l'écran. */
  const duTexte = /\bce2\b/.test(texte) ? 'CE2' : (/\bcm1\b/.test(texte) ? 'CM1' : '');
  const n = duTexte || niveau || 'CE2';
  if (duTexte) compris.push(duTexte);

  /*
   * ── LES NOMBRES DE LA DEMANDE ─────────────────────────────────────────────
   *
   * « la table de 5 », « les tables de 6, 7 et 8 ». Le nombre qui suit « de » désigne la
   * table ; celui qui suit « combien » ou précède « questions » désigne la quantité.
   */
  const tables = [];
  for (const m of texte.matchAll(/\bde\s+(\d{1,2})\b/g)) {
    const v = Number(m[1]);
    if (v >= 1 && v <= 12) tables.push(v);
  }
  for (const m of texte.matchAll(/\b(\d{1,2})\s*(?:et|,)\s*(\d{1,2})\b/g)) {
    for (const v of [Number(m[1]), Number(m[2])]) {
      if (v >= 1 && v <= 12 && !tables.includes(v)) tables.push(v);
    }
  }
  const quantite = /(\d{1,3})\s*(questions?|calculs?|operations?|exercices?|items?)/
    .exec(texte);

  const options = { niveau };
  /*
   * Les mots qui ont SERVI sont retenus au fur et à mesure.
   *
   * Sans ça, « conversions de longueurs » signalait « longueurs » comme non compris — un
   * mot qui avait pourtant décidé de toute la fiche. Du bruit dans une alerte, c'est ce
   * qui fait qu'on cesse de la lire, et alors elle ne sert plus le jour où elle a raison.
   */
  const servis = new Set();
  const aServi = (...mots) => mots.forEach((m) => servis.add(plier(m)));

  if (tables.length) {
    options.tables = tables;
    compris.push(`table${tables.length > 1 ? 's' : ''} de ${tables.join(', ')}`);
    aServi(...tables.map(String));
  }
  if (quantite) {
    options.combien = Math.min(60, Number(quantite[1]));
    compris.push(`${options.combien} items`);
    aServi(quantite[1], quantite[2]);
  }
  if (/\bavec\s+retenue/.test(texte)) { options.retenue = true; compris.push('avec retenue'); aServi('avec', 'retenue'); }
  if (/\bsans\s+retenue/.test(texte)) { options.retenue = false; compris.push('sans retenue'); aServi('sans', 'retenue'); }
  for (const f of ['longueur', 'masse', 'contenance']) {
    if (texte.includes(f)) { options.famille = f; compris.push(f); aServi(f, `${f}s`); }
  }
  if (duTexte) aServi(duTexte);
  options.niveau = n;

  /*
   * ── QUEL GÉNÉRATEUR ───────────────────────────────────────────────────────
   *
   * On compte les mots reconnus, et le plus précis gagne : « multiplication posée » doit
   * l'emporter sur « multiplication », sinon on rend des tables à qui demandait une
   * opération à poser.
   */
  let meilleur = null;
  for (const g of GENERATEURS) {
    let score = 0;
    let touches = [];
    for (const mot of g.mots) {
      const cle = plier(mot);
      const trouve = cle.includes(' ')
        ? texte.includes(cle)
        : mots.includes(cle);
      if (trouve) { score += cle.split(' ').length * 10 + cle.length; touches.push(mot); }
    }
    if (!score) continue;
    // Un générateur hors niveau ne l'emporte pas : les fractions ne sont pas au CE2.
    if (!g.niveaux.includes(n)) score -= 5;
    if (!meilleur || score > meilleur.score) meilleur = { g, score, touches };
  }

  const ignores = mots.filter((m) => m.length > 3 && !VIDES.has(m) && !servis.has(m)
    // Un mot au pluriel a servi si son singulier a servi, et réciproquement.
    && !servis.has(m.replace(/s$/, '')) && !servis.has(`${m}s`)
    && !(meilleur?.touches || []).some((t) => plier(t).includes(m)));

  if (meilleur && meilleur.score > 0) {
    return { genre: 'calcul', generateur: meilleur.g, options,
             compris: [meilleur.g.nom, ...compris], ignores, niveau: n };
  }
  return { genre: 'modele', options, compris, ignores, niveau: n };
}

/*
 * Les mots qui ne désignent rien à eux seuls. Ils sont écartés du « pas compris » pour
 * qu'il reste lisible — une liste de vingt mots courants ferait douter de tout le reste.
 */
const VIDES = new Set(['une', 'des', 'les', 'sur', 'pour', 'avec', 'dans', 'veux', 'fais',
  'faire', 'peux', 'quelques', 'petite', 'petit', 'evaluation', 'evaluations', 'controle',
  'interro', 'interrogation', 'fiche', 'exercice', 'exercices', 'eleves', 'eleve',
  'classe', 'niveau', 'ecole', 'travail', 'entrainement', 'revision', 'revisions']);

/**
 * ── LA FICHE DE L'ÉLÈVE ─────────────────────────────────────────────────────
 *
 * Elle porte les énoncés, la place pour répondre, et RIEN D'AUTRE. Pas de réponse, pas
 * d'indice, pas de barème — un barème imprimé transforme une évaluation en note avant
 * même qu'elle soit passée.
 */
export function ficheEleve(items, { titre = '', niveau = '', consigne = '' } = {}) {
  return {
    titre: titre || 'Exercices',
    niveau,
    consigne: consigne || 'Écris tes réponses dans les cases.',
    items: items.map((x, i) => ({ numero: i + 1, enonce: x.enonce, place: x.place || 'case' })),
    // Ce drapeau est lu par le rendu ET par les tests : c'est lui qui garantit qu'aucune
    // réponse ne peut se glisser dans le document donné aux enfants.
    sansReponses: true
  };
}

/** Le corrigé. Un document SÉPARÉ, qui porte son nom en grand. */
export function corrige(items, { titre = '', niveau = '' } = {}) {
  return {
    titre: `CORRIGÉ — ${titre || 'Exercices'}`,
    niveau,
    items: items.map((x, i) => ({ numero: i + 1, enonce: x.enonce, reponse: x.reponse })),
    estUnCorrige: true
  };
}

/**
 * Fabriquer les deux documents d'un coup, pour ce qui se calcule.
 *
 * `graine` rend le tirage reproductible : on réimprime la fiche perdue à l'identique, et
 * on donne deux sujets différents aux deux moitiés de la classe en changeant un chiffre.
 */
export function fabriquer(demande, { niveau = '', graine = 1 } = {}) {
  const lu = comprendre(demande, { niveau });
  if (lu.genre !== 'calcul') return { ...lu, items: null };

  const items = lu.generateur.faire(semeur(graine), { ...lu.options, niveau: lu.niveau });

  /*
   * ── ON DIT QUAND ON N'A PAS PU DONNER CE QUI ÉTAIT DEMANDÉ ────────────────
   *
   * « les tables de 6 et 7, 24 questions » : il n'existe que vingt faits. On en rend
   * vingt, ce qui est juste — mais silencieusement, ça ressemble à une panne. On le dit,
   * en une ligne, avec la raison.
   */
  const manque = lu.options.combien && items.length < lu.options.combien
    ? { demande: lu.options.combien, obtenu: items.length }
    : null;
  const titre = `${lu.generateur.nom}${lu.options.tables?.length
    ? ` — table${lu.options.tables.length > 1 ? 's' : ''} de ${lu.options.tables.join(', ')}`
    : ''}`;
  return {
    ...lu, items, manque,
    fiche: ficheEleve(items, { titre, niveau: lu.niveau, consigne: consigneDe(lu.generateur) }),
    corrige: corrige(items, { titre, niveau: lu.niveau })
  };
}

const CONSIGNES = {
  tables: 'Calcule.',
  'addition-posee': 'Pose et calcule.',
  'soustraction-posee': 'Pose et calcule.',
  'multiplication-posee': 'Pose et calcule.',
  division: 'Pose la division. Écris le quotient et le reste.',
  complements: 'Complète.',
  doubles: 'Calcule.',
  comparer: 'Complète avec <, > ou =.',
  decomposer: 'Décompose comme dans l\'exemple : 3 562 = 3 000 + 500 + 60 + 2',
  conversions: 'Convertis.',
  durees: 'Réponds.',
  perimetre: 'Calcule le périmètre. N\'oublie pas l\'unité.',
  fractions: 'Calcule.',
  'multiplier-10': 'Calcule.'
};
const consigneDe = (g) => CONSIGNES[g.id] || 'Réponds.';

/**
 * Ce qu'on demande au modèle quand l'exercice ne se calcule pas.
 *
 * La forme est stricte pour une seule raison : il faut pouvoir séparer l'énoncé de la
 * réponse, sinon on ne peut pas faire une fiche vide. Un exercice dont on ne sait pas
 * isoler la réponse ne peut pas être donné aux enfants.
 */
export const CONSIGNE_MODELE = `Tu fabriques une fiche d'exercices pour une classe de
CE2-CM1. Elle sera imprimée et distribuée aux enfants.

LA FORME EST STRICTE, PARCE QUE L'OUTIL LA RELIT POUR EN FAIRE DEUX DOCUMENTS : la fiche
donnée aux élèves, qui ne porte AUCUNE réponse, et le corrigé, à part, pour l'enseignant.

Une ligne par exercice, exactement ainsi :

    1. Conjugue « chanter » au présent, 3e personne du pluriel. || ils chantent
    2. Quel est le contraire de « rapide » ? || lent

L'énoncé, deux barres verticales, la réponse. Rien d'autre sur la ligne.

CE QUE TU RESPECTES :
· L'ÉNONCÉ SE SUFFIT À LUI-MÊME. Un enfant le lit seul, sans que l'adulte explique.
· UNE SEULE RÉPONSE ATTENDUE par ligne, et elle tient en quelques mots. Si la réponse
  demande trois lignes, écris l'exercice autrement.
· TU DONNES ENTRE 8 ET 20 EXERCICES, du plus simple au plus difficile.
· TU RESPECTES LE NIVEAU DEMANDÉ. Un CE2 est en fin de cycle 2, un CM1 en début de
  cycle 3 : ce ne sont pas deux étapes d'une même progression.
· AVANT LA LISTE, une ligne « CONSIGNE : » avec la consigne telle qu'elle sera lue par
  l'élève, à l'impératif et en une phrase.

CE QUE TU NE FAIS JAMAIS :
· Tu n'écris AUCUNE réponse ailleurs que derrière les deux barres. Pas d'exemple corrigé
  dans la consigne, pas de réponse entre parenthèses dans l'énoncé : tout ce qui est dans
  l'énoncé sera imprimé sur la fiche de l'élève.
· Tu ne mets ni note, ni barème, ni nombre de points.
· Tu ne cites aucun attendu officiel : tu ne les as pas.
· Tu n'inventes pas de texte long à lire : la fiche doit tenir sur une page A4.`;

/**
 * Lire ce que le modèle a rendu. Même exigence que pour la correction des copies :
 * ce qui n'est pas reconnu n'est pas jeté, il est rendu tel quel.
 */
export function lireLesExercices(reponse) {
  const items = [];
  let consigne = '';
  const reste = [];

  for (const brute of String(reponse || '').split('\n')) {
    const l = brute.replace(/\*\*/g, '').trim();
    if (!l) continue;

    const c = /^consigne\s*:\s*(.+)$/i.exec(l);
    if (c && !consigne) { consigne = c[1].trim(); continue; }

    // « || » d'abord, puis les variantes qu'un modèle emploie quand il oublie la forme.
    const m = /^(?:\d{1,2}[.)]\s*)?(.+?)\s*(?:\|\||\|\s|→\s*réponse\s*:|\s—\sréponse\s*:)\s*(.+)$/i
      .exec(l);
    if (m) {
      const enonce = m[1].trim();
      const rep = m[2].trim();
      if (enonce && rep && rep.length < 120) {
        items.push({ enonce, reponse: rep, place: rep.length > 24 ? 'ligne' : 'case' });
        continue;
      }
    }
    reste.push(l);
  }
  return { items, consigne, reste: reste.join('\n') };
}

export default { comprendre, fabriquer, ficheEleve, corrige, lireLesExercices,
                 CONSIGNE_MODELE };
