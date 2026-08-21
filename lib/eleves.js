/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LES PRÉNOMS NE SORTENT PAS D'ICI
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── CE QUE CE MODULE EXISTE POUR EMPÊCHER ────────────────────────────────────
 *
 * Un enseignant photographie une pile de copies. Sur chaque copie il y a un prénom, en
 * haut à droite, écrit par un enfant de huit ans. Si ce texte part tel quel vers un
 * fournisseur de modèle, on vient d'envoyer la liste nominative d'une classe de CE2 à un
 * tiers, avec ce que chacun réussit et rate.
 *
 * Ce module est donc écrit AVANT le premier agent, et pas après. Sur la plateforme
 * technique, le caviardage des chaînes est arrivé en rattrapage ; ici, rien ne part avant
 * qu'il existe.
 *
 * ── LA TABLE RESTE, LE TEXTE PART ────────────────────────────────────────────
 *
 * Chaque élève reçoit un pseudonyme STABLE — « Élève 07 ». La correspondance vit sur la
 * machine de la classe et ne traverse jamais rien. Ce qui sort porte les pseudonymes ;
 * ce qui revient est retraduit avant affichage, de sorte que l'enseignant lise toujours
 * des prénoms et le modèle jamais.
 *
 * Stable, parce qu'un pseudonyme qui changerait à chaque envoi interdirait la seule chose
 * qui compte vraiment : suivre un enfant dans le temps.
 *
 * ── ET CE QU'IL NE GARANTIT PAS ──────────────────────────────────────────────
 *
 * Il ne connaît que les prénoms de la classe. Un enfant qui écrit le prénom de son frère
 * dans une rédaction ne sera pas couvert, et aucune liste ne pourrait l'être. Le module
 * DIT ce qu'il a remplacé, pour que la vérification reste possible — il ne se déclare
 * jamais complet.
 */

/** Le préfixe des pseudonymes. Lisible, sans être un matricule. */
const PSEUDO = (n) => `Élève ${String(n).padStart(2, '0')}`;

/**
 * Plier un mot : sans accent, sans casse.
 *
 * Exporté parce que la pile de copies en a besoin pour reconnaître un prénom dans un nom
 * de fichier. Deux façons de plier dans le même projet finiraient par diverger — et ça se
 * verrait le jour où un prénom accentué cesserait d'être caviardé.
 */
export const plier = (s) => String(s || '').normalize('NFD')
  .replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * La table de correspondance d'une classe.
 *
 * Les élèves sont rangés par prénom plié, pas par ordre de saisie : ajouter quelqu'un en
 * cours d'année ne doit pas renuméroter toute la classe, sinon un bilan écrit en novembre
 * ne désigne plus les mêmes enfants en mars.
 *
 * @param {Array} eleves  `[{ prenom, nom }]` — le nom est facultatif et ne sort jamais
 */
export function table(eleves = []) {
  const propres = eleves
    .map((e) => (typeof e === 'string' ? { prenom: e } : e))
    .filter((e) => e && String(e.prenom || '').trim())
    .map((e) => ({ prenom: String(e.prenom).trim(), nom: String(e.nom || '').trim(),
                   niveau: e.niveau || '' }));

  const tries = [...propres].sort((a, b) => plier(a.prenom).localeCompare(plier(b.prenom))
    || plier(a.nom).localeCompare(plier(b.nom)));

  const parPseudo = new Map();
  const parPrenom = new Map();
  tries.forEach((e, i) => {
    const pseudo = PSEUDO(i + 1);
    const fiche = { ...e, pseudo };
    parPseudo.set(pseudo, fiche);
    // Deux enfants peuvent porter le même prénom. On garde les DEUX : un prénom ambigu
    // ne doit pas silencieusement désigner le premier arrivé.
    const cle = plier(e.prenom);
    parPrenom.set(cle, [...(parPrenom.get(cle) || []), fiche]);
  });

  return { eleves: tries.map((e, i) => ({ ...e, pseudo: PSEUDO(i + 1) })), parPseudo, parPrenom };
}

/**
 * Remplace les prénoms de la classe par leur pseudonyme.
 *
 * Insensible à la casse et aux accents — « CAMILLE », « Camille » et « camille » sont le
 * même enfant, et une copie manuscrite retranscrite arrive dans n'importe quelle forme.
 *
 * Les frontières de mot sont respectées : « Léa » ne doit pas transformer « Léandre ».
 *
 * ── LE PRÉNOM QUI EST AUSSI UN MOT ORDINAIRE ────────────────────────────────
 *
 * « Rose », « Camille », « Manon » existent aussi comme noms communs ou lieux. On remplace
 * quand même, et c'est un choix assumé : sur-remplacer abîme un peu le texte envoyé au
 * modèle ; sous-remplacer laisse fuir le prénom d'un enfant. Les deux sont des erreurs,
 * une seule est grave.
 *
 * @returns {{texte:string, remplaces:Array, combien:number}}
 */
export function caviarder(texte, t) {
  const src = String(texte || '');
  if (!src || !t?.parPrenom?.size) return { texte: src, remplaces: [], combien: 0 };

  // Les plus longs d'abord : sans ça, « Marie » consommerait le début de « Marie-Lou »
  // et laisserait « -Lou » en clair.
  const prenoms = [...t.parPrenom.entries()]
    .flatMap(([, fiches]) => fiches.map((f) => f.prenom))
    .sort((a, b) => b.length - a.length);

  const remplaces = new Map();
  let out = src;

  for (const prenom of prenoms) {
    const fiches = t.parPrenom.get(plier(prenom)) || [];
    /*
     * DEUX ENFANTS, LE MÊME PRÉNOM : on ne devine pas lequel.
     *
     * Remplacer par l'un des deux inventerait une information. On remplace par une marque
     * qui dit l'ambiguïté, et l'enseignant tranche s'il en a besoin.
     */
    const cible = fiches.length === 1 ? fiches[0].pseudo
      : `Élève ${fiches.map((f) => f.pseudo.replace('Élève ', '')).join(' ou ')}`;

    const motif = new RegExp(`(^|[^\\p{L}\\p{N}])(${echapper(prenom)})(?![\\p{L}\\p{N}])`,
                             'giu');
    out = out.replace(motif, (m, avant, trouve) => {
      remplaces.set(prenom, (remplaces.get(prenom) || 0) + 1);
      return avant + cible;
    });

    // La forme sans accent, si elle diffère : les copies scannées perdent les accents.
    const nu = plier(prenom);
    if (nu !== plier(cible) && nu !== prenom.toLowerCase()) {
      const motifNu = new RegExp(`(^|[^\\p{L}\\p{N}])(${echapper(nu)})(?![\\p{L}\\p{N}])`,
                                 'giu');
      out = out.replace(motifNu, (m, avant) => {
        remplaces.set(prenom, (remplaces.get(prenom) || 0) + 1);
        return avant + cible;
      });
    }
  }

  return {
    texte: out,
    remplaces: [...remplaces.entries()].map(([prenom, n]) => ({ prenom, n }))
      .sort((a, b) => b.n - a.n),
    combien: [...remplaces.values()].reduce((s, n) => s + n, 0)
  };
}

/**
 * Remet les prénoms, pour l'affichage à l'enseignant.
 *
 * Le trajet complet est : prénom → pseudonyme → le modèle → pseudonyme → prénom. Le
 * modèle n'a jamais vu autre chose qu'un numéro, et l'enseignant n'a jamais lu autre
 * chose qu'un prénom. C'est la seule façon que les deux exigences tiennent ensemble.
 */
export function restituer(texte, t) {
  const out = String(texte || '');
  if (!t?.parPseudo?.size) return out;

  /*
   * ── LE MODÈLE N'ÉCRIT PAS « Élève 07 » ─────────────────────────────────────
   *
   * La première version remplaçait la chaîne exacte. Mesuré sur une vraie dictée :
   * la réponse disait « Élèves 10 et 07 (copies identiques) » — et rien n'était remis,
   * parce que « Élèves » porte un s et que « 07 » suit un « et ». L'enseignant lisait
   * des numéros, ce qui est précisément ce que le pseudonymat devait lui épargner.
   *
   * On reconnaît donc le MOT, sous ses formes (« Élève », « élèves », « Eleve n° »),
   * puis la SUITE de numéros qui le suit — « 10 et 07 », « 3, 5 et 9 ».
   *
   * Un numéro NU n'est jamais remplacé. « 12 erreurs » ne doit pas devenir « Jade
   * erreurs », et le prix d'un faux positif ici serait de rendre la réponse illisible.
   */
  const prenomDe = (n) => t.parPseudo.get(PSEUDO(Number(n)))?.prenom || null;

  const NUM = '\\d{1,3}';
  const SEP = '(?:\\s*(?:,|;|&|et|ou|\\/|-)\\s*)';
  const SUITE = `${NUM}(?:${SEP}(?:n[°o]\\s*)?${NUM})*`;
  /*
   * Le déterminant qui précède, quand il y en a un.
   *
   * Sans lui, « les élèves 3, 5 et 9 » devenait « les Ambre, Basile et Éva » — le mot
   * « élèves » disparaissait et laissait un article orphelin. Quand un déterminant est
   * là, on garde la tournure et on ne remplace que les numéros ; sinon on efface le mot,
   * parce que « Élève Chloé a réussi » se lit moins bien que « Chloé a réussi ».
   */
  const AVANT = '(?:\\b(?:les|des|ces|aux|au|du|de|d\'|à|pour|par|chez|avec|entre)\\s+)?';
  const motif = new RegExp(`(${AVANT})(élèves?)(\\s*(?:n[°o]\\s*)?)(${SUITE})`, 'gi');

  return out.replace(motif, (tout, avant, mot, entre, suite) => {
    const prenoms = [];
    // On ne remplace la suite QUE si tous ses numéros sont connus. « Élèves 3 et 40 »
    // dans une classe de 26 est probablement autre chose qu'une liste d'élèves.
    const remplacee = suite.replace(new RegExp(`(n[°o]\\s*)?(${NUM})`, 'g'), (m, no, n) => {
      const p = prenomDe(n);
      if (p) prenoms.push(p);
      return p || m;
    });
    if (prenoms.length !== (suite.match(new RegExp(NUM, 'g')) || []).length) return tout;
    return avant ? `${avant}${mot} ${remplacee}` : remplacee;
  });
}

/**
 * Ce que le caviardage n'a PAS pu couvrir, dit à voix haute.
 *
 * Un texte où l'on trouve des majuscules isolées que la table ne connaît pas contient
 * peut-être un prénom hors classe. On ne bloque pas — ce serait ingérable — mais on
 * refuse de laisser croire que le nettoyage est total.
 */
export function restes(texte, t) {
  const connus = new Set([...(t?.parPrenom?.keys() || [])]);
  const candidats = new Map();
  const motif = /(^|[^\p{L}])(\p{Lu}\p{Ll}{2,})(?![\p{L}\p{N}])/gu;
  for (const m of String(texte || '').matchAll(motif)) {
    const mot = m[2];
    if (connus.has(plier(mot)) || MOTS_COURANTS.has(plier(mot))) continue;
    candidats.set(mot, (candidats.get(mot) || 0) + 1);
  }
  return [...candidats.entries()].map(([mot, n]) => ({ mot, n }))
    .sort((a, b) => b.n - a.n);
}

/*
 * Les mots capitalisés qui ne sont pas des prénoms. Liste courte et volontairement
 * incomplète : ce qui reste dedans ressort comme « à vérifier », ce qui est visible et
 * sans dégât. Un vrai prénom qu'on y mettrait par erreur disparaîtrait en silence.
 */
const MOTS_COURANTS = new Set([
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout',
  'septembre', 'octobre', 'novembre', 'decembre',
  'eleve', 'eleves', 'maitre', 'maitresse', 'ecole', 'classe', 'cahier',
  'exercice', 'dictee', 'lecture', 'calcul', 'france', 'paris', 'les', 'des',
  'une', 'mon', 'ton', 'son', 'cette', 'nous', 'vous', 'ils', 'elle', 'elles',
  'aujourd', 'hier', 'demain', 'oui', 'non', 'bravo', 'merci'
]);

const echapper = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default { plier, table, caviarder, restituer, restes };
