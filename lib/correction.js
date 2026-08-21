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
const FLECHE = '(?:->|→|=>|⇒|>>)';


/**
 * ── LE MOT CORRECT N'EST PAS TOUJOURS APRÈS LA FLÈCHE ───────────────────────
 *
 * Mesuré sur une vraie dictée. La consigne demandait « dor -> dort | accord ». Le modèle
 * a écrit :
 *
 *     « parte » → accord sujet/verbe (« Léo et sa petite sœur » → « partent »)
 *     « leurs cartable » → accord nom/adjectif (« leurs » → « leur »)
 *
 * Le mot correct est entre guillemets, à la fin, parfois derrière une deuxième flèche.
 * Refuser cette forme aurait été refuser la réponse la plus naturelle qu'un modèle
 * produit — et laisser l'enseignant devant un document sans une seule marque rouge.
 */
function separer(droite) {
  const d = String(droite).trim();

  // « A » → « B » : c'est B qu'il faut écrire.
  const deuxGuillemets = new RegExp(`«\\s*([^«»]+?)\\s*»\\s*${FLECHE}\\s*«\\s*([^«»]+?)\\s*»`)
    .exec(d);
  if (deuxGuillemets) {
    return { attendu: deuxGuillemets[2], nature: d.replace(deuxGuillemets[0], '').trim() };
  }

  // Le dernier groupe entre guillemets : « (probablement « Ce ») ».
  const guillemets = [...d.matchAll(/«\s*([^«»]+?)\s*»/g)];
  if (guillemets.length) {
    const dernier = guillemets[guillemets.length - 1];
    return { attendu: dernier[1], nature: d.replace(dernier[0], '').trim() };
  }

  // La forme demandée : « dort | accord sujet-verbe ».
  const barre = /^(.+?)\s*[|—–]\s*(.+)$/.exec(d);
  if (barre) return { attendu: barre[1].trim(), nature: barre[2].trim() };

  return { attendu: d, nature: '' };
}

const nettoieNature = (n) => String(n)
  // Les parenthèses vides que laisse l'extraction du mot correct : « (probablement ) ».
  .replace(/\(\s*(probablement|sans doute|plutôt)?\s*\)?/gi, ' ')
  .replace(/\)/g, ' ')
  .replace(/^[\s(){}\[\]:,.—–-]+|[\s(){}\[\]:,.—–-]+$/g, '')
  .replace(/^(erreur|faute)\s+(sur|de|d'|dans)\s*(le |la |l')?/i, '')
  .replace(/\s{2,}/g, ' ').trim();

/*
 * L'ouverture d'un bloc. « --- COPIE Élève 07 », « === COPIE 3 », « COPIE Élève 07 ».
 * Le pseudonyme est pris tel quel jusqu'à la fin de la ligne : c'est lui qui rattachera
 * le bloc à une copie déposée.
 */
/*
 * `\b` après COPIE : sans lui, « Copies des élèves 03 et 07 : » ouvrait un bloc adressé
 * à « s des élèves 03 et 07 ». Une phrase ordinaire devenait un destinataire.
 */
const OUVERTURE = /^\s*(?:[-=*#\s]*)COPIE\b\s*:?\s*(.+?)\s*[-=*]*\s*$/i;

import { plier } from './eleves.js';

const nettoie = (s) => String(s || '')
  .replace(/\*\*/g, '').replace(/^[\s*·—–-]+/, '').replace(/\s+$/, '');

/**
 * Lire une réponse de correction.
 *
 * @returns {{copies:Array, prose:string, reconnu:boolean}}
 *   `copies` : `[{ qui, erreurs:[{ecrit, attendu, nature}], mot }]`
 *   `prose`  : tout ce qui n'appartenait à aucun bloc — rendu tel quel, jamais jeté
 */
/**
 * Lire UNE ligne d'erreur, sous toutes les formes qu'un modèle emploie.
 *
 * Rend `null` quand la ligne n'en est pas une : c'est ce `null` qui fait que la prose
 * n'est pas avalée par erreur.
 */
export function lireUneErreur(ligne) {
  const l = nettoie(ligne);
  const m = new RegExp(`^(.+?)\\s*${FLECHE}\\s*(.+)$`).exec(l);
  if (!m) return null;

  const ecrit = m[1].replace(/^["«']\s*|\s*["»']$/g, '').trim();
  const { attendu, nature } = separer(m[2]);
  const propre = String(attendu).replace(/^["«']\s*|\s*["»']$/g, '').trim();
  if (!ecrit || !propre) return null;

  // Une « correction » aussi longue qu'une phrase d'explication n'en est pas une.
  if (propre.length > 80) return null;
  return { ...affiner(ecrit, propre), nature: nettoieNature(nature) };
}

/**
 * ── QUAND LE MOT FAUTIF EST PLUS LARGE QUE LA CORRECTION ────────────────────
 *
 * « Se matin » → « Ce ». Remplacer les deux mots par « Ce » écraserait « matin ». Ce que
 * le modèle a voulu dire, c'est que « Se » devient « Ce ».
 *
 * On choisit donc, dans le groupe fautif, la suite de mots la plus PROCHE de la
 * correction. Proche au sens des lettres à changer : « se » est à une lettre de « ce »,
 * « matin » en est à quatre. Sans ça, le rouge se poserait sur le mauvais mot — ce qui
 * est pire que pas de rouge du tout.
 */
export function affiner(ecrit, attendu) {
  const motsE = ecrit.split(/\s+/);
  const motsA = attendu.split(/\s+/);
  if (motsE.length <= motsA.length) return { ecrit, attendu };

  let meilleur = null;
  for (let i = 0; i + motsA.length <= motsE.length; i++) {
    const bout = motsE.slice(i, i + motsA.length).join(' ');
    const d = distance(plier(bout), plier(attendu));
    if (!meilleur || d < meilleur.d) meilleur = { bout, d };
  }
  // Trop loin : le modèle parlait d'autre chose. On garde le groupe entier, et `marquer`
  // dira qu'il ne l'a pas retrouvé plutôt que de corriger au hasard.
  /*
   * Le seuil est serré exprès. Avec un seuil lâche, « le chat noir » → « chien » se
   * resserrait sur « chat » : le rouge se posait sur un mot que personne n'avait corrigé.
   * Trop loin, on garde le groupe entier — `marquer` dira qu'il ne l'a pas retrouvé.
   */
  const seuil = Math.max(1, Math.floor(attendu.length * 0.4));
  return meilleur && meilleur.d <= seuil
    ? { ecrit: meilleur.bout, attendu } : { ecrit, attendu };
}

/** Le nombre de lettres à changer pour passer d'un mot à l'autre. */
function distance(a, b) {
  const l = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let avant = l[0];
    l[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = l[j];
      l[j] = Math.min(l[j] + 1, l[j - 1] + 1, avant + (a[i - 1] === b[j - 1] ? 0 : 1));
      avant = t;
    }
  }
  return l[b.length];
}

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

    const e = lireUneErreur(l);
    if (e) { courante.erreurs.push(e); apresUnBlanc = false; continue; }

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

  /*
   * ══════════════════════════════════════════════════════════════════════════
   *  QUAND LE MODÈLE N'A OUVERT AUCUN BLOC
   * ══════════════════════════════════════════════════════════════════════════
   *
   * C'est ce qui s'est passé sur la première vraie dictée. La consigne demandait des
   * blocs « --- COPIE Élève 08 » ; le modèle a écrit un paragraphe puis douze lignes de
   * fautes, sans aucun marqueur. Résultat : rien de reconnu, aucun rouge, et un
   * enseignant devant une liste — exactement ce qu'on voulait remplacer.
   *
   * Exiger la forme était une erreur de ma part : on ne contrôle pas ce qu'un modèle
   * rend, on contrôle ce qu'on sait lire. Alors quand il n'y a pas de bloc mais qu'il y a
   * des lignes de fautes, on les récupère — en cherchant à qui elles s'adressent dans le
   * texte lui-même.
   */
  if (!copies.length) {
    const errs = [];
    const reste = [];
    for (const l of dehors) {
      const e = lireUneErreur(l);
      if (e) errs.push(e); else reste.push(l);
    }
    if (errs.length) {
      /*
       * À QUI ? Un seul numéro d'élève nommé dans toute la réponse, c'est lui. Deux ou
       * plus, on ne tranche pas : `apparier` refusera, et le document le dira. Se tromper
       * d'élève reste la faute la plus chère.
       */
      /*
       * « les élèves 03 et 07 » compte pour DEUX, pas pour un.
       *
       * La première version ne lisait que le numéro collé au mot « élève » : sur « copies
       * des élèves 03 et 07 », elle n'en voyait qu'un, et posait sur la copie de 03 des
       * corrections qui concernaient les deux. C'est la devinette qu'on s'interdit
       * partout ailleurs, réintroduite ici par une expression trop courte.
       */
      const SUITE = '\\d{1,3}(?:\\s*(?:,|;|&|et|ou|\\/|-)\\s*(?:n[°o]\\s*)?\\d{1,3})*';
      const cites = new Set();
      for (const m of dehors.join('\n')
        .matchAll(new RegExp(`élèves?\\s*(?:n[°o]\\s*)?(${SUITE})`, 'gi'))) {
        for (const n of m[1].match(/\d{1,3}/g) || []) {
          cites.add(`Élève ${String(n).padStart(2, '0')}`);
        }
      }
      return {
        copies: [{ qui: cites.size === 1 ? [...cites][0] : '', erreurs: errs, mot: '' }],
        prose: reste.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
        reconnu: true, sansBloc: true
      };
    }
  }

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
    /*
     * Aucun destinataire nommé : ça n'est acceptable que s'il n'y a QU'UNE copie dans la
     * pile. Avec deux, on ne devine pas — la correction d'un enfant sur la copie d'un
     * autre est la faute la plus chère de tout l'outil.
     */
    if (!c.qui) {
      if (restantes.length === 1) { appariees.push({ ...c, copie: restantes.pop() }); continue; }
      orphelins.push({ ...c, qui: 'destinataire non précisé' });
      continue;
    }

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

export default { lireLaCorrection, lireUneErreur, affiner, apparier };
