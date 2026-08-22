/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  METTRE EN PAGE UNE FICHE — ET GARANTIR QU'ELLE EST VIDE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Deux fonctions, et elles ne se ressemblent pas exprès.
 *
 * `blocsDeFiche` ne reçoit QUE des énoncés : la structure qu'on lui passe ne contient
 * même pas les réponses. Ce n'est pas une précaution de plus, c'est la seule qui tienne —
 * on ne peut pas oublier d'enlever ce qu'on n'a jamais eu.
 *
 * `blocsDeCorrige` fait l'autre document. Il porte « CORRIGÉ » en grand, en première
 * ligne, parce qu'une pile de photocopies se distingue de loin ou pas du tout.
 *
 * ── LA PLACE POUR ÉCRIRE EST UNE DONNÉE, PAS UNE FINITION ───────────────────
 *
 * Une fiche d'opérations posées sans la hauteur nécessaire est une fiche que l'élève ne
 * peut pas remplir. Chaque exercice a dit de combien il avait besoin ; on l'applique.
 */

const T = (texte, extra = {}) => ({ type: 'paragraphe', morceaux: [{ texte }], ...extra });
const BLANC = { type: 'blanc', morceaux: [] };

/** L'en-tête d'une fiche d'élève : de la place pour son prénom et la date. */
const enTeteEleve = (titre, niveau) => [
  { type: 'titre', niveau: 1, morceaux: [{ texte: titre }] },
  { type: 'tableau', rangs: [[
    ['Prénom : ......................................'],
    [`Date : ......................${niveau ? `        ${niveau}` : ''}`]
  ]] }
];

/**
 * ── LA FICHE DONNÉE AUX ENFANTS ─────────────────────────────────────────────
 *
 * @param {object} fiche  ce que rend `exercices.ficheEleve` — sans aucune réponse
 */
export function blocsDeFiche(fiche) {
  if (!fiche?.sansReponses) {
    // Refuser plutôt que d'imprimer : une fiche dont on ne peut pas garantir qu'elle est
    // vide n'a rien à faire entre les mains d'un enfant.
    throw new Error('fiche non marquée « sans réponses » : refus d\'imprimer');
  }
  const blocs = [...enTeteEleve(fiche.titre, fiche.niveau)];
  if (fiche.consigne) {
    blocs.push(BLANC);
    blocs.push(T(fiche.consigne, { consigne: true }));
  }
  blocs.push(BLANC);

  const items = fiche.items || [];
  const place = items[0]?.place || 'case';

  if (place === 'pose') {
    /*
     * LES OPÉRATIONS POSÉES. Deux par ligne, dans de grandes cases vides — c'est là que
     * l'élève pose ses colonnes, et il lui faut plusieurs centimètres de haut.
     */
    const rangs = [];
    for (let i = 0; i < items.length; i += 2) {
      rangs.push([i, i + 1].map((k) => (items[k]
        ? [`${items[k].numero}.   ${items[k].enonce}`, '', '', '', '', '']
        : [''])));
    }
    blocs.push({ type: 'tableau', rangs, hautesCases: true });
    return blocs;
  }

  if (place === 'case') {
    // Trois colonnes de calculs courts : c'est la densité d'une fiche de calcul mental.
    const rangs = [];
    for (let i = 0; i < items.length; i += 3) {
      rangs.push([i, i + 1, i + 2].map((k) => (items[k]
        ? [`${items[k].numero}.  ${items[k].enonce} ${POINTILLES.court}`]
        : [''])));
    }
    blocs.push({ type: 'tableau', rangs, sansBordure: true });
    return blocs;
  }

  // Une ligne par exercice, avec la place pour écrire dessous.
  for (const it of items) {
    blocs.push(T(`${it.numero}.  ${it.enonce}`));
    const lignes = it.place === 'lignes3' ? 3 : 1;
    for (let i = 0; i < lignes; i++) blocs.push(T(POINTILLES.long, { discret: true }));
    blocs.push(BLANC);
  }
  return blocs;
}

/*
 * Les pointillés sont écrits en dur plutôt que calculés : leur longueur doit être stable
 * d'une fiche à l'autre, sinon les colonnes ne s'alignent pas d'un exercice au suivant.
 */
const POINTILLES = {
  court: '.'.repeat(12),
  long: '.'.repeat(78)
};

/**
 * ── LE CORRIGÉ ──────────────────────────────────────────────────────────────
 *
 * Un document à part, qui dit ce qu'il est dès la première ligne. On ne le distribue
 * pas ; on le garde à côté de soi en corrigeant.
 */
export function blocsDeCorrige(corrige) {
  if (!corrige?.estUnCorrige) throw new Error('ce n\'est pas un corrigé');
  const blocs = [
    { type: 'titre', niveau: 1, morceaux: [{ texte: corrige.titre }] },
    T('Document pour l\'enseignant — à ne pas distribuer.', { alerte: true }),
    BLANC
  ];
  const items = corrige.items || [];
  const rangs = [];
  for (let i = 0; i < items.length; i += 2) {
    rangs.push([i, i + 1].map((k) => (items[k]
      ? [`${items[k].numero}.  ${items[k].enonce}`, `→ ${items[k].reponse}`]
      : [''])));
  }
  blocs.push({ type: 'tableau', rangs, sansBordure: true, corrige: true });
  return blocs;
}

/**
 * ── LE CONTRÔLE EST STRUCTUREL, ET C'EST EXPRÈS ─────────────────────────────
 *
 * J'ai essayé deux fois de le faire sur le TEXTE de la fiche — chercher chaque réponse
 * dans le document imprimé. Les deux fois, c'était inutilisable :
 *
 *   · « 5 × 2 » a pour réponse 10, qui est l'opérande de « 5 × 10 » ;
 *   · « 7000 mL = ..... L » a pour réponse 7, qu'on retrouve dans l'énoncé suivant.
 *
 * Sur une fiche de calcul, tous les nombres sont des réponses de quelqu'un. Le contrôle
 * criait sur chaque fiche, et un contrôle qui crie toujours est un contrôle qu'on
 * désactive — c'est la règle que le reste de cet outil applique partout, il fallait bien
 * que je me l'applique aussi.
 *
 * Alors on contrôle CE QUI EST VÉRIFIABLE, et qui se trouve être ce qui protège vraiment :
 * la fiche de l'élève est construite à partir d'une structure QUI NE CONTIENT PAS LES
 * RÉPONSES. On ne peut pas oublier d'enlever ce qu'on n'a jamais eu. Reste à vérifier
 * qu'aucune ne s'y est glissée, et ça, c'est exact et sans bruit.
 */
export function aucuneReponse(fiche) {
  if (!fiche?.sansReponses) {
    return { propre: false, pourquoi: 'la fiche n\'est pas marquée « sans réponses »' };
  }
  const fautives = (fiche.items || []).filter((it) =>
    Object.keys(it).some((c) => /^(reponse|corrige|solution|resultat)$/i.test(c)));

  return fautives.length
    ? { propre: false, fautives,
        pourquoi: `${fautives.length} exercice(s) portent encore une réponse` }
    : { propre: true };
}

export default { blocsDeFiche, blocsDeCorrige, aucuneReponse };
