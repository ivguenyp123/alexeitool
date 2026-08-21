/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LE SEUL CHEMIN VERS LE FOURNISSEUR
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Un créneau et une pile de copies n'ont rien à voir — sauf ici. Les deux finissent par
 * envoyer un texte et afficher une réponse, et c'est ce moment-là qui porte la garde.
 *
 * ── POURQUOI IL N'Y EN A QU'UN ──────────────────────────────────────────────
 *
 * S'il y avait deux chemins, il y aurait deux caviardages, deux façons de remettre les
 * prénoms, deux endroits où l'oubli est possible. Le jour où l'un des deux serait modifié
 * sans l'autre, la fuite passerait par celui qu'on aurait oublié — et rien ne le dirait.
 *
 * Alors il n'y en a qu'un. Ce qui entre ici est DÉJÀ caviardé par l'appelant, qui seul
 * sait ce qu'il envoie ; ce qui en sort est restitué ici, une fois.
 */
import { restituer } from '../lib/eleves.js';
import { noterCeQuOnExporte } from './export.js';

const $ = (id) => document.getElementById(id);

/**
 * Envoyer, afficher, et remettre les prénoms.
 *
 * @param {string} nom       le nom du geste, en titre
 * @param {string} consigne  ce que le modèle doit faire
 * @param {string} texte     la situation — DÉJÀ caviardée
 * @param {object} classe    la table, pour remettre les prénoms à l'affichage
 * @param {string} avant     ce qu'on met sous les yeux avant même la réponse
 *                           (les prénoms non couverts, le nombre de remplacements)
 */
export async function envoyer({ nom, consigne, texte, classe, palier = 'mid', avant = '',
                                exporte = {} }) {
  noterCeQuOnExporte({ nomDuGeste: nom, exercice: '', copies: 0, sansCopie: 0,
                       sansReference: false, ...exporte });
  $('sortieNom').textContent = nom;
  $('sortieTexte').textContent = '';
  $('sortieEtat').textContent = 'Envoi…';
  $('sortieEtat').className = 'etat';
  $('sortieMeta').textContent = avant;
  $('sortie').showModal();

  try {
    const r = await fetch('/api/modele', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ texte, consigne, caviarde: true, palier })
    });
    const j = await r.json();
    if (!r.ok || !j.ok) {
      $('sortieEtat').className = 'etat rate';
      $('sortieEtat').textContent = j.dit || 'L\'appel a échoué.';
      return null;
    }
    $('sortieEtat').textContent = '';
    /*
     * On remet les prénoms POUR L'AFFICHAGE seulement. L'enseignant lit « Camille », le
     * modèle n'a jamais vu autre chose que « Élève 03 ».
     */
    $('sortieTexte').textContent = restituer(j.texte, classe);
    // Ce que l'export devra dire de lui-même. Le modèle n'est connu qu'ici, à la réponse.
    noterCeQuOnExporte({ modele: `${j.fournisseur} · ${j.modele}` });

    const m = [`${j.fournisseur} · ${j.modele}`];
    if (j.jetons) m.push(`${j.jetons.entree}+${j.jetons.sortie} jetons`);
    $('sortieMeta').textContent = [avant, m.join(' · ')].filter(Boolean).join('\n');
    return j;
  } catch {
    $('sortieEtat').className = 'etat rate';
    $('sortieEtat').textContent = 'Le serveur local ne répond pas. Est-ce que `npm start` tourne ?';
    return null;
  }
}

export default { envoyer };
