/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  QUEL PROGRAMME S'APPLIQUE — ET LA CLASSE EST PILE SUR LA BASCULE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── CE QUI REND CETTE ANNÉE PARTICULIÈRE ────────────────────────────────────
 *
 * Les programmes d'EPS, d'histoire-géographie et de sciences et technologie ont été
 * réécrits. Ils n'entrent pas en vigueur partout en même temps : à la rentrée 2026-2027
 * pour le CP et le CM1, à la rentrée 2027-2028 pour les autres niveaux.
 *
 * Une classe de CE2-CM1 en 2026-2027 est donc à cheval sur DEUX transitions :
 *
 *              CE2                          CM1
 *   cycle      fin de cycle 2               début de cycle 3
 *   programme  ANCIEN (maintenu 2026-27)    NOUVEAU (en vigueur 2026-27)
 *
 * Sur un créneau en alternance « Questionner le monde / Histoire-géo », les deux groupes
 * ne sont pas seulement dans deux cycles : ils sont dans deux GÉNÉRATIONS de programmes.
 * Donner le même texte aux deux se tromperait pour l'un des deux, systématiquement — et
 * personne ne s'en apercevrait avant une inspection.
 *
 * ── POURQUOI C'EST DANS LE CODE ET PAS DANS UNE CONSIGNE ────────────────────
 *
 * C'est une DATE et une RÈGLE. Ça se calcule, ça ne se raconte pas. Un modèle interrogé
 * là-dessus répondrait de mémoire, avec aplomb, et se tromperait d'un an — ce qui est
 * exactement le genre d'erreur qu'on ne rattrape pas.
 *
 * ── À FAIRE CONFIRMER ───────────────────────────────────────────────────────
 *
 * Relevé le 21 août 2026 depuis les textes officiels. Les références sont dans `SOURCES`.
 * Un enseignant doit les vérifier : c'est cinq minutes pour lui, et il est le seul à
 * pouvoir le faire avec autorité.
 */

/** D'où viennent ces règles. Toute affirmation d'ici doit pouvoir se remonter à une ligne. */
export const SOURCES = {
  eps_hg: 'BO 2026 n°22 — MENE2608631A : programmes d\'EPS et d\'histoire-géographie '
        + 'des cycles 2 et 3',
  sciences: 'BO 2026 n°24 — MENE2611650A : programmes de sciences et technologie '
          + 'des cycles 2 et 3',
  releve: '2026-08-21'
};

/**
 * Les domaines qui basculent, et l'année où le nouveau programme s'applique À CE NIVEAU.
 *
 * Les domaines absents de cette table ne basculent pas : leur programme est le même pour
 * tout le monde. Ne pas les y mettre est un choix, pas un oubli.
 */
export const BASCULE = {
  eps: { CM1: 2026, CE2: 2027 },
  histoire_geo_emc: { CM1: 2026 },
  questionner_le_monde: { CE2: 2027 },
  sciences: { CM1: 2026 },
};

/**
 * Quel programme s'applique à ce niveau, sur ce domaine, cette année scolaire.
 *
 * `annee` est l'année de RENTRÉE : 2026 pour l'année scolaire 2026-2027.
 *
 * Rend `null` quand le domaine ne bascule pas — il n'y a alors pas deux programmes, et
 * dire « ancien » serait inventer une distinction qui n'existe pas.
 */
export function programme(domaine, niveau, annee) {
  const depuis = BASCULE[domaine]?.[niveau];
  if (!depuis) return null;
  return {
    domaine, niveau,
    generation: annee >= depuis ? 'nouveau' : 'ancien',
    bascule: depuis,
    source: domaine === 'sciences' ? SOURCES.sciences : SOURCES.eps_hg
  };
}

/**
 * Les deux groupes sont-ils sur des programmes DIFFÉRENTS pour ce créneau ?
 *
 * C'est la question que cet outil existe pour poser. Elle ne se pose que sur un créneau où
 * chaque niveau a son domaine — donc précisément là où le double niveau est déjà le plus
 * délicat.
 */
export function ecartDeProgramme(creneau, annee) {
  if (!creneau || creneau.regime === 'commun') {
    const p = programme(creneau?.domaine, 'CE2', annee);
    const q = programme(creneau?.domaine, 'CM1', annee);
    if (!p || !q || p.generation === q.generation) return null;
    return { CE2: p, CM1: q };
  }
  const p = programme(creneau.CE2?.domaine || creneau.domaine, 'CE2', annee);
  const q = programme(creneau.CM1?.domaine || creneau.domaine, 'CM1', annee);
  if (!p && !q) return null;
  if (p && q && p.generation === q.generation) return null;
  return { CE2: p, CM1: q };
}

/**
 * L'avertissement à donner au modèle — et à afficher — quand les deux groupes ne sont pas
 * sur la même génération de programme.
 *
 * Il est écrit pour être lu tel quel : il nomme les deux textes, l'année de bascule, et
 * l'ordre de ne pas mélanger.
 */
export function direLEcart(ecart) {
  if (!ecart) return '';
  const L = [];
  L.push('ATTENTION — LES DEUX GROUPES NE SONT PAS SUR LE MÊME PROGRAMME');
  for (const niveau of ['CE2', 'CM1']) {
    const p = ecart[niveau];
    if (!p) { L.push(`  ${niveau} : ce domaine ne bascule pas — un seul programme.`); continue; }
    L.push(`  ${niveau} : programme ${p.generation.toUpperCase()}`
         + ` (le nouveau s'applique à ce niveau à la rentrée ${p.bascule}).`);
  }
  L.push('  Ne mélange pas les deux. Si tu ne peux pas traiter les deux séparément, traite');
  L.push('  celui pour lequel tu as le texte et DIS que tu n\'as pas fait l\'autre.');
  return L.join('\n');
}

export default { SOURCES, BASCULE, programme, ecartDeProgramme, direLEcart };
