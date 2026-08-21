/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  CE QUI A LE DROIT DE PARTIR — ET LA CLÉ QUI NE PART JAMAIS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── LA CLÉ VIT DANS LE PROCESSUS, PAS DANS LA PAGE ──────────────────────────
 *
 * L'outil est une page statique. Tout ce que la page connaît, n'importe qui peut le lire
 * dans les outils de développement du navigateur — il n'y a pas de « caché » côté client,
 * il n'y a que du « pas encore regardé ».
 *
 * La clé reste donc dans le processus qui sert les fichiers, elle ne traverse jamais la
 * réponse HTTP, et la page appelle une route locale qui ne la lui rend pas.
 *
 * ── ET CE MODULE DÉCIDE, SANS RIEN ENVOYER ──────────────────────────────────
 *
 * Il est pur : il prend l'état du monde et rend une décision. C'est ce qui permet de
 * vérifier les refus sans réseau et sans clé — y compris le refus qui compte le plus,
 * celui d'un envoi qui n'a pas été caviardé.
 */

/** Le fournisseur retenu. Un seul, nommé — pas un réglage qu'on découvre en production. */
export const FOURNISSEUR = {
  nom: 'DeepSeek',
  url: 'https://api.deepseek.com/chat/completions',
  variable: 'DEEPSEEK_API_KEY',
  modele: 'deepseek-chat'
};

/** Un envoi plus gros que ça n'est pas une copie : c'est une erreur de manipulation. */
export const MAX_CARACTERES = 120_000;

/**
 * Peut-on envoyer ceci ?
 *
 * Rend `{ ok: true }` ou `{ ok: false, code, dit }` — `dit` est destiné à être affiché
 * tel quel. Un refus qui ne dit pas quoi faire est un refus qu'on contourne.
 *
 * @param {object} o
 *   @param {string} o.cle        la clé lue dans l'environnement du processus
 *   @param {object} o.corps      ce que la page demande d'envoyer
 */
export function peutEnvoyer({ cle, corps } = {}) {
  if (!cle) {
    return { ok: false, code: 503, dit:
      `Aucune clé ${FOURNISSEUR.nom} dans l'environnement. Mets-la dans un fichier `
      + `\`.env\` à la racine, sous le nom \`${FOURNISSEUR.variable}\`, puis relance `
      + '`npm start`. Le fichier `.env` est ignoré par git — il ne partira jamais au dépôt.' };
  }

  const texte = String(corps?.texte || '');
  if (!texte.trim()) {
    return { ok: false, code: 400, dit: 'Rien à envoyer.' };
  }
  if (texte.length > MAX_CARACTERES) {
    return { ok: false, code: 413, dit:
      `${texte.length} caractères, au-delà des ${MAX_CARACTERES} admis. Une pile de copies `
      + 'entière tient largement dedans : au-delà, c\'est presque toujours une erreur de '
      + 'manipulation, et l\'envoyer coûterait cher pour un résultat inutilisable.' };
  }

  /*
   * ── LE REFUS QUI COMPTE ─────────────────────────────────────────────────────
   *
   * Rien ne part sans que la page ait DÉCLARÉ avoir caviardé les prénoms.
   *
   * C'est une déclaration, pas une preuve : le serveur ne connaît pas la classe — elle
   * vit dans le navigateur et n'a aucune raison d'en sortir — donc il ne peut pas
   * vérifier lui-même. La limite est réelle et elle est écrite ici plutôt que passée
   * sous silence.
   *
   * Ce que ce contrôle attrape quand même, et ce n'est pas rien : le jour où quelqu'un
   * branche un nouvel écran en oubliant l'étape de caviardage, l'envoi est refusé au lieu
   * de partir. L'oubli devient une erreur visible au lieu d'une fuite silencieuse.
   */
  if (corps?.caviarde !== true) {
    return { ok: false, code: 400, dit:
      'Cet envoi n\'a pas été marqué comme caviardé. Rien ne part tant que les prénoms '
      + 'n\'ont pas été remplacés par des pseudonymes — c\'est du travail d\'enfants qui '
      + 'traverserait le réseau.' };
  }

  return { ok: true };
}

/**
 * Le corps de la requête, tel qu'il partira.
 *
 * `température` basse : on demande des reformulations et des classements, pas de
 * l'invention. Un modèle bavard produit ici des séances plausibles et fausses.
 */
export function requete({ texte, consigne }) {
  return {
    model: FOURNISSEUR.modele,
    temperature: 0.3,
    messages: [
      ...(consigne ? [{ role: 'system', content: consigne }] : []),
      { role: 'user', content: texte }
    ]
  };
}

/**
 * Ce qu'on garde de la réponse — et rien d'autre.
 *
 * On ne renvoie à la page ni les en-têtes, ni l'identifiant de requête, ni quoi que ce
 * soit qui viendrait du fournisseur en dehors du texte. Moins il traverse, moins il y a
 * à vérifier.
 */
export function reponse(json) {
  const texte = json?.choices?.[0]?.message?.content;
  if (typeof texte !== 'string') {
    return { ok: false, dit: 'Le fournisseur a répondu quelque chose d\'inattendu.' };
  }
  return { ok: true, texte, jetons: json?.usage?.total_tokens ?? null };
}

export default { FOURNISSEUR, MAX_CARACTERES, peutEnvoyer, requete, reponse };
