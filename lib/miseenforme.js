/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  DU TEXTE DU MODÈLE À DES BLOCS QU'ON PEUT METTRE EN PAGE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Ce qui revient du modèle est du texte : des titres, des listes, des passages en gras.
 * Pour en faire un document Word ou une image, il faut savoir ce qui est quoi.
 *
 * ── LE DÉCOUPAGE EST DÉLIBÉRÉMENT NAÏF ──────────────────────────────────────
 *
 * On reconnaît quatre formes, pas davantage : un titre, une puce, un paragraphe, un blanc.
 * Un analyseur plus malin se tromperait de façon plus difficile à voir — et ce qui est en
 * jeu ici n'est pas la finesse typographique : c'est qu'AUCUN mot du modèle ne disparaisse
 * en route. Une ligne qu'on ne reconnaît pas devient un paragraphe. Jamais rien.
 */

/**
 * Découper une réponse en blocs.
 *
 * @returns {Array<{type:'titre'|'puce'|'paragraphe', niveau?:number, morceaux:Array}>}
 */
export function enBlocs(texte) {
  const blocs = [];
  for (const brute of String(texte || '').split('\n')) {
    const l = brute.replace(/\s+$/, '');
    if (!l.trim()) { blocs.push({ type: 'blanc', morceaux: [] }); continue; }

    // « # », « ## », « ### » — et les titres que le modèle écrit EN CAPITALES, qui sont
    // la forme qu'il emploie le plus souvent quand la consigne en emploie elle-même.
    const diese = /^(#{1,4})\s+(.*)$/.exec(l.trim());
    if (diese) {
      blocs.push({ type: 'titre', niveau: diese[1].length, morceaux: enMorceaux(diese[2]) });
      continue;
    }
    const nu = l.trim();
    if (nu.length > 3 && nu.length < 90 && nu === nu.toUpperCase() && /[A-ZÀ-Ý]/.test(nu)
        && !/^[-·•*\d]/.test(nu)) {
      blocs.push({ type: 'titre', niveau: 2, morceaux: enMorceaux(nu) });
      continue;
    }

    const puce = /^\s*([-–—•*·]|\d+[.)])\s+(.*)$/.exec(l);
    if (puce) {
      // Le retrait dit la profondeur : deux niveaux suffisent, au-delà c'est illisible
      // sur une feuille imprimée.
      const creux = Math.min(1, Math.floor((/^\s*/.exec(l)[0].length) / 3));
      blocs.push({ type: 'puce', niveau: creux, morceaux: enMorceaux(puce[2]) });
      continue;
    }
    blocs.push({ type: 'paragraphe', morceaux: enMorceaux(l.trim()) });
  }

  /*
   * Un blanc en tête ou en queue ne porte rien ; deux blancs de suite non plus.
   *
   * La première version filtrait sur les positions D'ORIGINE : après avoir retiré les
   * blancs de tête, « dernier » ne désignait plus le dernier, et une ligne vide survivait
   * en fin de document Word. On réduit donc d'abord, on rogne ensuite.
   */
  const serres = blocs.filter((b, i) => !(b.type === 'blanc' && blocs[i - 1]?.type === 'blanc'));
  while (serres[0]?.type === 'blanc') serres.shift();
  while (serres[serres.length - 1]?.type === 'blanc') serres.pop();
  return serres;
}

/**
 * Le gras, à l'intérieur d'une ligne.
 *
 * `**comme ça**` — la seule forme reconnue. Les astérisques non appariés restent tels
 * quels : mieux vaut une étoile en trop dans un document qu'un mot avalé.
 */
export function enMorceaux(ligne) {
  const out = [];
  const src = String(ligne || '');
  const motif = /\*\*(.+?)\*\*/g;
  let dernier = 0;
  for (const m of src.matchAll(motif)) {
    if (m.index > dernier) out.push({ texte: src.slice(dernier, m.index), gras: false });
    out.push({ texte: m[1], gras: true });
    dernier = m.index + m[0].length;
  }
  if (dernier < src.length) out.push({ texte: src.slice(dernier), gras: false });
  return out.length ? out : [{ texte: '', gras: false }];
}

/** Le texte nu d'un bloc — pour mesurer, pour couper les lignes, pour vérifier. */
export const nu = (bloc) => (bloc.morceaux || []).map((m) => m.texte).join('');

/**
 * ── LE DOCUMENT NE PORTE PLUS D'AVERTISSEMENT EN TÊTE ───────────────────────
 *
 * La première version ouvrait chaque export par un bloc de réserves : « proposition d'un
 * modèle », « rien ici n'est un bilan », « le texte attendu manquait ». L'intention était
 * bonne, la place ne l'était pas. Quand on imprime une correction pour la poser à côté
 * des copies, on n'imprime pas la notice de l'outil qui l'a produite.
 *
 * Il reste UNE ligne, en bas, en petit : de quel exercice il s'agit, quel jour, et avec
 * quoi ça a été préparé. Assez pour savoir d'où vient un papier retrouvé en juin ; pas
 * assez pour s'imposer entre l'enseignant et son travail.
 *
 * Les réserves qui comptent vraiment — le texte attendu qui manquait, les élèves sans
 * copie — restent à l'écran, où elles sont utiles AVANT d'imprimer.
 */
export function pied({ exercice = '', quand = '', modele = '', copies = 0 } = {}) {
  const bouts = [
    exercice,
    copies ? `${copies} copie${copies > 1 ? 's' : ''}` : '',
    quand,
    modele ? `préparé avec ${modele}` : ''
  ].filter(Boolean);
  if (!bouts.length) return [];
  return [
    { type: 'blanc', morceaux: [] },
    { type: 'paragraphe', discret: true,
      morceaux: [{ texte: bouts.join(' · '), taille: 16 }] }
  ];
}

/** Le titre du document : le nom de l'exercice, pas celui du geste. */
export const titre = ({ exercice = '', nomDuGeste = '' } = {}) => [
  { type: 'titre', niveau: 1, morceaux: enMorceaux(exercice || nomDuGeste || 'Correction') }
];

export default { enBlocs, enMorceaux, nu, pied, titre };
