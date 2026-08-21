/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LA LISTE DE CLASSE — COLLÉE, PAS SAISIE VINGT-SIX FOIS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * La liste existe déjà quelque part : dans ONDE, dans un tableur, sur une feuille tapée
 * en juillet. Demander de retaper vingt-six prénoms dans vingt-six champs, c'est
 * garantir que personne ne le fera — et sans liste de classe, RIEN ne peut être caviardé.
 *
 * Alors on colle. Une ligne par élève, dans à peu près n'importe quel format :
 *
 *     Camille        Léa Bernard          Tom;CM1        Inès, CE2
 *     Marie-Lou      DUPONT Arthur        Basile  CE2
 *
 * ── LE NIVEAU EST DEVINÉ QUAND IL EST ÉCRIT, ET JAMAIS AUTREMENT ────────────
 *
 * CE2 ou CM1 est reconnu s'il figure sur la ligne. Absent, il reste vide — et l'écran le
 * dit. Répartir les enfants au hasard entre les deux niveaux pour que ça fasse joli
 * produirait des bilans adressés au mauvais cycle, ce qui ne se voit pas.
 */

const NIVEAU = /\b(CE2|CM1)\b/i;

/*
 * Ce qui sépare le prénom du reste : virgule, point-virgule, tabulation, deux-points.
 * L'espace n'en fait PAS partie — « Marie Lou » doit rester lisible comme un prénom
 * composé possible, et c'est à l'humain de trancher, pas à un séparateur.
 */
const COUPE = /[;,:\t|]+/;

/**
 * Lire une liste collée.
 *
 * Rend aussi ce qui a été ÉCARTÉ et pourquoi. Quelqu'un qui colle trente lignes et obtient
 * vingt-six élèves doit pouvoir voir les quatre autres, plutôt que de croire que sa classe
 * en compte vingt-six.
 *
 * @returns {{eleves:Array, ecartees:Array, doublons:Array}}
 */
export function lireLaListe(texte) {
  const eleves = [];
  const ecartees = [];
  const vus = new Map();

  for (const brute of String(texte || '').split('\n')) {
    // Les numérotations d'un export : « 1. Camille », « 03 - Léa ».
    const l = brute.replace(/^\s*\d+\s*[.)\-–]?\s*/, '').trim();
    if (!l) continue;

    const m = NIVEAU.exec(l);
    const niveau = m ? m[1].toUpperCase() : '';
    const sansNiveau = (m ? l.replace(NIVEAU, ' ') : l).trim();

    const [premier = ''] = sansNiveau.split(COUPE);
    const mots = premier.split(/\s+/).filter(Boolean);
    if (!mots.length) { ecartees.push({ ligne: brute.trim(), pourquoi: 'aucun nom' }); continue; }

    /*
     * ── « DUPONT Arthur » ET « Arthur Dupont » ─────────────────────────────
     *
     * Les exports d'établissement écrivent le NOM en capitales devant. Un mot tout en
     * majuscules est donc pris pour le nom de famille, et le prénom est cherché ailleurs.
     * Se tromper ici mettrait « DUPONT » comme prénom sur toutes les copies, et le
     * caviardage chercherait un prénom qui n'existe pas.
     */
    const capitales = mots.filter((x) => x.length > 1 && x === x.toUpperCase());
    const autres = mots.filter((x) => !capitales.includes(x));
    const prenom = (autres[0] || mots[0]).replace(/[.]$/, '');
    const nom = [...capitales, ...autres.slice(1)].join(' ');

    if (prenom.length < 2) {
      ecartees.push({ ligne: brute.trim(), pourquoi: 'trop court pour être un prénom' });
      continue;
    }

    const cle = `${prenom.toLowerCase()}|${nom.toLowerCase()}`;
    if (vus.has(cle)) {
      // Deux fois la même ligne, c'est un copier-coller en double — pas des jumeaux.
      ecartees.push({ ligne: brute.trim(), pourquoi: 'déjà dans la liste' });
      continue;
    }
    vus.set(cle, true);
    eleves.push({ prenom, nom, niveau });
  }

  /*
   * LES HOMONYMES DE PRÉNOM. On les garde tous les deux — c'est la réalité d'une classe —
   * mais on les signale : leurs copies ne pourront pas être rattachées automatiquement,
   * et il vaut mieux le savoir maintenant qu'au vingt-troisième dépôt.
   */
  const parPrenom = new Map();
  for (const e of eleves) {
    const k = e.prenom.toLowerCase();
    parPrenom.set(k, [...(parPrenom.get(k) || []), e]);
  }
  const doublons = [...parPrenom.values()].filter((v) => v.length > 1)
    .map((v) => ({ prenom: v[0].prenom, combien: v.length }));

  return { eleves, ecartees, doublons };
}

/** Ce qu'il manque pour que la liste serve vraiment. Nommé, jamais compté en pourcentage. */
export function cequiManque(eleves = []) {
  const sansNiveau = eleves.filter((e) => !e.niveau);
  return {
    combien: eleves.length,
    sansNiveau,
    // Sans niveau, on ne peut ni servir les bons attendus, ni séparer les deux cycles.
    utilisable: eleves.length > 0,
    complet: eleves.length > 0 && sansNiveau.length === 0
  };
}

/** Réécrire la liste pour la remettre dans le champ. Ce qui a été corrigé doit se relire. */
export const ecrireLaListe = (eleves = []) => eleves
  .map((e) => [e.prenom, e.nom, e.niveau].filter(Boolean).join(' '))
  .join('\n');

export default { lireLaListe, cequiManque, ecrireLaListe };
