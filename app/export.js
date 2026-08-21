/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  SORTIR LA CORRECTION DE L'ÉCRAN
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Une correction qu'on ne peut que lire dans une fenêtre ne sert qu'à moitié : elle
 * s'imprime, elle se pose à côté des copies, elle s'envoie à un collègue, elle se garde.
 *
 * Deux formats, parce que les deux usages existent :
 *   · WORD  pour l'imprimer et le retoucher — c'est le format de l'école ;
 *   · IMAGE pour l'envoyer d'un téléphone, ou la poser à côté de soi sans imprimante.
 *
 * ── CE QUI SORT PORTE SES RÉSERVES ──────────────────────────────────────────
 *
 * Dès qu'un document quitte l'outil, il cesse d'être « ce que la machine a proposé » pour
 * devenir « la correction ». Dans six mois personne ne saura d'où viennent ces phrases.
 * L'en-tête le dit donc à chaque fois — le modèle, la date, et surtout les réserves : le
 * texte attendu manquait, tant d'élèves n'avaient pas de copie.
 *
 * ── ET IL PORTE LES VRAIS PRÉNOMS ───────────────────────────────────────────
 *
 * Ce qui est exporté est le texte APRÈS restitution. C'est voulu : ce document est celui
 * de l'enseignant, il reste sur sa machine, et une correction où les enfants portent des
 * numéros ne lui sert à rien. Ce sont les numéros qui partent au fournisseur, pas
 * l'inverse.
 */
import { docx } from '../lib/docx.js';
import { enBlocs, enTete, nu } from '../lib/miseenforme.js';

const $ = (id) => document.getElementById(id);

/** Ce que l'écran de sortie sait de ce qu'il affiche. Rempli au moment de l'envoi. */
let courant = { nomDuGeste: '', exercice: '', modele: '', copies: 0,
                sansCopie: 0, sansReference: false };

export function noterCeQuOnExporte(infos) { courant = { ...courant, ...infos }; }

const leJour = () => new Date().toLocaleDateString('fr-FR',
  { day: 'numeric', month: 'long', year: 'numeric' });

/** Un nom de fichier tenable : sans accent, sans espace, sans surprise. */
function nomDeFichier(ext) {
  const base = (courant.exercice || courant.nomDuGeste || 'correction')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const jour = new Date().toISOString().slice(0, 10);
  return `${base || 'correction'}-${jour}.${ext}`;
}

const lesBlocs = () => [
  ...enTete({ ...courant, quand: leJour() }),
  ...enBlocs($('sortieTexte').textContent || '')
];

/**
 * Proposer un fichier au téléchargement.
 *
 * Le lien est créé, cliqué et détruit dans la foulée. L'URL objet est libérée : sans ça,
 * exporter vingt fois dans la soirée garde vingt fichiers en mémoire.
 */
function offrir(donnees, nom, type) {
  const url = URL.createObjectURL(new Blob([donnees], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ── L'IMAGE ───────────────────────────────────────────────────────────────── */

const LARGEUR = 1000;
const MARGE = 56;

/**
 * Couper une ligne à la largeur disponible.
 *
 * Mot à mot, et un mot plus long que la ligne est laissé tel quel plutôt que coupé au
 * milieu : une adresse ou un mot composé cassé en deux est illisible, un débordement se
 * voit et se comprend.
 */
function couper(ctx, texte, large) {
  const lignes = [];
  let ligne = '';
  for (const mot of String(texte).split(/\s+/)) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width <= large || !ligne) ligne = essai;
    else { lignes.push(ligne); ligne = mot; }
  }
  if (ligne) lignes.push(ligne);
  return lignes.length ? lignes : [''];
}

const POLICE = (bloc) => {
  if (bloc.type === 'titre') {
    const t = { 1: 40, 2: 30, 3: 26, 4: 24 }[bloc.niveau] || 26;
    return { police: `700 ${t}px Georgia, serif`, haut: t * 1.35, avant: t * 0.7 };
  }
  return { police: '20px Georgia, serif', haut: 30, avant: 0 };
};

function dessiner(blocs) {
  const mesure = document.createElement('canvas').getContext('2d');

  // Deux passes : une pour mesurer la hauteur totale, une pour peindre. Un canvas se
  // redimensionne en s'effaçant, on ne peut donc pas grandir en cours de route.
  const plan = [];
  let hauteur = MARGE;
  for (const b of blocs) {
    if (b.type === 'blanc') { hauteur += 14; plan.push({ bloc: b, lignes: [] }); continue; }
    const { police, haut, avant } = POLICE(b);
    mesure.font = police;
    const retrait = b.type === 'puce' ? 28 + (b.niveau || 0) * 24 : 0;
    const lignes = couper(mesure, nu(b), LARGEUR - MARGE * 2 - retrait);
    hauteur += avant + lignes.length * haut + 6;
    plan.push({ bloc: b, lignes, haut, police, retrait });
  }
  hauteur += MARGE;

  const c = document.createElement('canvas');
  c.width = LARGEUR;
  c.height = Math.ceil(hauteur);
  const ctx = c.getContext('2d');
  // Fond blanc : une image destinée à être imprimée ou envoyée n'a pas de thème sombre,
  // et un PNG transparent devient noir sur noir dans la moitié des messageries.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.textBaseline = 'top';

  let y = MARGE;
  for (const p of plan) {
    if (p.bloc.type === 'blanc') { y += 14; continue; }
    ctx.font = p.police;
    ctx.fillStyle = p.bloc.type === 'titre' ? '#1B6B8C' : '#22201C';
    y += POLICE(p.bloc).avant;
    if (p.bloc.type === 'puce') {
      ctx.fillText('—', MARGE + p.retrait - 24, y);
    }
    for (const l of p.lignes) {
      ctx.fillText(l, MARGE + p.retrait, y);
      y += p.haut;
    }
    y += 6;
  }
  return c;
}

/* ── Le branchement ────────────────────────────────────────────────────────── */

export function installerLExport() {
  const dispo = () => {
    const rien = !($('sortieTexte').textContent || '').trim();
    for (const id of ['sortieWord', 'sortieImage']) $(id).disabled = rien;
  };
  // La sortie se remplit après la réponse : on suit ses changements plutôt que de
  // deviner quand elle est prête.
  new MutationObserver(dispo).observe($('sortieTexte'),
    { childList: true, characterData: true, subtree: true });
  dispo();

  $('sortieWord').onclick = () => {
    offrir(docx(lesBlocs()), nomDeFichier('docx'),
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  };

  $('sortieImage').onclick = () => {
    dessiner(lesBlocs()).toBlob((b) => {
      if (!b) return;
      offrir(b, nomDeFichier('png'), 'image/png');
    }, 'image/png');
  };
}

export default { installerLExport, noterCeQuOnExporte };
