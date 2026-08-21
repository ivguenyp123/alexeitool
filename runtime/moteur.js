/*
 * Le moteur — qui répond, et comment on le sait.
 *
 * Porté de la plateforme technique. Là-bas il arbitrait entre deux fournisseurs ; ici il
 * n'y en a qu'un. La couture reste quand même, et ce n'est pas de la décoration : le jour
 * où l'école impose un autre fournisseur — et dans l'Éducation nationale, ce genre de
 * décision se prend loin au-dessus de l'enseignant — seul ce fichier change.
 *
 * Le reste du produit ne doit jamais savoir à qui il parle. Il reçoit un client de forme
 * fixe : `{ fournisseur, ou, modele(), generer() }`.
 *
 * ── ET LE CHOIX EST TOUJOURS DIT ────────────────────────────────────────────
 *
 * Le fournisseur et le modèle remontent dans chaque réponse. Savoir quel modèle a répondu
 * n'est pas un détail quand ce qui est produit finit dans le livret d'un enfant.
 */
import { createDeepseek } from './deepseek.js';
import { AppelError } from './erreur.js';

export const FOURNISSEURS = ['deepseek'];

/** Qui doit répondre, d'après l'environnement. */
export function fournisseurChoisi(env = process.env) {
  const demande = (env.FOURNISSEUR || '').toLowerCase();
  if (demande && !FOURNISSEURS.includes(demande)) {
    throw new AppelError(
      `Fournisseur inconnu : \`${demande}\`. Connus : ${FOURNISSEURS.join(', ')}.`, 0);
  }
  return demande || 'deepseek';
}

/** Le client du fournisseur en vigueur. Même forme, quel qu'il soit. */
export function createMoteur({ env = process.env, models = [], fetchImpl } = {}) {
  fournisseurChoisi(env);
  return createDeepseek({ env, models, fetchImpl });
}

export default { createMoteur, fournisseurChoisi, FOURNISSEURS };
