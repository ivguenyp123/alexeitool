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
import { nu, enMorceaux } from '../lib/miseenforme.js';
import { documentDeCorrection } from '../lib/document.js';

const $ = (id) => document.getElementById(id);

/** Ce que l'écran de sortie sait de ce qu'il affiche. Rempli au moment de l'envoi. */
let courant = { nomDuGeste: '', exercice: '', modele: '', copies: 0,
                sansCopie: 0, sansReference: false, pile: null, classe: null, brut: '' };

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

/**
 * Les blocs du document.
 *
 * Quand la réponse porte des corrections dans la forme attendue ET qu'on a la pile sous
 * la main, on rend LES COPIES CORRIGÉES. Sinon on rend la prose telle quelle : un outil
 * qui sort une page blanche parce qu'un analyseur n'a pas reconnu son entrée est un outil
 * qu'on n'ouvre plus.
 */
const leDocument = () => documentDeCorrection(
  // Le brut d'abord : il porte les numéros, et c'est eux qui rattachent une correction à
  // une copie. L'écran est le repli quand on n'a pas le brut.
  courant.brut || $('sortieTexte').textContent || '',
  courant.pile, courant.classe,
  { ...courant, quand: leJour() }
);

const lesBlocs = () => leDocument().blocs;

/**
 * ── L'ÉCRAN DOIT DIRE SI LE ROUGE A PU ÊTRE POSÉ ────────────────────────────
 *
 * Constaté sur la première vraie dictée : le modèle a répondu autrement que demandé, les
 * corrections n'ont pas pu être reposées sur les copies, et l'export est sorti sans une
 * seule marque. Rien à l'écran ne le disait. On cherche le rouge dans le document, on ne
 * le trouve pas, et on ne sait pas si c'est l'outil, le modèle ou soi.
 *
 * Le silence est le pire des trois états. Alors on compte, et on le dit.
 */
export function diagnostic() {
  if (!courant.pile?.copies?.length) return '';
  const d = leDocument();
  if (!d.surLaCopie) {
    return 'Les corrections n\'ont pas pu être posées sur les copies : la réponse n\'a pas '
      + 'la forme attendue. Le document reprendra le texte tel quel. Relance — ou dépose '
      + 'le texte attendu, qui aide beaucoup.';
  }
  const bouts = [`${d.copies} copie(s) corrigée(s) en rouge dans le document.`];
  if (d.introuvables) {
    bouts.push(`${d.introuvables} correction(s) n'ont pas été posées : le mot signalé ne `
      + 'se trouve pas dans la copie. Elles sont listées dans le document.');
  }
  return bouts.join(' ');
}

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
 * ── L'IMAGE DOIT PORTER LE ROUGE, ELLE AUSSI ────────────────────────────────
 *
 * La première version mesurait et dessinait le TEXTE NU d'un bloc. Simple — et le rouge,
 * les ratures, le gras disparaissaient : l'image rendait une copie propre là où le Word
 * rendait une copie corrigée. Or c'est précisément le rouge qu'on veut envoyer.
 *
 * On découpe donc en jetons qui portent chacun leur style, et on remplit les lignes
 * jeton à jeton.
 */
function jetons(bloc) {
  const out = [];
  for (const m of bloc.morceaux || []) {
    // On coupe sur les espaces en les GARDANT : « dor dort » perdrait sa séparation, et
    // deux mots corrigés se colleraient.
    for (const bout of String(m.texte).split(/(\s+)/)) {
      if (bout === '') continue;
      out.push({ texte: bout, rouge: m.rouge, barre: m.barre,
                 gras: m.gras || bloc.type === 'titre', taille: m.taille });
    }
  }
  return out;
}

const CORPS = 20;
const POLICE = (bloc, jeton = {}) => {
  if (bloc.type === 'titre') {
    const t = { 1: 40, 2: 30, 3: 26, 4: 24 }[bloc.niveau] || 26;
    return { taille: t, police: `700 ${t}px Georgia, serif`, haut: t * 1.35, avant: t * 0.7 };
  }
  // `taille` est en demi-points chez Word ; ici en pixels. On la ramène à l'échelle.
  const t = jeton.taille ? Math.round(jeton.taille * 1.1) : CORPS;
  return { taille: t, police: `${jeton.gras ? '700 ' : ''}${t}px Georgia, serif`,
           haut: 30, avant: 0 };
};

/** Remplir les lignes, jeton à jeton, sans jamais couper un mot en deux. */
function enLignes(ctx, bloc, large) {
  const lignes = [];
  let ligne = [];
  let x = 0;
  for (const j of jetons(bloc)) {
    ctx.font = POLICE(bloc, j).police;
    const l = ctx.measureText(j.texte).width;
    if (x + l > large && ligne.length && j.texte.trim()) {
      lignes.push(ligne);
      ligne = [];
      x = 0;
    }
    // Un blanc en début de ligne ne sert à rien et décale tout le paragraphe.
    if (!ligne.length && !j.texte.trim()) continue;
    ligne.push({ ...j, large: l });
    x += l;
  }
  if (ligne.length) lignes.push(ligne);
  return lignes.length ? lignes : [[]];
}

const ROUGE = '#C00000';
const GRIS = '#8B857C';
const ACCENT = '#1B6B8C';

/**
 * ── LE TABLEAU, EN COLONNES SUR L'IMAGE AUSSI ───────────────────────────────
 *
 * Une fiche de double niveau se lit côte à côte : ce que fait le CE2 pendant que le CM1
 * travaille seul. Empilée, elle perd exactement ce qui la rend utile.
 *
 * Chaque cellule est découpée à la largeur de sa colonne, et la rangée prend la hauteur
 * de la cellule la plus haute — sinon les colonnes se chevauchent dès qu'une consigne
 * est plus longue que l'autre.
 */
function planDuTableau(ctx, bloc, large) {
  const rangs = bloc.rangs || [];
  const nbCol = Math.max(1, ...rangs.map((r) => r.length));
  const GOUTTIERE = 16;
  const colonne = Math.floor((large - GOUTTIERE * (nbCol - 1)) / nbCol);

  const plan = rangs.map((rang, iRang) => {
    const cells = Array.from({ length: nbCol }, (_, i) => {
      const lignes = [];
      for (const texte of rang[i] || []) {
        /*
         * Le gras `**ainsi**` est traité ICI aussi. Il ne l'était que côté Word : l'image
         * affichait « **Objectif** » avec ses astérisques, au milieu d'une fiche par
         * ailleurs propre.
         */
        const morceaux = enMorceaux(texte)
          .map((m) => ({ ...m, gras: m.gras || iRang === 0 }));
        lignes.push(...enLignes(ctx, { type: 'paragraphe', morceaux }, colonne));
      }
      return lignes;
    });
    const haut = Math.max(1, ...cells.map((c) => c.length)) * 28 + 14;
    return { cells, haut, entete: iRang === 0 };
  });
  return { plan, colonne, gouttiere: GOUTTIERE,
           hauteur: plan.reduce((s, r) => s + r.haut, 0) + 10 };
}

function dessiner(blocs) {
  const mesure = document.createElement('canvas').getContext('2d');

  // Deux passes : une pour mesurer la hauteur totale, une pour peindre. Un canvas se
  // redimensionne en s'effaçant : on ne peut pas grandir en cours de route.
  const plan = [];
  let hauteur = MARGE;
  for (const b of blocs) {
    if (b.type === 'blanc') { hauteur += 14; plan.push({ bloc: b, lignes: [] }); continue; }
    if (b.type === 'tableau') {
      const t = planDuTableau(mesure, b, LARGEUR - MARGE * 2);
      hauteur += t.hauteur + 12;
      plan.push({ bloc: b, lignes: [], tableau: t });
      continue;
    }
    const { haut, avant } = POLICE(b);
    const retrait = (b.type === 'puce' ? 28 + (b.niveau || 0) * 24 : 0) + (b.copie ? 22 : 0);
    const lignes = enLignes(mesure, b, LARGEUR - MARGE * 2 - retrait);
    hauteur += avant + lignes.length * haut + (b.mot ? 22 : 6);
    plan.push({ bloc: b, lignes, haut, retrait });
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

    if (p.tableau) {
      const { plan: rangs, colonne, gouttiere } = p.tableau;
      for (const rang of rangs) {
        // Le filet horizontal sous chaque rangée : sans lui, deux colonnes de longueurs
        // différentes n'ont plus de ligne de lecture commune.
        ctx.strokeStyle = '#E2DED5';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MARGE, y - 6);
        ctx.lineTo(LARGEUR - MARGE, y - 6);
        ctx.stroke();

        rang.cells.forEach((lignes, i) => {
          let yc = y;
          const x0 = MARGE + i * (colonne + gouttiere);
          for (const ligne of lignes) {
            let x = x0;
            for (const j of ligne) {
              ctx.font = POLICE({ type: 'paragraphe' }, j).police;
              ctx.fillStyle = rang.entete ? ACCENT : '#22201C';
              ctx.fillText(j.texte, x, yc);
              x += j.large;
            }
            yc += 28;
          }
        });
        y += rang.haut;
      }
      y += 12;
      continue;
    }

    y += POLICE(p.bloc).avant;
    const haut0 = y;

    if (p.bloc.type === 'puce') {
      ctx.font = POLICE(p.bloc, {}).police;
      ctx.fillStyle = p.bloc.alerte ? ROUGE : '#22201C';
      ctx.fillText('—', MARGE + p.retrait - 24, y);
    }

    for (const ligne of p.lignes) {
      let x = MARGE + p.retrait;
      for (const j of ligne) {
        const { police, taille } = POLICE(p.bloc, j);
        ctx.font = police;
        ctx.fillStyle = j.rouge || p.bloc.alerte ? ROUGE
          : p.bloc.type === 'titre' ? ACCENT
          : p.bloc.discret ? GRIS : '#22201C';
        ctx.fillText(j.texte, x, y);
        // La rature : c'est l'autre geste du stylo rouge, et sans elle le mot fautif et
        // le mot correct se lisent comme deux mots de la phrase.
        if (j.barre) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = Math.max(1, taille / 14);
          ctx.beginPath();
          ctx.moveTo(x, y + taille * 0.58);
          ctx.lineTo(x + j.large, y + taille * 0.58);
          ctx.stroke();
        }
        x += j.large;
      }
      y += p.haut;
    }

    /*
     * LA COPIE DE L'ÉLÈVE porte un filet à gauche : posée à côté des vraies copies, elle
     * doit se distinguer d'un coup d'œil de ce qu'on écrit à son sujet.
     */
    if (p.bloc.copie || p.bloc.mot) {
      ctx.strokeStyle = '#C9C3B7';
      ctx.lineWidth = p.bloc.copie ? 3 : 1;
      if (p.bloc.copie) {
        ctx.beginPath();
        ctx.moveTo(MARGE + 6, haut0 - 4);
        ctx.lineTo(MARGE + 6, y);
        ctx.stroke();
      } else {
        ctx.strokeRect(MARGE - 8, haut0 - 8, LARGEUR - MARGE * 2 + 16, y - haut0 + 16);
      }
    }
    y += p.bloc.mot ? 22 : 6;
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
