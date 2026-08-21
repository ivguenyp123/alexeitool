/*
 * L'erreur d'un appel au modèle.
 *
 * Extraite telle quelle de la plateforme technique, où elle vivait dans le client Vertex.
 * Ici il n'y a pas de Vertex, mais la forme reste : un message lisible, un statut HTTP, et
 * le détail brut pour qui doit creuser. Une erreur qui ne porte pas son statut oblige à
 * relire les logs pour distinguer « clé invalide » de « solde épuisé ».
 */
export class AppelError extends Error {
  constructor(message, status = 0, detail = '') {
    super(message);
    this.name = 'AppelError';
    this.status = status;
    this.detail = detail;
  }
}

export default { AppelError };
