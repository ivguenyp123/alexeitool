/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  L'ÉCRAN DE LA LISTE DE CLASSE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * C'est le seul écran obligatoire de l'outil, et il n'a qu'un champ.
 *
 * ── POURQUOI IL EXISTE ──────────────────────────────────────────────────────
 *
 * L'outil s'ouvrait sur une classe d'exemple : vingt-six prénoms inventés, pour que
 * l'écran ne soit pas vide. Un enseignant a déposé quatre vraies copies ; elles ont été
 * rattachées à quatre de ces enfants-là, et la correction est revenue en parlant d'un
 * enfant qui n'existe pas, à qui elle attribuait un exercice réussi.
 *
 * Une donnée d'exemple qui ressemble à une vraie donnée cesse de s'en distinguer dès
 * qu'on travaille pour de bon.
 *
 * ── ET SANS LISTE, RIEN N'EST MASQUÉ ────────────────────────────────────────
 *
 * Le caviardage remplace les prénoms QU'IL CONNAÎT. Pas de liste, pas de remplacement :
 * les copies partent avec les prénoms des enfants écrits dedans. C'est pour ça que cet
 * écran s'ouvre tout seul au premier lancement.
 */
import { lireLaListe, cequiManque, ecrireLaListe } from '../lib/liste.js';

const $ = (id) => document.getElementById(id);

export function installerLaClasse({ etat, sauver, apres = () => {} }) {
  const relire = () => {
    const { eleves, ecartees, doublons } = lireLaListe($('champListe').value);
    const q = cequiManque(eleves);

    const dit = [];
    if (!eleves.length) dit.push('Aucun élève pour l\'instant.');
    else dit.push(`${eleves.length} élève${eleves.length > 1 ? 's' : ''}`
      + ` — CE2 ${eleves.filter((e) => e.niveau === 'CE2').length}`
      + ` · CM1 ${eleves.filter((e) => e.niveau === 'CM1').length}`
      + `${q.sansNiveau.length ? ` · ${q.sansNiveau.length} sans niveau` : ''}.`);

    /*
     * Le niveau manquant est dit, pas corrigé. Répartir les enfants entre CE2 et CM1
     * pour que le compte tombe juste produirait des attendus servis au mauvais cycle —
     * et ça ne se verrait pas.
     */
    if (q.sansNiveau.length) {
      dit.push(`Sans CE2 ou CM1 sur leur ligne : ${q.sansNiveau.slice(0, 8)
        .map((e) => e.prenom).join(', ')}${q.sansNiveau.length > 8 ? '…' : ''}. `
        + 'Ajoute-le à la fin de la ligne — l\'outil ne devinera pas.');
    }
    // Deux enfants du même prénom : leurs copies ne se rattacheront pas toutes seules.
    // Mieux vaut le savoir maintenant qu'au vingt-troisième dépôt.
    if (doublons.length) {
      dit.push(`Deux élèves portent le même prénom (${doublons
        .map((d) => d.prenom).join(', ')}) : leurs copies devront être rattachées à la main.`);
    }
    $('listeEtat').textContent = dit.join(' ');

    $('listeEcartees').hidden = !ecartees.length;
    if (ecartees.length) {
      $('listeEcartees').textContent = `${ecartees.length} ligne(s) écartée(s) :\n`
        + ecartees.slice(0, 8).map((x) => `  ${x.ligne} — ${x.pourquoi}`).join('\n');
    }
    return eleves;
  };

  $('champListe').oninput = relire;

  $('listeValider').onclick = () => {
    etat.classe = relire();
    sauver();
    $('listeClasse').close();
    apres();
  };

  $('listeAnnuler').onclick = () => $('listeClasse').close();

  $('listeVider').onclick = () => {
    if (!confirm('Effacer toute la liste de classe ?')) return;
    $('champListe').value = '';
    relire();
  };

  const ouvrir = () => {
    $('champListe').value = ecrireLaListe(etat.classe || []);
    relire();
    $('listeClasse').showModal();
  };

  $('pileSaisirClasse').onclick = () => { $('pile').close(); ouvrir(); };
  return { ouvrir };
}

export default { installerLaClasse };
