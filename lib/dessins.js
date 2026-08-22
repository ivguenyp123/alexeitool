/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  DES DESSINS QUI SE CALCULENT
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Un coloriage magique et un point-à-relier sont, pour un enfant de huit ans, la seule
 * fiche d'entraînement qu'il réclame. Ce sont pourtant les plus pénibles à fabriquer : il
 * faut un dessin, le découper en cases, et faire tomber juste chaque calcul sur la bonne
 * couleur. Une case fausse et le dessin ne sort pas.
 *
 * ── D'OÙ VIENNENT LES DESSINS ───────────────────────────────────────────────
 *
 * Pas d'images : des FORMES, décrites par leurs sommets dans un carré de −1 à 1. Une
 * étoile est un polygone à dix sommets, un cœur une courbe échantillonnée, une maison
 * quatre polygones empilés. On sait donc, pour n'importe quelle case, de quelle couleur
 * elle est — et c'est ce qui permet de le VÉRIFIER après coup, case par case.
 *
 * Le même dessin sert deux fois : rempli, c'est un coloriage ; suivi par son contour,
 * c'est un point-à-relier. Un dessin ajouté ici donne deux fiches.
 */

/** Le test du rayon : on compte les traversées du contour. C'est tout ce qu'il faut. */
export function dansLePolygone([x, y], points) {
  let dedans = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
}

/** Une étoile à cinq branches : rayon long, rayon court, alternés. */
export function etoile(branches = 5, grand = 0.98, petit = 0.46) {
  return Array.from({ length: branches * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / branches;
    const r = i % 2 ? petit : grand;
    return [r * Math.cos(a), -r * Math.sin(a)];
  });
}

/**
 * Le cœur, par sa courbe paramétrique classique. Écrit une fois, il tombe juste à toutes
 * les tailles — là où un cœur dessiné case par case est faux dès qu'on change la grille.
 */
export function coeur(n = 28) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 2 * Math.PI;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    // La courbe va de −17 à 12 en hauteur : on la recentre pour qu'elle remplisse le carré.
    return [(x / 16) * 0.95, (y + 2.5) / 14.5];
  });
}

/*
 * Les couleurs sont des INDICES dans la trousse (`CRAYONS` de couleurs.js) :
 *   0 rouge · 1 bleu · 2 jaune · 3 vert · 4 orange · 5 marron
 */
const MAISON = {
  murs: [[-0.72, -0.9], [-0.72, 0.12], [0.72, 0.12], [0.72, -0.9]],
  toit: [[-0.92, 0.1], [0, 0.92], [0.92, 0.1]],
  porte: [[-0.17, -0.9], [-0.17, -0.26], [0.17, -0.26], [0.17, -0.9]],
  contour: [[-0.72, -0.9], [-0.72, 0.12], [-0.92, 0.1], [0, 0.92], [0.92, 0.1],
            [0.72, 0.12], [0.72, -0.9]]
};

const SAPIN = {
  tronc: [[-0.13, -0.95], [-0.13, -0.58], [0.13, -0.58], [0.13, -0.95]],
  bas: [[-0.8, -0.58], [0, -0.04], [0.8, -0.58]],
  milieu: [[-0.62, -0.14], [0, 0.42], [0.62, -0.14]],
  haut: [[-0.42, 0.3], [0, 0.93], [0.42, 0.3]],
  contour: [[0.13, -0.95], [0.13, -0.58], [0.8, -0.58], [0.42, -0.14], [0.62, -0.14],
            [0.28, 0.3], [0.42, 0.3], [0, 0.93], [-0.42, 0.3], [-0.28, 0.3],
            [-0.62, -0.14], [-0.42, -0.14], [-0.8, -0.58], [-0.13, -0.58], [-0.13, -0.95]]
};

const POISSON = {
  corps: [[0.55, 0.28], [0.3, 0.5], [-0.2, 0.56], [-0.62, 0.36], [-0.85, 0],
          [-0.62, -0.36], [-0.2, -0.56], [0.3, -0.5], [0.55, -0.28]],
  queue: [[0.33, 0], [0.98, 0.55], [0.98, -0.55]],
  contour: [[0.55, 0.28], [0.98, 0.52], [0.98, -0.52], [0.55, -0.28], [0.3, -0.5],
            [-0.2, -0.56], [-0.62, -0.36], [-0.85, 0], [-0.62, 0.36], [-0.2, 0.56],
            [0.3, 0.5]]
};

/**
 * Les dessins disponibles. `fond` est la couleur des cases qui ne sont dans aucune forme ;
 * les formes se peignent dans l'ordre, la dernière l'emporte.
 */
export const MOTIFS = [
  {
    id: 'etoile', nom: 'une étoile', emoji: '⭐', fond: 1,
    formes: [{ crayon: 2, points: etoile() }],
    contour: etoile()
  },
  {
    id: 'coeur', nom: 'un cœur', emoji: '❤️', fond: 2,
    formes: [{ crayon: 0, points: coeur() }],
    contour: coeur(24)
  },
  {
    id: 'maison', nom: 'une maison', emoji: '🏠', fond: 1,
    formes: [{ crayon: 4, points: MAISON.murs }, { crayon: 0, points: MAISON.toit },
             { crayon: 5, points: MAISON.porte }],
    contour: MAISON.contour
  },
  {
    id: 'sapin', nom: 'un sapin', emoji: '🌲', fond: 1,
    formes: [{ crayon: 5, points: SAPIN.tronc }, { crayon: 3, points: SAPIN.bas },
             { crayon: 3, points: SAPIN.milieu }, { crayon: 3, points: SAPIN.haut }],
    contour: SAPIN.contour
  },
  {
    id: 'poisson', nom: 'un poisson', emoji: '🐟', fond: 1,
    formes: [{ crayon: 4, points: POISSON.corps }, { crayon: 0, points: POISSON.queue }],
    contour: POISSON.contour
  }
];

export const motif = (id) => MOTIFS.find((m) => m.id === id) || MOTIFS[0];

/** Le centre de la case (colonne, ligne), dans le carré de −1 à 1, y vers le haut. */
const centre = (c, l, colonnes, lignes) => [
  ((c + 0.5) / colonnes) * 2 - 1,
  1 - ((l + 0.5) / lignes) * 2
];

/**
 * La grille des couleurs d'un dessin : `grille[ligne][colonne]` est un indice de crayon.
 * C'est la SOURCE, et le coloriage magique en découle — jamais l'inverse. Le test peut
 * donc recalculer chaque case du coloriage et la comparer à celle-ci.
 */
export function grille(m, { colonnes = 12, lignes = 12 } = {}) {
  return Array.from({ length: lignes }, (_, l) =>
    Array.from({ length: colonnes }, (_, c) => {
      const p = centre(c, l, colonnes, lignes);
      let couleur = m.fond;
      for (const f of m.formes) if (dansLePolygone(p, f.points)) couleur = f.crayon;
      return couleur;
    }));
}

/** Échantillonner un contour fermé en `combien` points régulièrement espacés. */
function surLeContour(points, combien) {
  const segments = points.map((a, i) => {
    const b = points[(i + 1) % points.length];
    return { a, b, l: Math.hypot(b[0] - a[0], b[1] - a[1]) };
  });
  const total = segments.reduce((t, s) => t + s.l, 0);
  return Array.from({ length: combien }, (_, k) => {
    let d = (k / combien) * total;
    for (const s of segments) {
      if (d <= s.l) {
        const t = s.l ? d / s.l : 0;
        return [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t];
      }
      d -= s.l;
    }
    return points[0];
  });
}

/**
 * Les points à relier : le contour, posé sur une grille, numéroté dans l'ordre.
 *
 * ── DEUX POINTS DANS LA MÊME CASE, C'EST UN DESSIN FAUX ─────────────────────
 *
 * Arrondis à la case, deux points voisins tombent parfois au même endroit : l'enfant voit
 * « 7 » et « 8 » superposés et ne sait plus où aller. On les fusionne, puis on RENUMÉROTE
 * — la suite reste 1, 2, 3… sans trou, ce qui est la seule chose qu'un point-à-relier doit
 * garantir.
 */
export function pointsARelier(m, { colonnes = 18, lignes = 20, combien = 30 } = {}) {
  /*
   * On échantillonne EXACTEMENT `combien` points sur tout le tour, puis on retire les
   * doublons. La première version en prenait deux fois plus et s'arrêtait dès qu'elle
   * en avait assez : elle faisait le tour à moitié, et le sapin sortait sans son côté
   * gauche. Un contour parcouru en partie n'est pas un dessin, c'est un trait.
   */
  const vus = new Set();
  const points = [];
  for (const [x, y] of surLeContour(m.contour, combien)) {
    const c = Math.round(((x + 1) / 2) * (colonnes - 1));
    const l = Math.round(((1 - y) / 2) * (lignes - 1));
    const cle = `${c}:${l}`;
    if (vus.has(cle)) continue;
    vus.add(cle);
    points.push({ colonne: c, ligne: l });
  }
  return points.map((p, i) => ({ ...p, numero: i + 1 }));
}

export default { MOTIFS, motif, grille, pointsARelier, dansLePolygone, etoile, coeur };
