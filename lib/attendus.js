/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LES ATTENDUS — DÉPOSÉS, JAMAIS RÉCITÉS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── POURQUOI ILS NE SONT PAS ÉCRITS DANS CE FICHIER ─────────────────────────
 *
 * On aurait pu les taper. Un modèle les « connaît », et le résultat aurait eu l'air juste :
 * des phrases bien tournées, un vocabulaire crédible, des formulations plausibles. Et
 * personne n'aurait pu dire lesquelles étaient exactes.
 *
 * Or c'est précisément ce que chaque consigne interdit au modèle : citer un attendu qu'il
 * n'a pas sous les yeux. L'écrire ici de mémoire aurait été faire, une fois pour toutes et
 * en dur, l'erreur qu'on interdit trente-deux fois par ailleurs.
 *
 * Alors on ne les écrit pas : on les DÉPOSE. L'enseignant met le texte officiel dans
 * l'outil, et ce qui en sort porte sa provenance. C'est la seule façon d'avoir des attendus
 * dont on puisse dire d'où ils viennent.
 *
 * ── ET CE QUI N'A PAS ÉTÉ DÉPOSÉ RESTE VIDE, VISIBLEMENT ────────────────────
 *
 * Un domaine sans attendus n'est pas un domaine « sans exigences » : c'est un domaine dont
 * on n'a pas encore le texte. `couverture()` le dit, et les consignes continuent d'annoncer
 * ce qu'elles n'ont pas. Même règle que « non évalué n'est pas non atteint ».
 */
import { HORAIRES } from './semaine.js';
import { programme } from './programmes.js';

/** Le cycle d'un niveau. Le CE2 clôt le cycle 2, le CM1 ouvre le cycle 3. */
export const CYCLE = { CE2: 2, CM1: 3 };

/**
 * Lire un texte officiel déposé.
 *
 * Le découpage est VOLONTAIREMENT simple : une ligne, un attendu. Les textes officiels
 * sont des listes à puces, et un analyseur plus malin se tromperait de façon plus
 * difficile à voir.
 *
 * Ce qui n'a pas été retenu est RENDU, pas jeté. Quelqu'un qui dépose trois pages et
 * n'obtient que huit attendus doit pouvoir constater que soixante lignes ont été écartées,
 * plutôt que de croire que le programme en compte huit.
 */
export function lireAttendus(texte, { cycle, domaine, source = '', generation = '' } = {}) {
  const lignes = String(texte || '').split('\n');
  const retenus = [];
  const ecartees = [];

  for (const brute of lignes) {
    // La puce, le tiret, l'astérisque : les trois formes des listes officielles.
    const l = brute.replace(/^\s*[-–—•*·]\s*/, '').trim();
    if (!l) continue;

    /*
     * Ce qu'on écarte, et pourquoi chaque motif :
     *   trop court     un fragment, un numéro de page, un intertitre
     *   TOUT EN CAPITALES  un titre de section, pas un attendu
     *   sans verbe     un attendu se formule par une action de l'élève
     */
    if (l.length < 15) { ecartees.push({ ligne: l, pourquoi: 'trop courte' }); continue; }
    if (l === l.toUpperCase() && /[A-ZÀ-Ý]/.test(l)) {
      ecartees.push({ ligne: l, pourquoi: 'écrite en capitales — un titre, pas un attendu' });
      continue;
    }
    retenus.push({ cycle, domaine, texte: l, source, generation });
  }

  return { attendus: retenus, ecartees };
}

/**
 * Ce qui est déposé pour un domaine et un niveau, DANS LA BONNE GÉNÉRATION.
 *
 * Le domaine du CE2 et celui du CM1 peuvent différer sur le même créneau — c'est tout le
 * sujet du double niveau. Et depuis 2026 ils peuvent aussi relever de deux GÉNÉRATIONS de
 * programmes : le CM1 est passé au nouveau, le CE2 pas encore.
 *
 * Servir le mauvais texte serait le pire cas : il aurait exactement l'air du bon.
 */
export function pour(registre = [], domaine, niveau, annee) {
  const cycle = CYCLE[niveau];
  const memeDomaine = registre.filter((a) => a.cycle === cycle && a.domaine === domaine);

  const p = annee === undefined ? null : programme(domaine, niveau, annee);
  // Le domaine ne bascule pas : il n'y a qu'un programme, la génération ne veut rien dire.
  if (!p) return memeDomaine;

  const bonne = memeDomaine.filter((a) => !a.generation || a.generation === p.generation);
  return bonne;
}

/**
 * A-t-on le texte de l'AUTRE génération, et pas celui qu'il faut ?
 *
 * Le cas se produira : on télécharge le nouveau programme d'histoire-géo, il sert au CM1,
 * et le CE2 se retrouve sans rien alors que le fichier a l'air plein. Sans ce contrôle,
 * l'écran dirait « aucun texte déposé » pour un domaine qu'on vient de déposer — et
 * personne ne comprendrait.
 */
export function mauvaiseGeneration(registre = [], domaine, niveau, annee) {
  const p = annee === undefined ? null : programme(domaine, niveau, annee);
  if (!p) return null;
  if (pour(registre, domaine, niveau, annee).length) return null;
  const autres = registre.filter((a) => a.cycle === CYCLE[niveau] && a.domaine === domaine
                                     && a.generation && a.generation !== p.generation);
  return autres.length ? { attendue: p.generation, deposee: autres[0].generation,
                           combien: autres.length } : null;
}

/**
 * Ce qui est couvert et ce qui ne l'est pas, domaine par domaine.
 *
 * L'inventaire inconfortable, et le seul qui permette de savoir où on en est. Il se lit
 * comme une liste de courses : voilà les textes qu'il reste à déposer.
 */
export function couverture(registre = [], annee) {
  const out = { CE2: [], CM1: [] };
  for (const [niveau, horaires] of Object.entries(HORAIRES)) {
    for (const domaine of Object.keys(horaires)) {
      const n = pour(registre, domaine, niveau, annee).length;
      out[niveau].push({ domaine, combien: n, depose: n > 0 });
    }
    out[niveau].sort((a, b) => a.combien - b.combien);
  }
  return out;
}

/** Combien de domaines attendent encore leur texte. Un compte, pas un pourcentage. */
export function manquants(registre = [], annee) {
  const c = couverture(registre, annee);
  return [...c.CE2.filter((x) => !x.depose).map((x) => ({ niveau: 'CE2', ...x })),
          ...c.CM1.filter((x) => !x.depose).map((x) => ({ niveau: 'CM1', ...x }))];
}

/**
 * Le bloc d'attendus à donner au modèle — ou l'aveu qu'on n'en a pas.
 *
 * C'est ici que se décide ce que la consigne pourra dire. Tant que rien n'est déposé, le
 * texte envoyé continue d'annoncer le manque, et le modèle garde l'interdiction d'inventer.
 */
export function direLesAttendus(registre, creneau, niveaux = ['CE2', 'CM1'], annee) {
  const L = [];
  const trouves = [];
  const decales = [];

  for (const niveau of niveaux) {
    const domaine = creneau?.regime === 'commun'
      ? creneau.domaine : (creneau?.[niveau]?.domaine || creneau?.domaine);
    if (!domaine) continue;
    const liste = pour(registre, domaine, niveau, annee);
    if (liste.length) { trouves.push({ niveau, domaine, liste }); continue; }
    const mg = mauvaiseGeneration(registre, domaine, niveau, annee);
    if (mg) decales.push({ niveau, domaine, ...mg });
  }

  /*
   * LE TEXTE DÉPOSÉ EST CELUI DE L'AUTRE GÉNÉRATION.
   *
   * Dire « rien n'a été déposé » serait faux et incompréhensible : le fichier est plein.
   * On nomme précisément ce qui manque, sinon on cherche pendant une heure.
   */
  for (const d of decales) {
    L.push(`ATTENTION — pour le ${d.niveau}, le texte déposé sur ce domaine est celui du`);
    L.push(`  programme ${d.deposee.toUpperCase()} (${d.combien} attendus), alors que ce`);
    L.push(`  niveau relève du programme ${d.attendue.toUpperCase()} cette année. Tu ne`);
    L.push('  l\'utilises donc PAS, et tu le dis.');
    L.push('');
  }

  if (!trouves.length) {
    L.push('LES ATTENDUS OFFICIELS');
    L.push('  Aucun texte officiel n\'a été déposé pour ce domaine. Tu ne dois donc en');
    L.push('  citer aucun, ni de mémoire, ni approximativement : une référence de programme');
    L.push('  inventée a l\'aplomb d\'une référence sourcée, et personne ne la vérifiera.');
    L.push('  Travaille sur le domaine et la durée.');
    return { texte: L.join('\n'), combien: 0 };
  }

  L.push('LES ATTENDUS OFFICIELS DÉPOSÉS PAR L\'ENSEIGNANT');
  L.push('  Ce sont les seuls que tu as le droit d\'utiliser. Tu n\'en ajoutes aucun autre,');
  L.push('  et tu ne reformules pas ceux-ci en changeant leur exigence.');
  let combien = 0;
  for (const t of trouves) {
    L.push('');
    L.push(`  ${t.niveau} — cycle ${CYCLE[t.niveau]}`);
    for (const a of t.liste) { L.push(`    · ${a.texte}`); combien += 1; }
    if (t.liste[0]?.source) L.push(`    (source : ${t.liste[0].source})`);
  }

  // Ce qui manque pour l'AUTRE niveau est dit aussi : une fiche qui traite bien un groupe
  // et devine l'autre est pire qu'une fiche qui traite mal les deux.
  const sans = niveaux.filter((n) => !trouves.some((t) => t.niveau === n));
  if (sans.length) {
    L.push('');
    L.push(`  Rien n'a été déposé pour ${sans.join(' ni ')} sur ce créneau. Pour ce groupe-là,`);
    L.push('  tu n\'inventes rien et tu le DIS dans ta réponse.');
  }
  return { texte: L.join('\n'), combien };
}

export default { CYCLE, lireAttendus, pour, mauvaiseGeneration, couverture,
                 manquants, direLesAttendus };
