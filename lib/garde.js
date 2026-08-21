/**
 * LA GARDE : ce qui a le droit de partir.
 *
 * Le client DeepSeek est porté tel quel de la plateforme technique — il ne contient aucune
 * règle, et c'est ce qui fait sa valeur. Les règles sont ici, et elles sont propres à ce
 * produit-ci : ailleurs on envoie du code, ici on envoie du travail d'enfants.
 *
 * Module pur : il décide AVANT tout appel réseau, donc les refus se vérifient sans clé et
 * sans connexion.
 */

/** Un envoi plus gros que ça n'est pas une pile de copies : c'est une fausse manœuvre. */
export const MAX_CARACTERES = 120_000;

export function peutEnvoyer({ cle, corps } = {}) {
  if (!cle) {
    return { ok: false, code: 503, dit:
      'Aucune clé DeepSeek dans l\'environnement. Mets-la dans un fichier `.env` à la '
      + 'racine, sous le nom `DEEPSEEK_API_KEY`, puis relance `npm start`. Le fichier '
      + '`.env` est ignoré par git — il ne partira jamais au dépôt.' };
  }

  const texte = String(corps?.texte || '');
  if (!texte.trim()) return { ok: false, code: 400, dit: 'Rien à envoyer.' };

  if (texte.length > MAX_CARACTERES) {
    return { ok: false, code: 413, dit:
      `${texte.length} caractères, au-delà des ${MAX_CARACTERES} admis. Une pile de copies `
      + 'entière tient largement dedans : au-delà, c\'est presque toujours une fausse '
      + 'manœuvre, et l\'envoyer coûterait cher pour un résultat inutilisable.' };
  }

  /*
   * ── LE REFUS QUI COMPTE ────────────────────────────────────────────────────
   *
   * Rien ne part sans que la page ait DÉCLARÉ avoir caviardé les prénoms.
   *
   * C'est une déclaration, pas une preuve : le serveur ne connaît pas la classe — elle vit
   * dans le navigateur et n'a aucune raison d'en sortir. La limite est écrite ici plutôt
   * que passée sous silence.
   *
   * Ce que le contrôle attrape quand même : le jour où quelqu'un branche un nouvel écran
   * en oubliant l'étape, l'envoi est refusé au lieu de partir. L'oubli devient une erreur
   * visible au lieu d'une fuite silencieuse.
   */
  if (corps?.caviarde !== true) {
    return { ok: false, code: 400, dit:
      'Cet envoi n\'a pas été marqué comme caviardé. Rien ne part tant que les prénoms '
      + 'n\'ont pas été remplacés par des pseudonymes — c\'est du travail d\'enfants qui '
      + 'traverserait le réseau.' };
  }

  return { ok: true };
}

export default { MAX_CARACTERES, peutEnvoyer };
