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
import { DOMAINES, JOURS, NIVEAUX, REGIMES_DITS, duJour, duree, dire, minutes,
         verdict, chevauchements } from './semaine.js';
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
 * ══════════════════════════════════════════════════════════════════════════════
 *  LA SEMAINE ENTIÈRE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Un créneau se raconte en trois lignes. La semaine, non : ce qui compte, c'est la
 * SOMME — les volumes de chaque niveau, ce qui manque, et les contraintes qui font
 * qu'on ne peut pas simplement « ajouter une heure ».
 *
 * ── LES CHIFFRES SONT CALCULÉS, PAS DEMANDÉS ────────────────────────────────
 *
 * `volumes()` et `manques()` viennent du code. Un modèle à qui l'on ferait additionner
 * dix-huit créneaux se tromperait, avec aplomb, et l'erreur porterait sur la seule chose
 * qui est vérifiable — donc sur la seule chose qu'on ne doit jamais lui confier.
 */
export function contexteSemaine(semaine = [], { classe = [], annee = anneeScolaire() } = {}) {
  const L = [];
  L.push('LA SEMAINE TELLE QU\'ELLE EST POSÉE');
  L.push(`  Classe à deux niveaux, CE2 et CM1${classe.length ? `, ${classe.length} élèves` : ''}.`);
  L.push('  Semaine de 4 jours et demi : le mercredi matin est travaillé.');
  L.push('');

  for (const jour of JOURS) {
    const duJ = duJour(semaine, jour);
    if (!duJ.length) { L.push(`  ${jour} — rien de posé`); continue; }
    const fin = duJ.reduce((s, c) => s + duree(c), 0);
    L.push(`  ${jour} (${dire(fin)} de classe)`);
    for (const c of duJ) {
      const quoi = c.regime === 'commun'
        ? nom(c.domaine)
        : `CE2 ${nom(c.CE2?.domaine || c.domaine)} · CM1 ${nom(c.CM1?.domaine || c.domaine)}`;
      L.push(`    ${dire(minutes(c.debut))}–${dire(minutes(c.fin))}  `
           + `[${REGIMES_DITS[c.regime] || c.regime}]  ${quoi}`);
    }
  }

  /*
   * LES VOLUMES. C'est le chiffre, et il vient du code.
   *
   * « Dédoublé » divise le temps de chaque groupe par deux : c'est là que la grille se
   * met à mentir si personne ne recalcule, parce qu'à l'œil le créneau a l'air plein.
   */
  const v = verdict(semaine);
  L.push('');
  L.push('LES VOLUMES, CALCULÉS — tu ne les recalcules pas, tu t\'en sers');
  L.push(`  ${v.tient ? 'Les volumes réglementaires des deux niveaux sont atteints.'
                       : v.texte}`);
  for (const ligne of v.lignes || []) L.push(`    · ${ligne}`);

  const ch = chevauchements(semaine);
  if (ch.length) {
    L.push('');
    L.push('  DEUX SÉANCES EN MÊME TEMPS — la grille est incohérente :');
    for (const x of ch) L.push(`    · ${x.jour} : ${x.ap.debut} commence avant la fin de `
                             + `${x.av.debut}–${x.av.fin}`);
  }

  L.push('');
  L.push('CE QUE TU N\'AS PAS');
  L.push('  Les récréations, la cantine, les décloisonnements, les intervenants extérieurs,');
  L.push('  les APC. Si ta proposition suppose un de ces temps-là, DIS que tu ne sais pas');
  L.push('  s\'il est libre.');
  return L.join('\n');
}

export function texteSemaine(geste, semaine, { classe = [], annee = anneeScolaire(),
                                               precision = '' } = {}) {
  const L = [contexteSemaine(semaine, { classe, annee })];
  if (precision.trim()) {
    L.push('');
    L.push('CE QUE L\'ENSEIGNANT PRÉCISE');
    L.push(`  ${precision.trim().split('\n').join('\n  ')}`);
  }
  return L.join('\n');
}

/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LA CLASSE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── ON DIT CE QU'ON A OBSERVÉ, ET SURTOUT CE QU'ON N'A PAS ──────────────────
 *
 * C'est le contexte le plus dangereux des cinq, parce que c'est celui où l'on parle
 * d'enfants sans avoir de traces. Un modèle à qui l'on donne vingt-six numéros et aucune
 * observation fabriquera des profils plausibles — et des groupes de besoin fondés sur
 * rien ont exactement l'aspect de groupes de besoin fondés sur quelque chose.
 *
 * Alors le compte des relevés part avec, et l'interdiction avec lui.
 */
export function contexteClasse({ classe = [], releves = [], semaine = [],
                                 annee = anneeScolaire() } = {}) {
  const L = [];
  const parNiveau = NIVEAUX.map((n) =>
    `${n} : ${classe.filter((e) => e.niveau === n).length}`).join(' · ');

  L.push('LA CLASSE');
  L.push(`  ${classe.length} élèves — ${parNiveau}.`);
  L.push('  Les élèves sont désignés par un numéro. Tu emploies ce numéro, jamais un prénom :');
  L.push('  tu n\'en connais aucun, et en inventer un ferait passer ta réponse pour une');
  L.push('  observation de quelqu\'un qui les connaît.');

  L.push('');
  if (!releves.length) {
    /*
     * RIEN N'A ÉTÉ RELEVÉ. Le cas normal en septembre, et le plus risqué.
     */
    L.push('AUCUNE OBSERVATION N\'A ÉTÉ RELEVÉE');
    L.push('  Tu n\'as donc RIEN sur aucun élève en particulier. Tu ne constitues aucun');
    L.push('  groupe, tu n\'attribues aucune difficulté, tu ne décris personne. Si le geste');
    L.push('  demandé suppose de connaître les élèves, tu le dis et tu t\'arrêtes là.');
  } else {
    const eleves = new Set(releves.map((r) => r.eleve));
    L.push(`CE QUI A ÉTÉ RELEVÉ : ${releves.length} observation(s) sur `
         + `${eleves.size} élève(s) — donc pas sur les autres.`);
    L.push('  Ce qui n\'a pas été observé n\'est pas « non atteint » : c\'est du non-observé,');
    L.push('  et ça ne se comble pas par une estimation.');
    for (const r of releves.slice(0, 200)) {
      L.push(`    · ${r.eleve} — ${r.attendu} : ${r.niveau}`
           + `${r.date ? ` (${r.date})` : ''}${r.origine ? ` [${r.origine}]` : ''}`);
    }
  }
  if (semaine.length) {
    L.push('');
    L.push(`  Pour situer : la semaine compte ${semaine.length} créneaux posés, `
         + 'et le mercredi matin est travaillé.');
  }
  return L.join('\n');
}

export function texteClasse(geste, { classe = [], releves = [], semaine = [],
                                     annee = anneeScolaire(), precision = '' } = {}) {
  const L = [contexteClasse({ classe, releves, semaine, annee })];
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

export default { contexteCreneau, texteDeGeste, textePile,
                 contexteSemaine, texteSemaine, contexteClasse, texteClasse };
