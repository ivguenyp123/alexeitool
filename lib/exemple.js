/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  UNE SEMAINE QUI TIENT VRAIMENT — AU RYTHME DE PARIS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Ce n'est pas un remplissage de démonstration : cette grille boucle EXACTEMENT sur les
 * 24 heures réglementaires des deux niveaux, et le test le vérifie. Une semaine d'exemple
 * fausse ferait ouvrir l'outil sur un écran d'avertissements, et personne ne saurait si
 * c'est la grille ou l'outil qui déraille.
 *
 * ── LE RYTHME RÉEL ───────────────────────────────────────────────────────────
 *
 *   lundi      8 h 30 – 16 h 30     6 h
 *   mardi      8 h 30 – 15 h        4 h 30
 *   mercredi   8 h 30 – 11 h 30     3 h        ← le matin seulement
 *   jeudi      8 h 30 – 16 h 30     6 h
 *   vendredi   8 h 30 – 15 h        4 h 30
 *                                  ────────
 *                                   24 h
 *
 * Ce qui suit 15 heures le mardi et le vendredi est du périscolaire : ça n'appartient pas
 * à l'enseignant et n'a rien à faire dans cette grille.
 *
 * Conséquence sur la construction : les journées ne sont plus interchangeables. Le mercredi
 * ne tient que trois heures, donc il ne reçoit que du quotidien — français et
 * mathématiques. Ce qui demande de l'installation va sur les journées entières.
 *
 * Ce qui a le même volume aux deux niveaux passe en commun ou en alternance sur un
 * domaine partagé — mathématiques, sport, arts, langue vivante.
 *
 * Les deux difficultés du CE2-CM1 se règlent en ALTERNANCE SUR DES DOMAINES DIFFÉRENTS :
 *
 *   · « Questionner le monde » (CE2, cycle 2) contre « Histoire-géographie et EMC »
 *     (CM1, cycle 3) — 150 minutes chacun, en même temps ;
 *   · les deux heures de français que le CE2 a en plus, pendant lesquelles le CM1 fait
 *     ses sciences.
 *
 * C'est exactement ce qu'un enseignant fait dans la vraie vie, et aucun outil d'emploi du
 * temps ordinaire ne sait le représenter.
 */

const cr = (jour, debut, fin, regime, quoi) => ({ jour, debut, fin, regime, ...quoi });

/** Le domaine partagé par les deux niveaux. */
const meme = (domaine) => ({ domaine });

/** Deux domaines différents, menés en même temps. */
const chacun = (ce2, cm1) => ({ CE2: { domaine: ce2 }, CM1: { domaine: cm1 } });

export const SEMAINE = [
  /* ── LUNDI · journée entière, 6 h ──────────────────────────────────────── */
  cr('lundi', '08:30', '10:30', 'decale', meme('francais')),
  cr('lundi', '10:30', '11:30', 'decale', meme('mathematiques')),
  cr('lundi', '13:30', '15:00', 'decale', chacun('questionner_le_monde', 'histoire_geo_emc')),
  cr('lundi', '15:00', '16:30', 'commun', meme('arts')),

  /* ── MARDI · fin à 15 h, 4 h 30 ────────────────────────────────────────── */
  cr('mardi', '08:30', '10:30', 'decale', meme('francais')),
  cr('mardi', '10:30', '11:30', 'decale', meme('mathematiques')),
  cr('mardi', '13:30', '15:00', 'commun', meme('eps')),

  /* ── MERCREDI · matin seul, 3 h ────────────────────────────────────────── */
  cr('mercredi', '08:30', '10:30', 'decale', meme('francais')),
  cr('mercredi', '10:30', '11:30', 'decale', meme('mathematiques')),

  /* ── JEUDI · journée entière, 6 h ──────────────────────────────────────── */
  cr('jeudi', '08:30', '10:30', 'decale', meme('francais')),
  cr('jeudi', '10:30', '11:30', 'decale', meme('mathematiques')),
  cr('jeudi', '13:30', '14:30', 'decale', chacun('questionner_le_monde', 'histoire_geo_emc')),
  cr('jeudi', '14:30', '15:15', 'commun', meme('langue_vivante')),
  cr('jeudi', '15:15', '16:30', 'decale', chacun('francais', 'sciences')),

  /* ── VENDREDI · fin à 15 h, 4 h 30 ─────────────────────────────────────── */
  cr('vendredi', '08:30', '09:30', 'decale', meme('mathematiques')),
  cr('vendredi', '09:30', '10:15', 'commun', meme('langue_vivante')),
  cr('vendredi', '10:15', '10:45', 'commun', meme('arts')),
  cr('vendredi', '10:45', '11:30', 'decale', chacun('francais', 'sciences')),
  cr('vendredi', '13:30', '15:00', 'commun', meme('eps'))
];

/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  UNE CLASSE D'EXEMPLE — ET ELLE N'EST PLUS CHARGÉE PAR DÉFAUT
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Elle ne sert plus qu'aux vérifications.
 *
 * ── CE QU'ELLE A COÛTÉ ──────────────────────────────────────────────────────
 *
 * Elle s'installait au premier lancement, pour que l'écran ne soit pas vide. Un
 * enseignant a déposé quatre vraies copies : elles ont été rattachées à quatre de ces
 * enfants-là, et la correction est revenue en parlant d'« Alice » — qui n'existe pas, qui
 * n'avait rien rendu, et à qui le modèle attribuait un exercice réussi.
 *
 * Une donnée d'exemple qui ressemble à une vraie donnée cesse de s'en distinguer dès
 * qu'on travaille pour de bon. La semaine d'exemple, elle, reste : c'est une grille
 * horaire, on voit en trois secondes que ce n'est pas la sienne, et elle sert de point de
 * départ à modifier. Une liste de prénoms plausibles, non.
 */
export const CLASSE = [
  { prenom: 'Adam', niveau: 'CE2' }, { prenom: 'Alice', niveau: 'CM1' },
  { prenom: 'Ambre', niveau: 'CE2' }, { prenom: 'Arthur', niveau: 'CM1' },
  { prenom: 'Basile', niveau: 'CE2' }, { prenom: 'Camille', niveau: 'CM1' },
  { prenom: 'Chloé', niveau: 'CE2' }, { prenom: 'Élias', niveau: 'CM1' },
  { prenom: 'Éva', niveau: 'CE2' }, { prenom: 'Gabin', niveau: 'CM1' },
  { prenom: 'Inès', niveau: 'CE2' }, { prenom: 'Jade', niveau: 'CM1' },
  { prenom: 'Léa', niveau: 'CE2' }, { prenom: 'Léandre', niveau: 'CM1' },
  { prenom: 'Lina', niveau: 'CE2' }, { prenom: 'Louis', niveau: 'CM1' },
  { prenom: 'Malo', niveau: 'CE2' }, { prenom: 'Marie', niveau: 'CM1' },
  { prenom: 'Marie-Lou', niveau: 'CE2' }, { prenom: 'Nour', niveau: 'CM1' },
  { prenom: 'Olivia', niveau: 'CE2' }, { prenom: 'Rayan', niveau: 'CM1' },
  { prenom: 'Sacha', niveau: 'CE2' }, { prenom: 'Tom', niveau: 'CM1' },
  { prenom: 'Yanis', niveau: 'CE2' }, { prenom: 'Zoé', niveau: 'CM1' }
];

export default { SEMAINE, CLASSE };
