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
 * ── LE MODÈLE ÉCRIT DU HTML, ET IL FAUT LE LIRE ─────────────────────────────
 *
 * Constaté sur une séance de numération : la réponse arrivait en une seule ligne, avec
 * des `<br>` partout. Découpée sur les retours à la ligne, elle donnait UN paragraphe de
 * quinze lignes — la fiche était illisible, et l'outil avait l'air cassé.
 *
 * Un modèle écrit du markdown, du HTML, ou les deux mêlés, selon l'humeur du moment. On
 * ne va pas le lui reprocher à chaque envoi : on le lit.
 *
 * Les balises inconnues sont RETIRÉES, pas rendues : mieux vaut une mise en forme perdue
 * qu'un « <strong> » imprimé au milieu d'une fiche de préparation.
 */
export function deHtml(texte) {
  return String(texte || '')
    // Tout ce qui sépare deux lignes en HTML devient un vrai retour à la ligne.
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/?\s*(p|div|tr|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<\s*li\b[^>]*>/gi, '\n- ')
    // Le gras HTML rejoint le gras markdown : une seule forme à traiter ensuite.
    .replace(/<\s*\/?\s*(b|strong)\s*>/gi, '**')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, '\'')
    // L'esperluette en dernier : sinon « &amp;lt; » redeviendrait « < ».
    .replace(/&amp;/gi, '&');
}

/** Une ligne de tableau markdown : « | a | b | c | ». */
const EST_LIGNE = (l) => /^\s*\|.*\|\s*$/.test(l);
const EST_SEPARATEUR = (l) => /^\s*\|[\s|:-]+\|\s*$/.test(l);
const cellules = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

/**
 * Découper une réponse en blocs.
 *
 * ── L'ORDRE COMPTE, ET JE ME SUIS TROMPÉ DESSUS ─────────────────────────────
 *
 * Première version : on convertissait le HTML, PUIS on cherchait les tableaux. Or une
 * cellule contient volontiers des `<br>` — une fois convertis en retours à la ligne, la
 * rangée « | 9:00 | Atelier… | Autonomie… | » était coupée en cinq morceaux et cessait
 * d'être un tableau. La fiche de double niveau ressortait en bouillie de barres.
 *
 * On repère donc les rangées D'ABORD, sur le texte brut, et on ne convertit le HTML
 * qu'ensuite — à l'intérieur de chaque cellule.
 *
 * @returns {Array<{type:'titre'|'puce'|'paragraphe'|'tableau', niveau?:number, morceaux:Array}>}
 */
export function enBlocs(texte) {
  const blocs = [];
  const brutes = String(texte || '').split('\n');

  /* Les rangées d'abord — sur le texte tel qu'il est arrivé. */
  const morceauxDuTexte = [];
  let tampon = [];
  const viderLeTampon = () => {
    if (tampon.length) morceauxDuTexte.push({ texte: tampon.join('\n') });
    tampon = [];
  };

  for (let i = 0; i < brutes.length; i++) {
    if (!EST_LIGNE(brutes[i])) { tampon.push(brutes[i]); continue; }
    let fin = i;
    while (fin + 1 < brutes.length && EST_LIGNE(brutes[fin + 1])) fin += 1;
    // Une ligne seule entre deux barres n'est pas un tableau, c'est une phrase.
    if (fin === i) { tampon.push(brutes[i]); continue; }

    viderLeTampon();
    morceauxDuTexte.push({
      rangs: brutes.slice(i, fin + 1).filter((l) => !EST_SEPARATEUR(l))
        .map((l) => cellules(l).map((c) => deHtml(c).split('\n')
          .map((x) => x.trim()).filter(Boolean)))
    });
    i = fin;
  }
  viderLeTampon();

  for (const bout of morceauxDuTexte) {
    /*
     * ── LES TABLEAUX ──────────────────────────────────────────────────────
     *
     * Un modèle à qui on demande « une entrée commune, deux tâches » répond par deux
     * colonnes : CE2 d'un côté, CM1 de l'autre. C'est la bonne forme — c'est même
     * comme ça qu'un enseignant écrit une fiche de double niveau.
     */
    if (bout.rangs) { blocs.push({ type: 'tableau', rangs: bout.rangs, morceaux: [] }); continue; }

    for (const brute of deHtml(bout.texte).split('\n')) {
      const l = brute.replace(/\s+$/, '');
      if (!l.trim()) { blocs.push({ type: 'blanc', morceaux: [] }); continue; }

      // « # », « ## », « ### » — et les titres que le modèle écrit EN CAPITALES, qui sont
      // la forme qu'il emploie le plus souvent quand la consigne en emploie elle-même.
      const diese = /^(#{1,4})\s+(.*)$/.exec(l.trim());
      if (diese) {
        blocs.push({ type: 'titre', niveau: diese[1].length, morceaux: enMorceaux(diese[2]) });
        continue;
      }
      const seul = l.trim();
      if (seul.length > 3 && seul.length < 90 && seul === seul.toUpperCase()
          && /[A-ZÀ-Ý]/.test(seul) && !/^[-·•*\d]/.test(seul)) {
        blocs.push({ type: 'titre', niveau: 2, morceaux: enMorceaux(seul) });
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
      blocs.push({ type: 'paragraphe', morceaux: enMorceaux(seul) });
    }
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
export const nu = (bloc) => (bloc.rangs
  ? bloc.rangs.map((r) => r.map((c) => c.join(' ')).join(' · ')).join('\n')
  : (bloc.morceaux || []).map((m) => m.texte).join(''));

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

export default { deHtml, enBlocs, enMorceaux, nu, pied, titre };
