/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  POSER LES CORRECTIONS SUR LA COPIE — EN ROUGE, COMME AU STYLO
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Une liste d'erreurs à côté d'une copie qu'on n'a pas sous les yeux ne sert à rien. Ce
 * qu'un enseignant rend, c'est la copie ELLE-MÊME : le mot fautif barré, le bon écrit à
 * côté. C'est ça qu'on refait.
 *
 *     Le chat ~~dor~~ dort sur le ~~tapi~~ tapis.
 *
 * ── UNE ERREUR QU'ON NE RETROUVE PAS EST DITE, PAS INVENTÉE ─────────────────
 *
 * Le modèle peut annoncer une erreur sur un mot qui n'est pas dans la copie — parce qu'il
 * l'a mal recopié, ou parce qu'il l'a imaginé. On ne va SURTOUT pas la poser au hasard :
 * elle est listée à part, en bas, marquée introuvable. C'est visible, vérifiable, et ça
 * dit à l'enseignant qu'il y a quelque chose à regarder.
 */
import { plier } from './eleves.js';

/** Échapper ce qui doit être cherché littéralement : un mot d'élève peut contenir un point. */
const echapper = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Marquer une copie.
 *
 * @param {string} texte     la copie, telle que l'élève l'a écrite
 * @param {Array}  erreurs   `[{ ecrit, attendu, nature }]`
 * @returns {{morceaux:Array, posees:number, introuvables:Array}}
 *   `morceaux` : `[{ texte, rouge?, barre?, gras? }]`, prêt pour Word comme pour l'image
 */
export function marquer(texte, erreurs = []) {
  const src = String(texte || '');
  const trouvees = [];
  const introuvables = [];

  /*
   * ── ON CHERCHE D'ABORD LES PLUS LONGS ──────────────────────────────────────
   *
   * Sinon « dor » se poserait à l'intérieur de « dormait » et laisserait la vraie faute
   * intacte, en en fabriquant une fausse au passage.
   */
  const parLongueur = [...erreurs].sort((a, b) => b.ecrit.length - a.ecrit.length);
  const pris = new Array(src.length).fill(false);
  const ambigues = [];

  for (const e of parLongueur) {
    const brut = String(e.ecrit || '').trim();
    if (!brut) { introuvables.push(e); continue; }

    /*
     * Frontières de mot, et insensible aux accents comme à la casse : le modèle recopie
     * « Dor » là où l'élève a écrit « dor », et une correction perdue pour une majuscule
     * serait incompréhensible.
     */
    /*
     * L'apostrophe EST une frontière de mot. Elle était exclue pour garder « aujourd'hui »
     * entier — et « l'éléve » ne trouvait donc jamais « éléve ». Une correction perdue
     * pour une élision, c'est incompréhensible pour qui la lit.
     */
    const motif = new RegExp(`(^|[^\\p{L}\\p{N}-])(${echapper(brut)})(?![\\p{L}\\p{N}])`,
                             'giu');
    const occurrences = [...src.matchAll(motif)];

    /*
     * ── LE MOT QUI REVIENT PLUSIEURS FOIS ─────────────────────────────────────
     *
     * Mesuré sur une vraie copie : « et -> est » a été posé sur le PREMIER « et » de
     * « des croquette et il et content » — celui qui était juste. Le document rendait
     * une faute là où il n'y en avait pas, et laissait la vraie intacte.
     *
     * Un mot seul, présent deux fois, ne désigne rien. On ne pose donc RIEN et on le dit :
     * c'est la même règle que pour l'auteur d'une copie — mieux vaut une ligne à traiter
     * à la main qu'une correction fausse posée avec aplomb.
     */
    if (occurrences.length > 1 && !/\s/.test(brut)) {
      ambigues.push({ ...e, combien: occurrences.length });
      continue;
    }

    let pose = false;
    for (const m of occurrences) {
      const debut = m.index + m[1].length;
      const fin = debut + m[2].length;
      // Un emplacement déjà corrigé ne l'est pas deux fois : deux erreurs sur le même mot
      // produiraient deux corrections superposées, illisibles.
      if (pris.slice(debut, fin).some(Boolean)) continue;
      for (let i = debut; i < fin; i++) pris[i] = true;
      trouvees.push({ debut, fin, ...e, tel: src.slice(debut, fin) });
      pose = true;
      break;
    }

    // Dernier recours : le mot est peut-être écrit autrement (accent, casse) que ce que le
    // modèle a recopié. On tente une comparaison pliée, mot à mot.
    if (!pose) {
      const cible = plier(brut);
      const mots = [...src.matchAll(/[\p{L}\p{N}-]+/gu)];
      const trouve = mots.find((m) => plier(m[0]) === cible
        && !pris.slice(m.index, m.index + m[0].length).some(Boolean));
      if (trouve) {
        for (let i = trouve.index; i < trouve.index + trouve[0].length; i++) pris[i] = true;
        trouvees.push({ debut: trouve.index, fin: trouve.index + trouve[0].length,
                        ...e, tel: trouve[0] });
        pose = true;
      }
    }

    if (!pose) introuvables.push(e);
  }

  trouvees.sort((a, b) => a.debut - b.debut);

  const morceaux = [];
  let curseur = 0;
  for (const t of trouvees) {
    if (t.debut > curseur) morceaux.push({ texte: src.slice(curseur, t.debut) });
    morceaux.push({ texte: t.tel, rouge: true, barre: true });
    /*
     * Un espace AVANT le mot correct, aucun après : le texte qui suit porte déjà sa
     * ponctuation ou son espace. La première version en ajoutait un des deux côtés et
     * mangeait le caractère suivant — « le tapi tapis ." » au lieu de « tapi tapis. ».
     */
    morceaux.push({ texte: ` ${t.attendu}`, rouge: true, gras: true });
    curseur = t.fin;
  }
  if (curseur < src.length) morceaux.push({ texte: src.slice(curseur) });

  return { morceaux: morceaux.length ? morceaux : [{ texte: src }],
           posees: trouvees.length, introuvables, ambigues, erreurs: trouvees };
}

/**
 * Ce que les erreurs posées disent, regroupé par nature.
 *
 * Un compte par NATURE, pas un total : « 7 erreurs » ne dit pas quoi retravailler, alors
 * que « 4 accords, 2 homophones » le dit. C'est la même règle que pour la dictée.
 */
export function parNature(erreurs = []) {
  const par = new Map();
  for (const e of erreurs) {
    const n = (e.nature || 'non classée').toLowerCase().trim();
    par.set(n, (par.get(n) || 0) + 1);
  }
  return [...par.entries()].map(([nature, combien]) => ({ nature, combien }))
    .sort((a, b) => b.combien - a.combien);
}

export default { marquer, parNature };
