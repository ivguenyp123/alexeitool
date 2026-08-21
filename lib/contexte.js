/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  CE QU'ON DONNE AU MODÈLE — ET CE QU'ON LUI DIT QU'ON N'A PAS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Le contexte d'un geste, c'est la situation réelle : ce créneau-là, sa durée, son régime,
 * qui fait quoi. Rien d'inventé, rien de décoratif.
 *
 * ── ET SURTOUT, CE QUI MANQUE EST ÉCRIT DEDANS ──────────────────────────────
 *
 * Le registre des attendus officiels n'existe pas encore. Un modèle à qui on ne dit rien
 * les récite de mémoire — et produit des références de programme fausses, avec l'aplomb de
 * références sourcées. Personne ne va vérifier un numéro de compétence sur une fiche de
 * préparation un dimanche soir.
 *
 * Le contexte DIT donc ce qu'il n'a pas. C'est la même règle que « non évalué n'est pas
 * non atteint », appliquée à ce qui part.
 */
import { DOMAINES, duree, dire, minutes } from './semaine.js';
import { direLesAttendus } from './attendus.js';

const nom = (d) => DOMAINES[d] || d || '—';

/** La situation d'un créneau, en clair. */
export function contexteCreneau(c, { classe = [], attendus = [] } = {}) {
  if (!c) return '';
  const L = [];
  L.push('LA SITUATION');
  L.push(`  Classe à deux niveaux : CE2 et CM1${classe.length ? `, ${classe.length} élèves` : ''}.`);
  L.push(`  ${c.jour[0].toUpperCase()}${c.jour.slice(1)}, de ${dire(minutes(c.debut))} `
       + `à ${dire(minutes(c.fin))} — soit ${dire(duree(c))}.`);

  if (c.regime === 'commun') {
    L.push(`  Les deux groupes travaillent ENSEMBLE, sur : ${nom(c.domaine)}.`);
  } else if (c.regime === 'decale') {
    L.push('  Les deux groupes travaillent EN ALTERNANCE : l\'un en autonomie pendant que');
    L.push('  l\'enseignant est avec l\'autre, puis on échange. Chacun a la totalité du créneau.');
    L.push(`    CE2 : ${nom(c.CE2?.domaine || c.domaine)}`);
    L.push(`    CM1 : ${nom(c.CM1?.domaine || c.domaine)}`);
  } else {
    L.push('  Les deux groupes travaillent SÉPARÉMENT : deux séances menées l\'une après');
    L.push(`  l\'autre, donc chaque groupe ne reçoit que ${dire(Math.round(duree(c) / 2))}.`);
    L.push(`    CE2 : ${nom(c.CE2?.domaine || c.domaine)}`);
    L.push(`    CM1 : ${nom(c.CM1?.domaine || c.domaine)}`);
  }

  L.push('');
  /*
   * LES ATTENDUS, OU LEUR ABSENCE — mais toujours l'un des deux, jamais le silence.
   *
   * Quand le texte officiel a été déposé, il part tel quel avec sa source. Quand il ne
   * l'a pas été, l'interdiction d'en inventer part à sa place. Ce qui ne doit jamais
   * arriver, c'est que le modèle ne trouve rien sur le sujet et comble de lui-même.
   */
  L.push(direLesAttendus(attendus, c).texte);

  L.push('');
  L.push('CE QUE TU N\'AS PAS NON PLUS');
  L.push('  Ce qui a été fait aux séances précédentes. Si ta réponse en dépend, DIS-LE au');
  L.push('  lieu de supposer.');
  return L.join('\n');
}

/**
 * Le texte complet d'un envoi : la situation, puis ce que l'enseignant a ajouté.
 *
 * La précision libre vient EN DERNIER et elle est nommée : c'est la seule partie que
 * quelqu'un a écrite à la main, et le modèle doit pouvoir la distinguer du reste.
 */
export function texteDeGeste(geste, creneau, { classe = [], attendus = [], precision = '' } = {}) {
  const L = [contexteCreneau(creneau, { classe, attendus })];
  if (precision.trim()) {
    L.push('');
    L.push('CE QUE L\'ENSEIGNANT PRÉCISE');
    L.push(`  ${precision.trim().split('\n').join('\n  ')}`);
  }
  return L.join('\n');
}

export default { contexteCreneau, texteDeGeste };
