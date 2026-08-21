/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  NON ÉVALUÉ N'EST PAS NON ATTEINT
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── LA RÈGLE QUI TIENT TOUT LE RESTE ─────────────────────────────────────────
 *
 * Un élève absent le jour de l'évaluation n'a pas échoué. Un attendu qu'on n'a pas encore
 * travaillé n'est pas un attendu manqué. Une compétence évaluée une seule fois, un mardi
 * de novembre, n'est pas une compétence « acquise ».
 *
 * Ces trois phrases ont l'air évidentes. Elles cessent de l'être au moment où un écran
 * doit remplir une case, et où la case vide est plus laide que la case rouge. C'est là
 * que les outils mentent — pas par malveillance, par horreur du vide.
 *
 * Ce module refuse. `NON_EVALUE` n'est PAS une valeur du vocabulaire : c'est l'absence de
 * relevé, et elle se propage jusqu'à l'écran sans jamais devenir un résultat.
 *
 * ── PAS DE MOYENNE, PAS DE POURCENTAGE, PAS DE RANG ──────────────────────────
 *
 * On pourrait convertir les quatre niveaux en 0-1-2-3 et en faire une moyenne. Le chiffre
 * serait faux et il serait cru : il additionnerait des attendus qui n'ont ni le même
 * poids, ni le même nombre d'observations, ni la même date. Et il permettrait de classer
 * des enfants, ce qu'aucun écran de cet outil ne fera.
 *
 * Ce que le module rend à la place : le COMPTE par niveau, et la liste de ce qui n'a
 * jamais été observé. Deux informations vraies valent mieux qu'un nombre commode.
 */

/**
 * Le vocabulaire du livret scolaire unique. FERMÉ.
 *
 * L'ordre va du moins au plus : il sert à ranger un tableau, jamais à faire une moyenne.
 */
export const NIVEAUX = ['non_atteint', 'partiellement', 'atteint', 'depasse'];

export const NIVEAUX_DITS = {
  non_atteint: 'Objectifs non atteints',
  partiellement: 'Partiellement atteints',
  atteint: 'Atteints',
  depasse: 'Dépassés'
};

/**
 * L'absence de relevé. Ce n'est PAS un niveau — d'où le fait qu'elle ne soit pas dans
 * `NIVEAUX`. Tout code qui la traiterait comme une cinquième valeur se trompe.
 */
export const NON_EVALUE = 'non_evalue';

export const estUnNiveau = (v) => NIVEAUX.includes(v);

/**
 * Un relevé : un élève, un attendu, un niveau, une date, et d'où ça vient.
 *
 * `origine` n'est pas décoratif. « observé pendant l'atelier » et « évaluation écrite du
 * 12 mars » n'ont pas le même poids quand il faut trancher en juin, et l'écran doit
 * pouvoir les distinguer sans que l'enseignant s'en souvienne.
 */
export function releve({ eleve, attendu, niveau, date, origine = '' } = {}) {
  if (!eleve || !attendu) return null;
  if (!estUnNiveau(niveau)) return null;      // on n'enregistre pas un niveau inventé
  return { eleve, attendu, niveau, date: date || '', origine };
}

/**
 * L'état d'un élève sur un attendu, à partir de tous ses relevés.
 *
 * ── LE DERNIER RELEVÉ PRIME, ET IL EST DATÉ ─────────────────────────────────
 *
 * On ne fait pas la moyenne des relevés : un enfant qui ne savait pas en octobre et qui
 * sait en mai SAIT. Moyenner reviendrait à lui faire payer ses débuts, ce qui est le
 * contraire de ce qu'une évaluation par compétences cherche à faire.
 *
 * Mais on rend AUSSI le nombre d'observations et la date de la dernière : « atteint, vu
 * une fois, en novembre » et « atteint, vu quatre fois, la semaine dernière » sont deux
 * situations différentes, et l'écran doit pouvoir le montrer.
 */
export function etat(releves = [], eleve, attendu) {
  const miens = releves
    .filter((r) => r && r.eleve === eleve && r.attendu === attendu && estUnNiveau(r.niveau))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  if (!miens.length) {
    return { eleve, attendu, niveau: NON_EVALUE, observations: 0, depuis: '', releves: [] };
  }
  const dernier = miens[miens.length - 1];
  return {
    eleve, attendu,
    niveau: dernier.niveau,
    observations: miens.length,
    depuis: dernier.date,
    /* Vu une seule fois : ce n'est pas un doute sur l'enfant, c'est un doute sur la
       MESURE. L'écran doit pouvoir le dire sans changer le niveau. */
    fragile: miens.length < 2,
    releves: miens
  };
}

/**
 * Le compte par niveau sur un attendu, pour toute la classe.
 *
 * `non_evalue` figure dans le résultat, à part et nommé. C'est le chiffre qu'on ne veut
 * pas voir et c'est exactement pour ça qu'il est là.
 */
export function repartition(releves = [], eleves = [], attendu) {
  const par = Object.fromEntries(NIVEAUX.map((n) => [n, 0]));
  par[NON_EVALUE] = 0;
  for (const e of eleves) par[etat(releves, e, attendu).niveau] += 1;
  return par;
}

/**
 * Ce dont on n'a AUCUNE trace — l'inventaire inconfortable, et le plus utile.
 *
 * Deux angles, parce que les deux trous ne se corrigent pas pareil :
 *
 *   par ATTENDU  un attendu que personne n'a jamais passé : c'est un trou de programme,
 *                il se comble par une séance et une évaluation.
 *   par ÉLÈVE    un enfant sur lequel on n'a presque rien : souvent le discret, celui
 *                qui ne gêne pas. C'est un trou d'attention, et il ne se voit nulle part
 *                ailleurs.
 */
export function trous(releves = [], eleves = [], attendus = []) {
  const parAttendu = [];
  for (const a of attendus) {
    const vus = eleves.filter((e) => etat(releves, e, a).niveau !== NON_EVALUE);
    if (vus.length < eleves.length) {
      parAttendu.push({ attendu: a, vus: vus.length, sur: eleves.length,
                        jamais: vus.length === 0 });
    }
  }

  const parEleve = [];
  for (const e of eleves) {
    const vus = attendus.filter((a) => etat(releves, e, a).niveau !== NON_EVALUE);
    parEleve.push({ eleve: e, vus: vus.length, sur: attendus.length });
  }
  parEleve.sort((a, b) => a.vus - b.vus);

  return {
    parAttendu: parAttendu.sort((a, b) => a.vus - b.vus),
    parEleve,
    /* Les moins observés, mais seulement s'ils décrochent VRAIMENT du reste de la classe.
       Sur une classe régulièrement suivie, cette liste doit être vide — et c'est bien. */
    discrets: parEleve.filter((x) => attendus.length && x.vus < attendus.length * 0.5)
  };
}

/**
 * Ce qu'on peut écrire honnêtement sur un attendu, en une phrase.
 *
 * Cette phrase est faite pour être relue et corrigée, jamais recopiée telle quelle dans
 * le livret. Elle dit ce qui est mesuré et ce qui ne l'est pas — c'est tout ce qu'un
 * calcul a le droit de dire.
 */
export function direLAttendu(releves, eleves, attendu, libelle = attendu) {
  const r = repartition(releves, eleves, attendu);
  const evalues = eleves.length - r[NON_EVALUE];

  if (!evalues) {
    return `${libelle} — AUCUN élève n'a été évalué là-dessus. Ce n'est pas un résultat : `
      + 'c\'est une mesure qui n\'existe pas. Rien ne peut en être conclu, ni pour la '
      + 'classe ni pour un enfant.';
  }

  const parts = NIVEAUX.filter((n) => r[n])
    .map((n) => `${r[n]} ${NIVEAUX_DITS[n].toLowerCase()}`);
  let phrase = `${libelle} — sur ${evalues} élève(s) évalué(s) : ${parts.join(', ')}.`;

  if (r[NON_EVALUE]) {
    phrase += ` ${r[NON_EVALUE]} élève(s) N'ONT PAS été évalués — ils ne comptent dans `
      + 'aucun des chiffres ci-dessus, et surtout pas dans « non atteints ».';
  }
  return phrase;
}

export default { NIVEAUX, NIVEAUX_DITS, NON_EVALUE, estUnNiveau, releve, etat,
                 repartition, trous, direLAttendu };
