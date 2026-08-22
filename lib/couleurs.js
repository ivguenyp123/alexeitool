/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LES COULEURS — PARCE QUE CE SONT DES ENFANTS DE HUIT ANS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Le reste de l'outil se méfie de la couleur, et il a raison : dans un emploi du temps,
 * une information qui ne tient QU'À LA TEINTE est une information perdue pour l'enseignant
 * qui voit mal le rouge et le vert.
 *
 * Le matériel de classe, c'est l'inverse. Une planche de cartes en gris se trie mal, une
 * table de Pythagore sans diagonale ne montre rien, et un CE2 range mieux un jeu dont les
 * familles ont une couleur. Ici la couleur AIDE — mais elle ne porte jamais seule : les
 * cartes de numération sont vertes ET portent « unités », les symboles Montessori sont
 * rouges ET s'appellent « rouge » sur la planche. Imprimée en noir et blanc, chaque fiche
 * reste utilisable.
 *
 * ── CE QUI SE VÉRIFIE ICI ───────────────────────────────────────────────────
 *
 * Un fond trop sombre sous du texte noir donne une page qu'on ne lit pas — et on ne s'en
 * aperçoit qu'après l'impression, cartouche vidée. Chaque couple fond/encre déclaré ici
 * passe donc le contrôle de contraste, et un test le rejoue.
 */

/* ── Le contraste, calculé, pas estimé ────────────────────────────────────── */

const canal = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** La luminance relative d'un « RRGGBB ». C'est la formule de la WCAG, telle quelle. */
export function luminance(hex) {
  const h = String(hex || '').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  if (!Number.isFinite(n)) return 0;
  return 0.2126 * canal((n >> 16) & 255)
       + 0.7152 * canal((n >> 8) & 255)
       + 0.0722 * (canal(n & 255));
}

/** Le rapport de contraste entre deux couleurs. 1 = identiques, 21 = noir sur blanc. */
export function contraste(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** L'encre du document, et le papier. Tout se mesure par rapport à ces deux-là. */
export const ENCRE = '22201C';
export const PAPIER = 'FFFFFF';

/** Lisible = le seuil AA de la WCAG. En dessous, la fiche sort et ne se lit pas. */
export const lisible = (fond, encre = ENCRE) => contraste(fond, encre) >= 4.5;

/* ── Les six familles du catalogue ────────────────────────────────────────── */

/**
 * Une famille, une couleur, une icône. C'est ce qui permet de retrouver une fiche dans
 * une pile de trente : on cherche « la bleue », pas « la troisième en partant du haut ».
 *
 * `trait` s'écrit sur du blanc — c'est le titre. `fond` se remplit sous du noir — c'est
 * le bandeau. Les deux sont contrôlés.
 */
export const FAMILLES = {
  Calcul:       { emoji: '➗', trait: '9A5B06', fond: 'FFF1D6', teinte: 'ambre' },
  'Numération': { emoji: '🔢', trait: '1B4F8C', fond: 'E1EDFA', teinte: 'bleu' },
  Mesures:      { emoji: '📏', trait: '1F6B4F', fond: 'DFF2E8', teinte: 'vert' },
  'Géométrie':  { emoji: '📐', trait: '5B21B6', fond: 'EBE3FC', teinte: 'violet' },
  'Français':   { emoji: '📚', trait: 'A3155A', fond: 'FCE1EC', teinte: 'framboise' },
  'La classe':  { emoji: '🎒', trait: '0D6E80', fond: 'DBF0F4', teinte: 'turquoise' }
};

export const laFamille = (nom) => FAMILLES[nom]
  || { emoji: '📄', trait: ENCRE, fond: 'F2F0EA', teinte: 'gris' };

/* ── Montessori ───────────────────────────────────────────────────────────── */

/**
 * Ces couleurs-là ne se choisissent pas. Un enfant qui a manipulé le matériel reconnaît
 * la centaine à son rouge avant de lire le mot ; en changer casse le repère et le
 * matériel de l'école ne s'accorde plus avec celui qu'on imprime.
 */
export const MONTESSORI = {
  unites:    { trait: '1F6B4F', fond: 'DDF1E5', teinte: 'vert' },
  dizaines:  { trait: '1B4F8C', fond: 'DEEAF8', teinte: 'bleu' },
  centaines: { trait: 'B00000', fond: 'FBDEDE', teinte: 'rouge' },
  milliers:  { trait: '1F6B4F', fond: 'DDF1E5', teinte: 'vert' },
  voyelle:   { trait: 'B00000', fond: 'FBDEDE', teinte: 'rouge' },
  consonne:  { trait: '1B4F8C', fond: 'DEEAF8', teinte: 'bleu' }
};

/**
 * Les symboles grammaticaux. La forme dit la famille — triangle pour le groupe du nom,
 * rond pour le verbe et ce qui l'entoure, barre pour les mots de liaison — et la couleur
 * distingue à l'intérieur. Forme ET couleur ET nom : trois entrées pour la même idée,
 * c'est ce qui la rend robuste à une photocopie grise.
 */
export const GRAMMAIRE = [
  { forme: '▲', nature: 'nom',         quoi: 'la personne, l\'animal, la chose',
    trait: '1A1A1A', fond: 'E4E4E4', teinte: 'noir' },
  { forme: '▲', nature: 'article',     quoi: 'le, la, les, un, une, des',
    trait: '123C6B', fond: 'DEE9F6', teinte: 'bleu foncé' },
  { forme: '▲', nature: 'adjectif',    quoi: 'il dit comment est le nom',
    trait: '2A6DA8', fond: 'E3EFFA', teinte: 'bleu clair' },
  { forme: '●', nature: 'verbe',       quoi: 'l\'action, ce qui se passe',
    trait: 'B00000', fond: 'FBDEDE', teinte: 'rouge' },
  { forme: '●', nature: 'adverbe',     quoi: 'il dit comment se fait l\'action',
    trait: '9A5B06', fond: 'FDEBD2', teinte: 'orange' },
  { forme: '▬', nature: 'pronom',      quoi: 'il remplace le nom',
    trait: '5B21B6', fond: 'EBE3FC', teinte: 'violet' },
  { forme: '▬', nature: 'préposition', quoi: 'à, de, dans, sur, pour, avec',
    trait: '1F6B4F', fond: 'DDF1E5', teinte: 'vert' },
  { forme: '▬', nature: 'conjonction', quoi: 'mais, ou, et, donc, or, ni, car',
    trait: 'A3155A', fond: 'FCE1EC', teinte: 'rose' }
];

/* ── Les crayons de la trousse ────────────────────────────────────────────── */

/**
 * ── SIX COULEURS, PAS TRENTE ────────────────────────────────────────────────
 *
 * Un coloriage magique se colorie avec ce qu'on a. « Turquoise » et « lilas » n'existent
 * pas dans une trousse de CE2 : la légende ne nomme que des couleurs que tout le monde
 * possède, et qu'un enfant sait distinguer sans hésiter.
 */
export const CRAYONS = [
  { nom: 'rouge',  trait: 'B00000', fond: 'F8C9C9' },
  { nom: 'bleu',   trait: '1B4F8C', fond: 'C6DBF2' },
  { nom: 'jaune',  trait: '8A6D00', fond: 'FAEBA8' },
  { nom: 'vert',   trait: '1F6B4F', fond: 'C2E8D3' },
  { nom: 'orange', trait: '9A5B06', fond: 'FBDCB4' },
  { nom: 'marron', trait: '6B4423', fond: 'E0CDBB' }
];

/**
 * Une rotation de teintes très claires, pour distinguer des lignes ou des paquets de
 * cartes sans rien signifier de plus. Toutes passent le contrôle de contraste.
 */
export const PASTELS = ['FFF1D6', 'E1EDFA', 'DFF2E8', 'EBE3FC', 'FCE1EC', 'DBF0F4'];
export const pastel = (i) => PASTELS[((i % PASTELS.length) + PASTELS.length) % PASTELS.length];

export default { luminance, contraste, lisible, ENCRE, PAPIER,
                 FAMILLES, laFamille, MONTESSORI, GRAMMAIRE, CRAYONS, PASTELS, pastel };
