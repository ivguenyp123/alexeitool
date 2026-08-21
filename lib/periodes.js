/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LES PÉRIODES — CINQ MORCEAUX D'ANNÉE, ET AUCUNE DATE INVENTÉE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * L'année scolaire se découpe en cinq périodes, séparées par les vacances. C'est l'unité
 * dans laquelle un enseignant pense vraiment : on ne dit pas « en novembre », on dit
 * « avant la Toussaint ».
 *
 * ── POURQUOI LES DATES NE SONT PAS ÉCRITES ICI ──────────────────────────────
 *
 * Elles dépendent de la ZONE (Paris est en zone C) et changent chaque année. Je pourrais
 * les taper : elles auraient l'air justes, et personne ne vérifierait. C'est exactement
 * l'erreur qu'on interdit trente-deux fois par ailleurs — et ici elle serait pire, parce
 * qu'un bilan de période calé sur les mauvaises dates ne se voit pas : il se lit très bien.
 *
 * Alors l'enseignant les pose une fois, en septembre, en recopiant le calendrier affiché
 * en salle des maîtres. Cinq lignes, cinq minutes, et tout ce qui en dépend devient vrai.
 *
 * Tant qu'elles ne sont pas posées, les périodes existent quand même — sans dates. On
 * travaille alors sur « depuis la dernière fois », ce qui est moins précis et ce qui est
 * DIT. Un outil qui refuserait de fonctionner en septembre serait un outil qu'on n'ouvre
 * pas en octobre.
 */

/** Les cinq périodes, dans leur ordre et sous le nom qu'on leur donne vraiment. */
export const PERIODES = [
  { n: 1, nom: 'Période 1', dite: 'de la rentrée à la Toussaint' },
  { n: 2, nom: 'Période 2', dite: 'de la Toussaint à Noël' },
  { n: 3, nom: 'Période 3', dite: 'de janvier aux vacances d\'hiver' },
  { n: 4, nom: 'Période 4', dite: 'des vacances d\'hiver à celles de printemps' },
  { n: 5, nom: 'Période 5', dite: 'du printemps à juillet' }
];

const jour = (s) => {
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Le calendrier tel que l'enseignant l'a posé.
 *
 * @param {Array} bornes `[{ n, debut, fin }]` en AAAA-MM-JJ. Incomplet est permis :
 *                       une période sans dates reste une période.
 */
export function calendrier(bornes = []) {
  const par = new Map(bornes.filter((b) => b && b.n).map((b) => [Number(b.n), b]));
  return PERIODES.map((p) => {
    const b = par.get(p.n) || {};
    const debut = b.debut && jour(b.debut) ? b.debut : '';
    const fin = b.fin && jour(b.fin) ? b.fin : '';
    // Une fin avant le début n'est pas une période : on refuse plutôt que de laisser un
    // intervalle vide qui écarterait silencieusement tout ce qu'on y range.
    const renverse = Boolean(debut && fin && jour(fin) < jour(debut));
    return { ...p, debut: renverse ? '' : debut, fin: renverse ? '' : fin,
             datee: Boolean(debut && fin) && !renverse, renverse };
  });
}

/** Ce qui reste à poser, nommé. Un compte, pas un pourcentage. */
export const aPoser = (cal) => cal.filter((p) => !p.datee);

/**
 * Dans quelle période tombe cette date. `null` quand aucune ne la contient — soit parce
 * que les bornes ne sont pas posées, soit parce qu'on est en vacances.
 */
export function periodeDe(cal, date = new Date()) {
  const d = typeof date === 'string' ? jour(date) : date;
  if (!d) return null;
  const iso = d.toISOString().slice(0, 10);
  return cal.find((p) => p.datee && p.debut <= iso && iso <= p.fin) || null;
}

/**
 * Ce qui a été relevé pendant une période.
 *
 * Sans bornes, on ne filtre PAS : rendre une liste vide ferait croire que rien n'a été
 * observé, alors que c'est le calendrier qui manque. Les deux se ressemblent à l'écran et
 * n'appellent pas du tout la même action.
 */
export function releveDe(releves = [], periode) {
  if (!periode?.datee) return { releves, filtre: false };
  return {
    releves: releves.filter((r) => r.date && periode.debut <= r.date && r.date <= periode.fin),
    filtre: true
  };
}

/**
 * La période dite au modèle — avec, quand elles manquent, l'aveu que les dates manquent.
 */
export function direLaPeriode(periode, { filtre = true } = {}) {
  const L = [];
  if (!periode) {
    L.push('AUCUNE PÉRIODE N\'EST DÉSIGNÉE');
    L.push('  Tu travailles sur ce qui t\'est donné, sans le rattacher à un moment de');
    L.push('  l\'année, et tu ne supposes pas de quelle période il s\'agit.');
    return L.join('\n');
  }
  L.push(`LA PÉRIODE : ${periode.nom} — ${periode.dite}`);
  if (periode.datee) {
    L.push(`  Du ${periode.debut} au ${periode.fin}.`);
  } else {
    /*
     * LES DATES NE SONT PAS POSÉES. Le dire, plutôt que de laisser croire que le filtre
     * a joué : un bilan présenté comme « celui de la période » alors qu'il porte sur
     * toute l'année serait faux sans en avoir l'air.
     */
    L.push('  ATTENTION — les dates de cette période n\'ont pas été posées dans l\'outil.');
    L.push(`  ${filtre ? 'Ce qui suit a été filtré autrement.'
                       : 'CE QUI SUIT N\'A DONC PAS ÉTÉ FILTRÉ : tu vois tout ce qui a été'}`);
    if (!filtre) {
      L.push('  relevé depuis le début de l\'année, pas seulement cette période. Ne présente');
      L.push('  donc rien comme « le bilan de la période » sans dire cette réserve.');
    }
  }
  return L.join('\n');
}

export default { PERIODES, calendrier, aPoser, periodeDe, releveDe, direLaPeriode };
