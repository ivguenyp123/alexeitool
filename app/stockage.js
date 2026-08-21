/**
 * Ce qui reste sur la machine de la classe.
 *
 * Pas de compte, pas de serveur, pas de jeton. L'outil s'ouvre et il marche. C'est une
 * décision de fond, pas une facilité de départ : ce qui ne quitte jamais l'ordinateur de
 * l'enseignant ne pose aucune question de données personnelles.
 *
 * Le stockage peut refuser — navigation privée, quota, cookies bloqués. Dans ce cas on
 * perd la sauvegarde, pas l'écran : on continue en mémoire, et l'écran le DIT une fois
 * plutôt que de laisser croire que le travail est gardé.
 */

const CLE = 'alexeitool';
const VERSION = 1;

let memoire = null;      // le repli quand le navigateur refuse d'écrire
export let durable = true;

function brut() {
  try {
    const s = localStorage.getItem(CLE);
    if (!s) return null;
    const o = JSON.parse(s);
    // Un format d'une autre version ne se migre pas tant qu'il n'y a rien à préserver.
    return o && o.v === VERSION ? o : null;
  } catch {
    durable = false;
    return null;
  }
}

export function lire() {
  return memoire || brut() || { v: VERSION, semaine: null, classe: null, releves: [] };
}

export function ecrire(etat) {
  const complet = { ...etat, v: VERSION };
  memoire = complet;
  try {
    localStorage.setItem(CLE, JSON.stringify(complet));
    durable = true;
  } catch {
    // On garde tout en mémoire pour la session en cours. L'écran affiche l'avertissement.
    durable = false;
  }
  return durable;
}

export function oublier() {
  memoire = null;
  try { localStorage.removeItem(CLE); } catch { /* rien à faire, et rien de grave */ }
}
