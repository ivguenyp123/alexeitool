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
import { ecartDeProgramme, direLEcart } from './programmes.js';
import { direLaPile } from './pile.js';

const nom = (d) => DOMAINES[d] || d || '—';

/** La situation d'un créneau, en clair. */
export function contexteCreneau(c, { classe = [], attendus = [],
                                     annee = anneeScolaire() } = {}) {
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
  L.push(direLesAttendus(attendus, c, ['CE2', 'CM1'], annee).texte);

  /*
   * LA BASCULE DES PROGRAMMES, quand elle concerne ce créneau.
   *
   * Silencieux quand les deux groupes sont sur la même génération — un avertissement de
   * trop est ce qui fait qu'on cesse de les lire.
   */
  const ecart = direLEcart(ecartDeProgramme(c, annee));
  if (ecart) { L.push(''); L.push(ecart); }

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
/**
 * L'année de RENTRÉE. Septembre ouvre l'année suivante.
 *
 * De janvier à août on est encore dans l'année scolaire ouverte en septembre précédent :
 * en mars 2027, l'année de rentrée est 2026. Se tromper là-dessus ferait basculer les
 * programmes six mois trop tôt.
 */
export const anneeScolaire = (d = new Date()) =>
  (d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1);

export function texteDeGeste(geste, creneau, { classe = [], attendus = [],
                                               annee = anneeScolaire(), precision = '' } = {}) {
  const L = [contexteCreneau(creneau, { classe, attendus, annee })];
  if (precision.trim()) {
    L.push('');
    L.push('CE QUE L\'ENSEIGNANT PRÉCISE');
    L.push(`  ${precision.trim().split('\n').join('\n  ')}`);
  }
  return L.join('\n');
}

/**
 * ── LE TEXTE D'UN GESTE SUR UNE PILE DE COPIES ──────────────────────────────
 *
 * Une pile n'est pas un créneau : il n'y a ni horaire, ni régime, ni alternance. Ce qu'il
 * y a, c'est du travail d'élèves — donc des prénoms, donc l'obligation de caviarder avant
 * que quoi que ce soit ne parte.
 *
 * `direLaPile` s'en charge et REND ce qu'il n'a pas su couvrir. On ne bloque pas dessus :
 * ce serait ingérable, et un blocage qu'on ne peut pas lever fait recopier les copies dans
 * un autre outil, sans garde du tout. On le fait remonter à l'écran, qui le met sous les
 * yeux avant l'envoi.
 */
export function textePile(geste, p, t, { attendus = [], annee = anneeScolaire(),
                                         precision = '' } = {}) {
  const bloc = direLaPile(p, t, { attendus, annee });
  const L = [bloc.texte];

  L.push('');
  L.push('CE QUE TU N\'AS PAS');
  L.push('  Les copies telles qu\'elles ont été écrites — la mise en page, les ratures, ce qui');
  L.push('  a été effacé, la peine que ça a coûté. Tu lis une transcription. Si ta réponse');
  L.push('  dépend de la présentation ou du geste d\'écriture, DIS que tu ne peux pas la');
  L.push('  donner.');

  if (precision.trim()) {
    L.push('');
    L.push('CE QUE L\'ENSEIGNANT PRÉCISE');
    L.push(`  ${precision.trim().split('\n').join('\n  ')}`);
  }
  return { texte: L.join('\n'), restes: bloc.restes,
           caviardes: bloc.caviardes, etat: bloc.etat };
}

export default { contexteCreneau, texteDeGeste, textePile };
