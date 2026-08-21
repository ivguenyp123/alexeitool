/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  OÙ SE RANGENT LES GESTES — ET POURQUOI IL N'Y A PAS DE LISTE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── LA QUESTION ─────────────────────────────────────────────────────────────
 *
 * On a trente-deux choses que l'outil saura faire. Où les met-on ? Un écran « les
 * outils » ? Un menu ? Dans les jours ?
 *
 * ── LA RÉPONSE : NULLE PART, ET PARTOUT ─────────────────────────────────────
 *
 * Il n'y a AUCUN écran qui liste ce que l'outil sait faire. C'est la leçon la plus chère
 * payée ailleurs : une grille de cartes qu'on fait défiler est une machine à ne pas
 * trouver, et une machine à créer des doublons. Un enseignant ne cherchera jamais « un
 * agent de correction » ; il a une pile de copies devant lui.
 *
 * LA RÈGLE, ET ELLE TIENT TOUT :
 *
 *   UN GESTE SE RANGE LÀ OÙ VIT CE QU'IL LIT.
 *
 *   il lit une séance          → il est SUR le créneau, dans la journée
 *   il lit une pile de copies  → il est SUR la pile, quand elle existe
 *   il lit un élève            → il est SUR la fiche de l'élève
 *   il lit la période          → il est SUR la période
 *   il lit toute la semaine    → il est SUR la semaine
 *
 * On ne navigue donc jamais vers un outil : on est déjà devant la chose, et ce qu'on peut
 * en faire est là. C'est le même principe que le routage par capacité de la plateforme
 * technique — trouver par la matière, pas par le nom — mais rendu SPATIAL, parce qu'un
 * enseignant navigue dans le temps et dans les objets, pas dans une barre de recherche.
 *
 * ── ET TOUS LES GESTES NE S'APPLIQUENT PAS À TOUT ───────────────────────────
 *
 * Le plan de travail autonome n'a aucun sens sur un créneau où les deux groupes sont
 * ensemble : personne ne travaille seul. La dictée n'a rien à faire sur un créneau de
 * sport. Ce qui est proposé dépend donc du créneau RÉEL — son domaine, son régime — et
 * pas d'une liste figée.
 *
 * C'est ce qui fait la différence entre « voilà tout ce que je sais faire » et « voilà ce
 * qui sert ici ».
 */

/** Là où un geste peut vivre. Fermé — chaque ancrage est un endroit réel de l'écran. */
export const ANCRAGES = ['creneau', 'pile', 'eleve', 'periode', 'semaine', 'classe'];

/**
 * Ce que chaque geste fait, lit, et ne fait jamais.
 *
 * Le troisième champ est le plus important : c'est lui qui empêche un outil d'aide de
 * devenir un outil qui décide. Il est écrit ici, une fois, et l'écran l'affiche — il ne
 * vit pas dans la tête de celui qui a codé le bouton.
 *
 * `quand` limite l'apparition. Absent, le geste vaut pour tous les cas de son ancrage.
 */
export const GESTES = [
  /* ── SUR UN CRÉNEAU ────────────────────────────────────────────────────── */
  {
    id: 'preparer-seance', ancrage: 'creneau',
    nom: 'Préparer cette séance',
    lit: 'le domaine et la durée du créneau, les attendus du niveau, ce qui a déjà été fait',
    rend: 'un déroulé minuté, les consignes telles qu\'elles seront dites, les critères de réussite',
    jamais: 'proposer un déroulé plus long que le créneau, sans le signaler'
  },
  {
    id: 'deux-taches', ancrage: 'creneau',
    quand: (c) => c.regime !== 'commun',
    nom: 'Une entrée commune, deux tâches',
    lit: 'les attendus des deux niveaux sur ce domaine',
    rend: 'le temps collectif partagé, les deux consignes, et le moment précis où les groupes se séparent',
    jamais: 'donner au CE2 une version allégée du CM1 — ce sont deux tâches, pas une tâche réduite'
  },
  {
    id: 'plan-autonome', ancrage: 'creneau',
    quand: (c) => c.regime === 'decale',
    nom: 'Le travail du groupe en autonomie',
    lit: 'le domaine du groupe qui travaille seul, la durée, ce qui a déjà été enseigné',
    rend: 'des tâches réellement faisables sans adulte, l\'autocorrection, quoi faire quand on a fini et quand on est bloqué',
    jamais: 'mettre en autonomie une notion qui n\'a jamais été vue en dirigé'
  },
  {
    id: 'cout-dedoublement', ancrage: 'creneau',
    quand: (c) => c.regime === 'dedouble',
    nom: 'Peut-on éviter de dédoubler ?',
    lit: 'les attendus des deux niveaux sur ce domaine, l\'écart entre eux',
    rend: 'si ce créneau peut passer en alternance — et ce que ça changerait pour chaque groupe',
    jamais: 'conclure qu\'on peut fusionner deux attendus qui ne se recouvrent pas'
  },
  {
    id: 'redire-autrement', ancrage: 'creneau',
    nom: 'Trois façons de le redire',
    lit: 'la notion, et ce qui a été dit sans passer',
    rend: 'trois entrées de nature différente — une manipulation, une image, un contre-exemple',
    jamais: 'reformuler sans changer d\'entrée : c\'est ce qui a déjà échoué'
  },
  {
    id: 'sortie-seance', ancrage: 'creneau',
    nom: 'Qui a compris, en cinq minutes',
    lit: 'l\'objectif de la séance',
    rend: 'une ou deux questions de fin de séance, et comment lire les réponses',
    jamais: 'transformer ce contrôle rapide en évaluation notée'
  },

  /* ── SUR UNE PILE DE COPIES ────────────────────────────────────────────── */
  {
    id: 'pile-ou-ca-bloque', ancrage: 'pile',
    nom: 'Ce qui bloque, et pour qui',
    lit: 'toutes les copies de l\'exercice, et l\'attendu visé',
    rend: 'les difficultés regroupées par nature, avec qui est concerné, et ce que ça implique pour la suite',
    jamais: 'classer les élèves entre eux, ni produire un rang'
  },
  {
    id: 'mot-a-eleve', ancrage: 'pile',
    nom: 'Le mot à écrire sur chaque copie',
    lit: 'la copie et l\'attendu visé',
    rend: 'trois phrases adressées à l\'élève : ce qui est réussi, la seule chose à reprendre, comment s\'y prendre',
    jamais: 'écrire un commentaire sur la personne plutôt que sur le travail'
  },
  {
    id: 'typologie-dictee', ancrage: 'pile',
    quand: (c) => !c || c.domaine === 'francais',
    nom: 'Les erreurs de la dictée, par nature',
    lit: 'le texte de la dictée et les productions',
    rend: 'accord, homophone, son, lexique, segmentation — par élève et pour la classe',
    jamais: 'ramener une dictée à un nombre d\'erreurs'
  },
  {
    id: 'ou-casse-le-probleme', ancrage: 'pile',
    quand: (c) => !c || c.domaine === 'mathematiques',
    nom: 'Où le raisonnement casse',
    lit: 'l\'énoncé et les productions',
    rend: 'pour chaque élève : lecture de l\'énoncé, choix de l\'opération, calcul, ou formulation',
    jamais: 'traiter une erreur de calcul comme une incompréhension du problème'
  },

  /* ── SUR UN ÉLÈVE ──────────────────────────────────────────────────────── */
  {
    id: 'avant-les-parents', ancrage: 'eleve',
    nom: 'Avant de rencontrer ses parents',
    lit: 'les productions et observations concernant cet élève',
    rend: 'la trame de l\'entretien : ce qui a progressé, ce qui bloque, et ce dont on n\'a pas de trace',
    jamais: 'présenter comme observé ce qui n\'a pas été observé'
  },
  {
    id: 'ppre', ancrage: 'eleve',
    nom: 'Écrire une aide qui se vérifie',
    lit: 'les difficultés constatées et les attendus du niveau',
    rend: 'un objectif précis, des moyens concrets, une échéance, et le critère qui dira si ça a marché',
    jamais: 'poser un diagnostic, évoquer un trouble, ni se substituer au RASED ou au médecin scolaire'
  },

  /* ── SUR LA PÉRIODE ────────────────────────────────────────────────────── */
  {
    id: 'bilan-periode', ancrage: 'periode',
    nom: 'Le bilan de la période',
    lit: 'les observations et évaluations de la période, les attendus du niveau',
    rend: 'un projet de bilan par domaine, à relire et à trancher',
    jamais: 'renseigner le livret directement, ni convertir une absence d\'évaluation en « non atteint »'
  },
  {
    id: 'sans-trace', ancrage: 'periode',
    nom: 'Ce dont on n\'a aucune trace',
    lit: 'les attendus de la période et tout ce qui a été relevé',
    rend: 'les attendus que personne n\'a passés, et les élèves sur lesquels on n\'a presque rien',
    jamais: 'combler un trou par une estimation'
  },
  {
    id: 'franchir-le-cycle', ancrage: 'periode',
    nom: 'Ce que le CE2 doit clore avant juin',
    lit: 'les attendus de fin de cycle 2, la progression réalisée',
    rend: 'ce qui doit être sécurisé avant juin pour les CE2, et ce qui peut s\'installer plus lentement pour les CM1',
    jamais: 'traiter les deux groupes comme deux étapes d\'une même progression — ce sont deux cycles'
  },

  /* ── SUR LA SEMAINE ────────────────────────────────────────────────────── */
  {
    id: 'equilibrer-semaine', ancrage: 'semaine',
    nom: 'Rattraper ce qui manque',
    lit: 'la grille posée et les volumes réglementaires',
    rend: 'où placer ce qui manque, compte tenu des jours courts et du mercredi',
    jamais: 'proposer de sauter un attendu pour faire tenir la grille'
  },
  {
    id: 'cahier-remplacant', ancrage: 'semaine',
    nom: 'Ce qu\'un remplaçant doit savoir',
    lit: 'la grille, la progression, l\'organisation des groupes',
    rend: 'le document à laisser sur le bureau : où on en est, ce qui est prévu, ce qui se passe en autonomie',
    jamais: 'écrire des informations sensibles sur un élève dans un document laissé sur un bureau'
  },

  /* ── SUR LA CLASSE ─────────────────────────────────────────────────────── */
  {
    id: 'groupes-de-besoin', ancrage: 'classe',
    nom: 'Les groupes de la semaine',
    lit: 'les observations et productions de la période',
    rend: 'des groupes provisoires, chacun avec le besoin qui le justifie et son critère de sortie',
    jamais: 'produire des groupes de niveau permanents'
  },
  {
    id: 'mot-familles', ancrage: 'classe',
    nom: 'Un mot aux familles',
    lit: 'l\'information à transmettre et la date',
    rend: 'le mot du cahier de liaison : court, sans jargon, avec ce qu\'il faut faire et pour quand',
    jamais: 'nommer un élève dans un mot collectif'
  }
];

/**
 * Les gestes qui ont un sens ICI — sur cet objet précis, dans son état précis.
 *
 * C'est la fonction qui remplace le catalogue. On ne demande pas « que sais-tu faire »
 * mais « qu'est-ce qui sert sur ceci », et la réponse dépend de l'objet.
 *
 * @param {string} ancrage  où l'on se trouve : `creneau`, `pile`, `eleve`…
 * @param {object} objet    la chose regardée — un créneau, une pile… Peut être absent.
 */
export function ici(ancrage, objet = null) {
  return GESTES.filter((g) => g.ancrage === ancrage)
    .filter((g) => !g.quand || g.quand(objet));
}

/** Un geste par son identifiant, ou `null`. On ne devine pas. */
export const geste = (id) => GESTES.find((g) => g.id === id) || null;

/**
 * Combien de gestes chaque endroit porte — pour vérifier qu'aucun n'est désert.
 *
 * Un ancrage sans aucun geste serait un endroit de l'écran où l'outil ne sert à rien, et
 * personne ne s'en apercevrait avant d'y être.
 */
export function parAncrage() {
  return Object.fromEntries(ANCRAGES.map((a) =>
    [a, GESTES.filter((g) => g.ancrage === a).length]));
}

export default { ANCRAGES, GESTES, ici, geste, parAncrage };
