/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LA SEMAINE D'UNE CLASSE À DEUX NIVEAUX
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── POURQUOI C'EST LE CŒUR, ET PAS UN ÉCRAN PARMI D'AUTRES ───────────────────
 *
 * Un emploi du temps ordinaire répond à « qu'est-ce qu'on fait mardi à 14 h ». Dans une
 * classe à deux niveaux, cette question n'a pas une réponse mais DEUX, et la vraie
 * question est ailleurs : « est-ce que les deux groupes font la même chose, et si non,
 * lequel travaille seul pendant que je suis avec l'autre ».
 *
 * Aucun outil d'emploi du temps ne modélise ça. C'est pour ça qu'on en écrit un.
 *
 * ── TROIS FAÇONS D'OCCUPER UN CRÉNEAU, ET ELLES NE SE VALENT PAS ─────────────
 *
 *   COMMUN     les deux groupes font la même chose, ensemble. Le plus reposant, et le
 *              plus rare — il suppose que l'écart entre les attendus soit petit.
 *
 *   DÉDOUBLÉ   deux séances distinctes, menées l'une après l'autre. Coûte le double de
 *              temps de préparation et divise le temps d'enseignement par deux.
 *
 *   DÉCALÉ     un groupe en dirigé, l'autre en autonomie, puis on échange. C'est le
 *              régime ordinaire d'un double niveau — et le plus exigeant, parce qu'il
 *              suppose du travail réellement faisable seul.
 *
 * ── ET UNE SEMAINE QUI NE BOUCLE PAS LE DIT ──────────────────────────────────
 *
 * Vingt-quatre heures réglementaires, et les deux niveaux n'ont même pas la même liste
 * d'enseignements. Une grille qui affiche « conforme » sans vérifier les volumes serait
 * un mensonge confortable : `manques()` compare ce qui est posé à ce qui est dû, et
 * rend l'écart. Une heure qui manque se voit, elle ne se devine pas en juin.
 */

/** Les deux niveaux de cette classe. Fermé — on ne fait pas un outil générique. */
export const NIVEAUX = ['CE2', 'CM1'];

/**
 * Les horaires hebdomadaires réglementaires, en minutes.
 *
 * Ce sont des CHIFFRES, donc ils vivent dans le code — pas dans la mémoire d'un modèle.
 * Ils viennent des programmes en vigueur pour l'école élémentaire : 24 heures
 * d'enseignement par semaine, réparties par domaine et par cycle.
 *
 * Le CE2 est en cycle 2, le CM1 en cycle 3. C'est ce qui explique que les deux colonnes
 * n'aient pas les mêmes lignes : « Questionner le monde » n'existe pas au cycle 3, où il
 * se sépare en sciences d'un côté et histoire-géographie de l'autre.
 */
export const HORAIRES = {
  CE2: {
    francais: 600,
    mathematiques: 300,
    langue_vivante: 90,
    eps: 180,
    arts: 120,
    questionner_le_monde: 150
  },
  CM1: {
    francais: 480,
    mathematiques: 300,
    langue_vivante: 90,
    eps: 180,
    arts: 120,
    sciences: 120,
    histoire_geo_emc: 150
  }
};

/** Le nom lisible d'un domaine. Aucun écran n'affiche jamais la clé technique. */
export const DOMAINES = {
  francais: 'Français',
  mathematiques: 'Mathématiques',
  langue_vivante: 'Langue vivante',
  eps: 'Éducation physique',
  arts: 'Arts',
  questionner_le_monde: 'Questionner le monde',
  sciences: 'Sciences et technologie',
  histoire_geo_emc: 'Histoire-géo et EMC'
};

export const JOURS = ['lundi', 'mardi', 'jeudi', 'vendredi'];

/**
 * Les trois régimes d'un créneau.
 *
 * L'ordre compte : il va du moins coûteux au plus exigeant, et les écrans s'en servent
 * pour ranger. `decale` est le régime ordinaire d'un double niveau, pas l'exception.
 */
export const REGIMES = ['commun', 'decale', 'dedouble'];

export const REGIMES_DITS = {
  commun: 'ensemble',
  decale: 'en alternance',
  dedouble: 'séparément'
};

/** Le total réglementaire d'un niveau, en minutes. Vingt-quatre heures. */
export const total = (niveau) =>
  Object.values(HORAIRES[niveau] || {}).reduce((s, n) => s + n, 0);

/** Les minutes d'un créneau. Rend 0 sur des bornes absurdes plutôt que du négatif. */
export function duree(creneau) {
  const d = minutes(creneau?.debut);
  const f = minutes(creneau?.fin);
  return d === null || f === null || f <= d ? 0 : f - d;
}

/** « 09:15 » → 555. Rend `null` sur tout ce qui n'est pas une heure. */
export function minutes(heure) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(heure || '').trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** 555 → « 9 h 15 ». La forme française, parce que personne n'écrit « 09:15 » à la main. */
export function dire(min) {
  if (typeof min !== 'number' || min < 0) return '—';
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
}

/**
 * Ce qu'un niveau reçoit réellement, domaine par domaine.
 *
 * Un créneau `commun` compte pour les DEUX niveaux : c'est le même temps
 * d'enseignement, vécu ensemble. Un créneau `decale` aussi — l'autre groupe travaille en
 * autonomie sur le même domaine, ce n'est pas du temps perdu. Seul `dedouble` sépare
 * vraiment, et alors chaque groupe ne reçoit que sa part.
 *
 * C'est le calcul qui décide si une semaine tient, et il n'a rien d'évident : c'est
 * exactement pour ça qu'il est écrit une fois ici plutôt que refait de tête chaque août.
 */
export function volumes(creneaux = []) {
  const par = { CE2: {}, CM1: {} };
  for (const c of creneaux) {
    const min = duree(c);
    if (!min) continue;
    for (const n of NIVEAUX) {
      /*
       * EN ALTERNANCE, LES DEUX GROUPES PEUVENT FAIRE DES CHOSES DIFFÉRENTES.
       *
       * Trouvé en montant une vraie semaine : le CE2 doit « Questionner le monde » pendant
       * que le CM1 fait de l'histoire. Ces deux-là n'existent pas dans l'autre cycle, donc
       * ils ne peuvent pas être communs — mais ils se mènent SIMULTANÉMENT, l'un en
       * autonomie pendant que l'autre est en dirigé, puis on échange.
       *
       * Sans ça, il fallait tout dédoubler, et une semaine de 24 heures n'y suffisait
       * jamais : les deux programmes ne rentraient pas. C'est le modèle qui était faux,
       * pas l'emploi du temps.
       */
      const domaine = c.regime === 'commun' ? c.domaine : (c[n]?.domaine || c.domaine);
      if (!domaine) continue;
      // Seul le DÉDOUBLÉ divise : on y mène les deux séances l'une APRÈS l'autre. Ne pas
      // diviser gonflerait la semaine d'heures qui n'existent pas.
      const part = c.regime === 'dedouble' ? Math.round(min / 2) : min;
      par[n][domaine] = (par[n][domaine] || 0) + part;
    }
  }
  return par;
}

/**
 * L'écart entre ce qui est posé et ce qui est dû, domaine par domaine.
 *
 * Rend TOUT : ce qui manque, ce qui déborde, et ce qui n'a aucun créneau. Un domaine
 * absent de la grille n'est pas « à zéro par choix », c'est un oubli — et il ressort ici
 * avec la totalité de son volume en manque.
 */
export function manques(creneaux = []) {
  const v = volumes(creneaux);
  const out = { CE2: [], CM1: [] };
  for (const n of NIVEAUX) {
    for (const [domaine, du] of Object.entries(HORAIRES[n])) {
      const pose = v[n][domaine] || 0;
      if (pose !== du) out[n].push({ domaine, du, pose, ecart: pose - du });
    }
    out[n].sort((a, b) => a.ecart - b.ecart);
  }
  return out;
}

/**
 * La semaine tient-elle ? Et si non, on le dit — on ne se contente pas d'un booléen.
 *
 * Le texte est destiné à être lu tel quel : quelqu'un qui monte sa grille en août a
 * besoin de savoir COMBIEN il manque et OÙ, pas qu'il y a un problème quelque part.
 */
export function verdict(creneaux = []) {
  const m = manques(creneaux);
  const total = m.CE2.length + m.CM1.length;
  if (!total) {
    return { tient: true, texte: 'Les 24 heures des deux niveaux sont couvertes.' };
  }
  const lignes = [];
  for (const n of NIVEAUX) {
    for (const x of m[n]) {
      const verbe = x.ecart < 0 ? 'manque' : 'en trop';
      lignes.push(`${n} · ${DOMAINES[x.domaine] || x.domaine} : `
        + `${dire(Math.abs(x.ecart))} ${verbe}${x.pose ? '' : ' — aucun créneau posé'}`);
    }
  }
  return {
    tient: false,
    texte: `${total} écart(s) entre la grille et les 24 heures réglementaires.`,
    lignes
  };
}

/**
 * Les créneaux d'un jour, dans l'ordre de l'horloge.
 *
 * Le tri est ici et pas dans l'écran : deux écrans qui trieraient chacun de leur côté
 * finiraient par ne plus être d'accord.
 */
export const duJour = (creneaux = [], jour) =>
  creneaux.filter((c) => c.jour === jour)
    .sort((a, b) => (minutes(a.debut) ?? 0) - (minutes(b.debut) ?? 0));

/**
 * Les créneaux qui se chevauchent — parce qu'on ne peut pas être à deux endroits.
 *
 * Personne ne pose deux séances en même temps volontairement ; on le fait en déplaçant
 * un créneau et en oubliant l'autre. Sans ce contrôle, l'erreur se découvre le mardi
 * matin devant vingt-six enfants.
 */
export function chevauchements(creneaux = []) {
  const out = [];
  for (const jour of JOURS) {
    const duj = duJour(creneaux, jour);
    for (let i = 1; i < duj.length; i += 1) {
      const av = duj[i - 1];
      const ap = duj[i];
      const finAv = minutes(av.fin);
      const debAp = minutes(ap.debut);
      if (finAv !== null && debAp !== null && debAp < finAv) out.push({ jour, av, ap });
    }
  }
  return out;
}

export default { NIVEAUX, HORAIRES, DOMAINES, JOURS, REGIMES, REGIMES_DITS,
                 total, duree, minutes, dire, volumes, manques, verdict, duJour,
                 chevauchements };
