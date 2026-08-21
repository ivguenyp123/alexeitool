/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LES CORRECTIONS, LUES ET REPOSÉES SUR LA COPIE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Une liste d'erreurs à côté d'une copie qu'on n'a pas sous les yeux ne sert à rien. Ce
 * qu'un enseignant produit vraiment, c'est LA COPIE CORRIGÉE : le mot fautif barré, le
 * bon écrit à côté, en rouge. On refait donc exactement ça.
 *
 * ── LE MODÈLE ÉCRIT DANS UNE FORME QU'ON SAIT RELIRE ────────────────────────
 *
 * On lui demande, pour chaque copie, un petit bloc :
 *
 *     --- COPIE Élève 07
 *     * dor -> dort | accord sujet-verbe
 *     * tapi -> tapis | mot mal su
 *     > Tu as écrit toute la phrase, bravo. Reprends l'accord du verbe…
 *
 * ── ET LA LECTURE EST INDULGENTE, PAR NÉCESSITÉ ─────────────────────────────
 *
 * Un modèle ne rend jamais tout à fait la forme demandée : il écrit « → » au lieu de
 * « -> », met un tiret au lieu d'une barre, oublie l'astérisque, ajoute du gras. On
 * accepte donc toutes ces variantes.
 *
 * Et surtout : ce qui n'est pas reconnu N'EST PAS JETÉ. La prose du modèle est rendue
 * telle quelle à côté. Un analyseur strict qui avalerait la moitié de la réponse serait
 * pire que pas d'analyseur du tout — on ne saurait même pas ce qu'on a perdu.
 */

/** Les flèches qu'un modèle emploie. La première est celle qu'on demande. */
const FLECHE = '(?:->|→|=>|⇒|»|>>)';

/*
 * L'ouverture d'un bloc. « --- COPIE Élève 07 », « === COPIE 3 », « COPIE Élève 07 ».
 * Le pseudonyme est pris tel quel jusqu'à la fin de la ligne : c'est lui qui rattachera
 * le bloc à une copie déposée.
 */
const OUVERTURE = /^\s*(?:[-=*#\s]*)COPIE\s*:?\s*(.+?)\s*[-=*]*\s*$/i;

const nettoie = (s) => String(s || '')
  .replace(/\*\*/g, '').replace(/^[\s*·—–-]+/, '').replace(/\s+$/, '');

/**
 * Lire une réponse de correction.
 *
 * @returns {{copies:Array, prose:string, reconnu:boolean}}
 *   `copies` : `[{ qui, erreurs:[{ecrit, attendu, nature}], mot }]`
 *   `prose`  : tout ce qui n'appartenait à aucun bloc — rendu tel quel, jamais jeté
 */
export function lireLaCorrection(texte) {
  const lignes = String(texte || '').split('\n');
  const copies = [];
  const dehors = [];
  let courante = null;

  const fermer = () => { if (courante) copies.push(courante); courante = null; };

  /*
   * ── CE QUI FERME UN BLOC ───────────────────────────────────────────────────
   *
   * Sans cette règle, rien ne le fermait : tout ce qui suivait la première copie — le
   * bilan de classe compris — s'accumulait dans le « mot à écrire ». Mesuré : le mot
   * destiné à un enfant de huit ans recevait « CE QUI REVIENT DANS LA CLASSE · accord
   * sujet-verbe : 1 élève ». Imprimé sur sa copie.
   *
   * Un titre en capitales, un titre markdown, ou une ligne ordinaire après un blanc :
   * dans les trois cas, on est sorti de la copie.
   */
  const titre = (l) => /^#{1,4}\s/.test(l)
    || (l.length > 3 && l === l.toUpperCase() && /[A-ZÀ-Ý]/.test(l));

  let apresUnBlanc = false;
  for (const brute of lignes) {
    const ouverture = OUVERTURE.exec(brute);
    if (ouverture) {
      fermer();
      courante = { qui: nettoie(ouverture[1]), erreurs: [], mot: '' };
      apresUnBlanc = false;
      continue;
    }

    if (!courante) { dehors.push(brute); continue; }

    // La fin d'un bloc : une ligne de tirets seule, ou un titre de section.
    if (/^\s*[-=]{3,}\s*$/.test(brute)) { fermer(); continue; }

    const l = nettoie(brute);
    if (!l) { apresUnBlanc = true; continue; }

    // Le mot à l'élève : « > … », « mot: … », « Le mot à écrire : … »
    const mot = /^(?:>+\s*|mot\s*:\s*|le mot (?:à écrire|sur la copie)\s*:\s*)(.+)$/i.exec(l);
    if (mot) {
      courante.mot = `${courante.mot ? `${courante.mot} ` : ''}${mot[1].trim()}`;
      apresUnBlanc = false;
      continue;
    }

    const err = new RegExp(`^(.+?)\\s*${FLECHE}\\s*(.+?)\\s*(?:[|—–]\\s*(.+))?$`).exec(l);
    if (err) {
      const ecrit = nettoie(err[1]).replace(/^["«»']|["«»']$/g, '').trim();
      const attendu = nettoie(err[2]).replace(/^["«»']|["«»']$/g, '').trim();
      // Une « erreur » sans mot fautif ne peut pas être posée sur la copie. On la laisse
      // filer dans la prose plutôt que d'inventer un emplacement.
      if (ecrit && attendu) {
        courante.erreurs.push({ ecrit, attendu, nature: (err[3] || '').trim() });
        apresUnBlanc = false;
        continue;
      }
    }

    if (titre(l) || (apresUnBlanc && !courante.mot)) {
      fermer();
      dehors.push(brute);
      apresUnBlanc = false;
      continue;
    }
    if (apresUnBlanc && courante.mot) { fermer(); dehors.push(brute); apresUnBlanc = false; continue; }

    // Tout le reste appartient encore au bloc, mais on ne sait pas le ranger : il rejoint
    // le mot à l'élève, qui est l'endroit où une phrase libre a un sens.
    courante.mot = `${courante.mot ? `${courante.mot} ` : ''}${l}`;
    apresUnBlanc = false;
  }
  fermer();

  return {
    copies,
    prose: dehors.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    reconnu: copies.length > 0
  };
}

/**
 * Rattacher les blocs lus aux copies réellement déposées.
 *
 * Le modèle désigne les élèves par leur numéro. On ne fait confiance à ce numéro que s'il
 * correspond à une copie qu'on a : un bloc adressé à quelqu'un dont aucune copie n'a été
 * déposée est un bloc inventé, et il ne doit surtout pas atterrir sur le document.
 */
export function apparier(copies = [], deposees = []) {
  const restantes = [...deposees];
  const appariees = [];
  const orphelins = [];

  for (const c of copies) {
    const i = restantes.findIndex((d) => d.pseudo && c.qui.includes(d.pseudo));
    if (i >= 0) { appariees.push({ ...c, copie: restantes.splice(i, 1)[0] }); continue; }

    // « Copie 2 », pour les copies qu'on n'a pas su rattacher à un élève.
    const num = /copie\s*(\d+)/i.exec(c.qui);
    if (num) {
      const sansNom = restantes.filter((d) => !d.pseudo);
      const cible = sansNom[Number(num[1]) - 1];
      if (cible) {
        restantes.splice(restantes.indexOf(cible), 1);
        appariees.push({ ...c, copie: cible });
        continue;
      }
    }
    orphelins.push(c);
  }
  return { appariees, orphelins, sansCorrection: restantes };
}

export default { lireLaCorrection, apparier };
