/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  UNE PORTE : LA FEUILLE DE GESTES D'UN OBJET
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * La semaine, la classe, une période, un élève : quatre choses différentes, et le même
 * geste d'ouverture. On touche l'objet, et ce qu'on peut en faire est là.
 *
 * ── POURQUOI UNE SEULE FEUILLE POUR TOUTES ──────────────────────────────────
 *
 * Pas pour économiser des lignes. Parce que chaque feuille porte, sur chaque bouton, ce
 * que le geste LIT et ce qu'il NE FERA JAMAIS — et que c'est précisément ce qu'on oublie
 * de recopier quand on écrit le quatrième écran un vendredi soir. Une seule feuille, une
 * seule chance de l'oublier, et un test qui la surveille.
 *
 * Le créneau et la pile gardent leur propre écran : ils ont chacun des champs à eux
 * (l'horaire, le dépôt de copies) qu'aucune feuille générique ne porterait bien.
 */
import { ici } from '../lib/gestes.js';

const $ = (id) => document.getElementById(id);
const el = (t, c, x) => {
  const n = document.createElement(t);
  if (c) n.className = c;
  if (x !== undefined) n.textContent = x;
  return n;
};

/**
 * Ouvrir la feuille d'un objet.
 *
 * @param {string}   titre    ce qu'on regarde
 * @param {string}   quoi     la ligne de situation, sous le titre
 * @param {string}   ancrage  `semaine`, `classe`, `periode`, `eleve`
 * @param {object}   objet    la chose regardée — elle filtre les gestes proposés
 * @param {Function} lancer   `(geste, precision) => void`
 * @param {string}   invite   le texte de suggestion du champ libre
 */
export function ouvrirPorte({ titre, quoi = '', ancrage, objet, lancer, invite = '' }) {
  $('porteTitre').textContent = titre;
  $('porteQuoi').textContent = quoi;
  $('porteQuoi').hidden = !quoi;
  $('portePrecision').value = '';
  $('portePrecision').placeholder = invite
    || 'par exemple : ils bloquent sur l\'accord du participe passé';

  const zone = $('porteGestes');
  zone.textContent = '';

  for (const g of ici(ancrage, objet)) {
    const b = el('button', 'geste');
    b.type = 'button';
    b.append(el('b', null, g.nom));
    b.append(el('small', 'lit', `lit : ${g.lit}`));
    /*
     * CE QU'IL NE FERA JAMAIS, SUR LE BOUTON — pas dans une aide qu'on ouvre.
     * C'est la seule place où quelqu'un le lira, et c'est ce qui distingue un outil
     * d'aide d'un outil qui décide.
     */
    b.append(el('small', 'jamais', `ne fera jamais : ${g.jamais}`));

    /*
     * ── UN GESTE QUI A BESOIN D'UNE INFORMATION QU'ON N'A PAS ──────────────
     *
     * « Un mot aux familles » sans savoir ce qu'il doit annoncer produirait un mot
     * entièrement inventé, avec des dates plausibles — et ce mot-là partirait dans
     * vingt-six cahiers. Le bouton attend, et il dit ce qu'il attend.
     */
    if (g.exige) {
      const dit = el('small', 'exige', `à écrire d'abord : ${g.exige}`);
      b.append(dit);
      const majDispo = () => { b.disabled = !$('portePrecision').value.trim(); };
      majDispo();
      $('portePrecision').addEventListener('input', majDispo);
    }

    b.onclick = () => {
      $('porte').close();
      lancer(g, $('portePrecision').value || '');
    };
    zone.append(b);
  }

  $('porte').showModal();
}

export default { ouvrirPorte };
