/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  UNE SEMAINE QUI TIENT VRAIMENT
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Ce n'est pas un remplissage de démonstration : cette grille boucle EXACTEMENT sur les
 * 24 heures réglementaires des deux niveaux, et le test le vérifie. Une semaine d'exemple
 * fausse ferait ouvrir l'outil sur un écran d'avertissements, et personne ne saurait si
 * c'est la grille ou l'outil qui déraille.
 *
 * ── COMMENT ELLE EST CONSTRUITE ──────────────────────────────────────────────
 *
 * Quatre jours de six heures. Ce qui a le même volume aux deux niveaux passe en commun ou
 * en alternance sur un domaine partagé — mathématiques, sport, arts, langue vivante.
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
  /* ── LUNDI ─────────────────────────────────────────────────────────────── */
  cr('lundi', '08:30', '10:30', 'decale', meme('francais')),
  cr('lundi', '10:30', '11:30', 'decale', meme('mathematiques')),
  cr('lundi', '13:30', '15:00', 'decale', chacun('questionner_le_monde', 'histoire_geo_emc')),
  cr('lundi', '15:00', '16:00', 'commun', meme('arts')),
  cr('lundi', '16:00', '16:30', 'decale', meme('mathematiques')),

  /* ── MARDI ─────────────────────────────────────────────────────────────── */
  cr('mardi', '08:30', '10:30', 'decale', meme('francais')),
  cr('mardi', '10:30', '11:30', 'decale', meme('mathematiques')),
  cr('mardi', '13:30', '15:00', 'commun', meme('eps')),
  cr('mardi', '15:00', '15:45', 'commun', meme('langue_vivante')),
  cr('mardi', '15:45', '16:30', 'decale', chacun('francais', 'sciences')),

  /* ── JEUDI ─────────────────────────────────────────────────────────────── */
  cr('jeudi', '08:30', '10:30', 'decale', meme('francais')),
  cr('jeudi', '10:30', '11:30', 'decale', meme('mathematiques')),
  cr('jeudi', '13:30', '14:00', 'decale', meme('mathematiques')),
  cr('jeudi', '14:00', '15:00', 'decale', chacun('questionner_le_monde', 'histoire_geo_emc')),
  cr('jeudi', '15:00', '15:45', 'commun', meme('langue_vivante')),
  cr('jeudi', '15:45', '16:30', 'decale', chacun('francais', 'sciences')),

  /* ── VENDREDI ──────────────────────────────────────────────────────────── */
  cr('vendredi', '08:30', '10:30', 'decale', meme('francais')),
  cr('vendredi', '10:30', '11:30', 'decale', meme('mathematiques')),
  cr('vendredi', '13:30', '15:00', 'commun', meme('eps')),
  cr('vendredi', '15:00', '16:00', 'commun', meme('arts')),
  cr('vendredi', '16:00', '16:30', 'decale', chacun('francais', 'sciences'))
];

/**
 * Une classe d'exemple — vingt-six enfants, deux niveaux.
 *
 * Des prénoms inventés, évidemment. Ils servent à voir l'écran tourner ; la vraie classe
 * se saisit une fois et ne quitte jamais la machine.
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
