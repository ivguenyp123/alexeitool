/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LE DOCUMENT : LES COPIES CORRIGÉES, EN ENTIER
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Ce qui sort de l'outil n'est plus la prose du modèle : c'est LA COPIE DE CHAQUE ÉLÈVE,
 * corrigée. Son texte en entier, les fautes barrées en rouge avec le bon mot à côté, ce
 * qui revient chez lui, et le mot à recopier sur la copie.
 *
 * Un enseignant peut l'imprimer et le poser sur la pile. C'était le but depuis le début.
 *
 * ── ET SI LE MODÈLE N'A PAS RENDU LA FORME ATTENDUE ─────────────────────────
 *
 * On ne perd rien : on retombe sur l'export de sa prose, tel qu'avant. Un outil qui rend
 * une page blanche parce qu'un analyseur n'a pas reconnu son entrée est un outil qu'on
 * n'ouvre plus.
 */
import { enBlocs, enMorceaux, titre, pied } from './miseenforme.js';
import { lireLaCorrection, apparier } from './correction.js';
import { marquer, parNature } from './marquage.js';
import { restituer } from './eleves.js';

const T = (texte, extra = {}) => ({ type: 'paragraphe', morceaux: enMorceaux(texte), ...extra });
const BLANC = { type: 'blanc', morceaux: [] };

/**
 * Assembler le document d'une pile corrigée.
 *
 * ── ON LIT LA RÉPONSE BRUTE, PAS CELLE DE L'ÉCRAN ──────────────────────────
 *
 * L'écran affiche la réponse APRÈS restitution : « Élève 01 » y est déjà devenu
 * « Camille ». Or l'appariement se fait sur le pseudonyme — c'est lui qui désigne une
 * copie déposée de façon sûre.
 *
 * Mesuré : en lisant le texte de l'écran, AUCUN bloc ne se rattachait à sa copie, et le
 * document sortait en disant qu'aucune correction ne correspondait à rien. Le garde
 * fonctionnait ; c'est ce qu'il gardait qui était faux.
 *
 * On lit donc le brut, et on remet les prénoms morceau par morceau, au moment d'écrire.
 *
 * @param {string} reponse   ce que le modèle a rendu, AVEC les numéros
 * @param {object} pile      la pile déposée, avec le texte réel des copies
 * @param {object} classe    la table, pour nommer les élèves
 */
export function documentDeCorrection(reponse, pile, classe, infos = {}) {
  const lu = lireLaCorrection(reponse);
  const { appariees, orphelins, sansCorrection } = apparier(lu.copies, pile?.copies || []);

  /*
   * ── DEUX CAS QUI SE RESSEMBLENT ET QUI N'ONT RIEN À VOIR ───────────────────
   *
   * Aucun bloc RECONNU : le modèle a répondu en prose. On rend sa prose, comme avant —
   * mieux vaut le format d'hier que rien du tout.
   *
   * Des blocs reconnus mais AUCUN qui corresponde à une copie déposée : ce n'est pas de
   * la prose, ce sont des corrections adressées à des élèves dont on n'a rien. Les rendre
   * telles quelles imprimerait une appréciation pour un enfant qui n'a pas rendu — la
   * faute exacte qui avait produit « Alice a parfaitement réussi ». On refuse, et on dit
   * pourquoi.
   */
  if (!appariees.length && !lu.reconnu) {
    return { blocs: [...titre(infos), ...enBlocs(reponse), ...pied(infos)], surLaCopie: false };
  }
  if (!appariees.length) {
    const blocs = [...titre(infos),
      { type: 'titre', niveau: 2, morceaux: enMorceaux('À REGARDER') },
      T('Aucune des corrections reçues ne correspond à une copie déposée. Rien n\'a été '
        + 'écrit sur les copies : ce qui suit désigne des élèves dont tu n\'as rien remis.',
        { alerte: true })];
    for (const o of orphelins) {
      blocs.push(T(`Correction reçue pour « ${restituer(o.qui, classe)} », qui ne `
        + 'correspond à aucune copie déposée. Elle n\'a pas été utilisée.', { alerte: true }));
    }
    for (const c of sansCorrection) {
      blocs.push(T(`${c.pseudo ? restituer(c.pseudo, classe) : c.nom || 'une copie'} : `
        + 'aucune correction n\'est revenue pour cette copie.', { alerte: true }));
    }
    return { blocs: [...blocs, ...pied(infos)], surLaCopie: false, copies: 0 };
  }

  const blocs = [...titre(infos)];
  let numero = 0;

  for (const a of appariees) {
    numero += 1;
    const qui = a.copie.pseudo
      ? restituer(a.copie.pseudo, classe)
      : `Copie ${numero} — élève non identifié`;
    blocs.push({ type: 'titre', niveau: 2, morceaux: enMorceaux(qui) });

    /*
     * LA COPIE, EN ENTIER. Pas un extrait, pas un résumé : le texte que l'élève a écrit,
     * avec les corrections dedans. C'est ce qui permet de la relire sans l'avoir en main.
     */
    const m = marquer(a.copie.texte, a.erreurs);
    blocs.push({ type: 'paragraphe', copie: true, morceaux: m.morceaux });

    const natures = parNature(m.erreurs);
    if (natures.length) {
      blocs.push(T(natures.map((n) => `${n.combien} ${n.nature}`).join(' · '), { discret: true }));
    } else if (!m.introuvables.length) {
      blocs.push(T('Aucune erreur relevée.', { discret: true }));
    }

    /*
     * CE QU'ON N'A PAS SU POSER. Le modèle a annoncé une faute sur un mot absent de la
     * copie : on ne la place pas au hasard, on la montre. C'est court, et c'est le genre
     * de ligne qui fait rouvrir la copie plutôt que faire confiance.
     */
    for (const i of m.introuvables) {
      blocs.push(T(`Signalé mais introuvable dans la copie : « ${i.ecrit} » → `
        + `« ${i.attendu} »`, { alerte: true }));
    }
    /*
     * Le mot qui revient : on ne devine pas lequel corriger. La ligne dit combien de fois
     * il apparaît, ce qui suffit à retrouver le bon en dix secondes sur la copie.
     */
    for (const a of m.ambigues) {
      blocs.push(T(`À situer : « ${a.ecrit} » → « ${a.attendu} » — ce mot apparaît `
        + `${a.combien} fois dans la copie, la correction n'a pas été posée.`,
        { alerte: true }));
    }

    if (a.mot) {
      blocs.push(BLANC);
      blocs.push({ type: 'paragraphe', mot: true,
                   morceaux: [{ texte: restituer(a.mot, classe), taille: 22 }] });
    }
    blocs.push(BLANC);
  }

  /*
   * CE QUI N'A PAS ÉTÉ CORRIGÉ. Une copie déposée dont aucune correction n'est revenue
   * est un trou : sans cette ligne, on rend la pile en croyant l'avoir traitée en entier.
   */
  if (sansCorrection.length || orphelins.length) {
    blocs.push({ type: 'titre', niveau: 2, morceaux: enMorceaux('À REGARDER') });
    for (const c of sansCorrection) {
      blocs.push(T(`${c.pseudo ? restituer(c.pseudo, classe) : c.nom || 'une copie'} : `
        + 'aucune correction n\'est revenue pour cette copie.', { alerte: true }));
    }
    for (const o of orphelins) {
      blocs.push(T(`Correction reçue pour « ${restituer(o.qui, classe)} », qui ne `
        + 'correspond à aucune copie déposée. Elle n\'a pas été utilisée.', { alerte: true }));
    }
  }

  // La prose hors blocs — le bilan de classe, ce qu'il faut reprendre — vient après les
  // copies : on corrige d'abord, on prend du recul ensuite.
  if (lu.prose) {
    blocs.push(BLANC);
    blocs.push(...enBlocs(restituer(lu.prose, classe)));
  }

  return { blocs: [...blocs, ...pied(infos)], surLaCopie: true,
           copies: appariees.length, introuvables: appariees
             .reduce((s, a) => s + marquer(a.copie.texte, a.erreurs).introuvables.length, 0) };
}

export default { documentDeCorrection };
