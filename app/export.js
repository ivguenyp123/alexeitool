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
import { docx, cellule } from '../lib/docx.js';
import { nu, enMorceaux } from '../lib/miseenforme.js';
import { documentDeCorrection } from '../lib/document.js';

const $ = (id) => document.getElementById(id);

/** Ce que l'écran de sortie sait de ce qu'il affiche. Rempli au moment de l'envoi. */
let courant = { nomDuGeste: '', exercice: '', modele: '', copies: 0,
                sansCopie: 0, sansReference: false, pile: null, classe: null, brut: '' };

export function noterCeQuOnExporte(infos) { courant = { ...courant, ...infos }; }

const leJour = () => new Date().toLocaleDateString('fr-FR',
  { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Un nom de fichier tenable : sans accent, sans espace, sans surprise.
 *
 * Les ligatures ne se décomposent PAS en NFD : « cœur » sortait « c-ur ». Elles sont donc
 * traitées à part, avant tout le reste.
 */
const LIGATURES = [[/œ/g, 'oe'], [/Œ/g, 'OE'], [/æ/g, 'ae'], [/Æ/g, 'AE']];
export function enNomDeFichier(texte, defaut = 'fiche') {
  let t = String(texte || '');
  for (const [de, a] of LIGATURES) t = t.replace(de, a);
  const base = t.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return base || defaut;
}

function nomDeFichier(ext) {
  const base = enNomDeFichier(courant.exercice || courant.nomDuGeste, 'correction');
  const jour = new Date().toISOString().slice(0, 10);
  return `${base}-${jour}.${ext}`;
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
    // On coupe sur les espaces ORDINAIRES seulement : l'espace insécable est là pour
    // tenir « 26 − 16 » sur une seule ligne, et Word en fait autant.
    for (const bout of String(m.texte).split(/( +)/)) {
      if (bout === '') continue;
      out.push({ texte: bout, rouge: m.rouge, barre: m.barre, souligne: m.souligne,
                 couleur: m.couleur || bloc.couleur,
                 gras: m.gras || bloc.gras || bloc.type === 'titre',
                 taille: m.taille || bloc.taille });
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
  /*
   * ── LA GOUTTIÈRE SE RESSERRE QUAND LA GRILLE EST DENSE ────────────────────
   *
   * Seize pixels entre deux colonnes, c'est juste sur une fiche de séance et c'est
   * ruineux sur un coloriage à quatorze colonnes : deux cents pixels s'en vont en vide
   * et « 26 − 16 » se coupe en deux lignes. Une case qui déborde rend la grille bancale.
   */
  const GOUTTIERE = nbCol > 8 ? 6 : 16;
  const colonne = Math.floor((large - GOUTTIERE * (nbCol - 1)) / nbCol);

  const plan = rangs.map((rang, iRang) => {
    const cells = Array.from({ length: nbCol }, (_, i) => {
      // Une cellule peut porter une couleur, un fond, une taille — cf. `cellule()`.
      const c = cellule(rang[i]);
      const lignes = [];
      for (const texte of c.lignes) {
        /*
         * Le gras `**ainsi**` est traité ICI aussi. Il ne l'était que côté Word : l'image
         * affichait « **Objectif** » avec ses astérisques, au milieu d'une fiche par
         * ailleurs propre.
         */
        const entete = iRang === 0 && !bloc.cartes && bloc.entete !== false;
        const morceaux = enMorceaux(texte).map((m) => ({
          ...m,
          gras: m.gras || c.gras || entete,
          couleur: m.couleur || c.couleur,
          taille: m.taille || c.taille || bloc.taille
        }));
        lignes.push(...enLignes(ctx, { type: 'paragraphe', morceaux }, colonne));
      }
      return { lignes, fond: c.fond,
               centre: c.centre !== undefined ? c.centre : (bloc.centre || bloc.cartes) };
    });
    const haut = Math.max(1, ...cells.map((c) => c.lignes.length)) * 28
      + (bloc.cartes ? 40 : 14);
    // Pas d'en-tête sur une planche de cartes ni sur une grille : ce sont des cases
    // égales, et une première rangée en gras bleu les fait passer pour des titres.
    return { cells, haut, entete: iRang === 0 && !bloc.cartes && bloc.entete !== false };
  });
  return { plan, colonne, gouttiere: GOUTTIERE,
           hauteur: plan.reduce((s, r) => s + r.haut, 0) + 10 };
}

/** Un rectangle à coins ronds, avec le repli des navigateurs qui n'ont pas `roundRect`. */
function pave(ctx, x, y, l, h, r = 8) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, l, h, r);
  else ctx.rect(x, y, l, h);
  ctx.fill();
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
      const nbCol = Math.max(1, ...rangs.map((r) => r.cells.length));
      const haut0 = y;
      const bas = rangs.reduce((t, r) => t + r.haut, 0);
      const gauche = MARGE - gouttiere / 2;
      const droite = Math.min(LARGEUR - MARGE + gouttiere / 2,
                              gauche + nbCol * (colonne + gouttiere));

      /*
       * ── TROIS PASSES, ET L'ORDRE COMPTE ───────────────────────────────
       *
       * Les fonds d'abord, la grille ensuite, le texte en dernier. Peint dans un autre
       * ordre, l'aplat d'une case recouvre le filet de sa voisine et la grille sort
       * trouée — ou le fond efface le calcul qu'il est censé porter.
       */
      let yf = y;
      for (const rang of rangs) {
        rang.cells.forEach((cell, i) => {
          if (!cell.fond) return;
          ctx.fillStyle = `#${cell.fond}`;
          pave(ctx, MARGE + i * (colonne + gouttiere) - gouttiere / 2 + 1, yf - 5,
               colonne + gouttiere - 2, rang.haut - 2, p.bloc.cartes ? 10 : 3);
        });
        yf += rang.haut;
      }

      /*
       * LA GRILLE EN ENTIER, TRAITS VERTICAUX COMPRIS. Le Word les traçait, l'image non :
       * un coloriage magique sans séparation entre les cases est une page de calculs, pas
       * un coloriage — l'enfant ne sait pas quelle surface colorier.
       */
      if (!p.bloc.sansBordure) {
        ctx.strokeStyle = p.bloc.bordure ? `#${p.bloc.bordure}`
          : p.bloc.decouper ? '#9A9A9A' : '#E2DED5';
        ctx.lineWidth = 1;
        if (p.bloc.decouper) ctx.setLineDash([5, 4]); else ctx.setLineDash([]);
        for (let i = 0; i <= nbCol; i++) {
          const x = Math.min(droite, gauche + i * (colonne + gouttiere));
          ctx.beginPath();
          ctx.moveTo(x, haut0 - 6);
          ctx.lineTo(x, haut0 + bas - 6);
          ctx.stroke();
        }
        // Le trait du bas compris : sans lui la dernière rangée n'a pas de bord, et on
        // découpe onze cartes proprement pour laisser à la douzième un bout de page.
        let yl = haut0;
        for (let k = 0; k <= rangs.length; k++) {
          ctx.beginPath();
          ctx.moveTo(gauche, yl - 6);
          ctx.lineTo(droite, yl - 6);
          ctx.stroke();
          yl += rangs[k]?.haut || 0;
        }
        ctx.setLineDash([]);
      }

      for (const rang of rangs) {
        rang.cells.forEach((cell, i) => {
          const x0 = MARGE + i * (colonne + gouttiere);
          let yc = y + (p.bloc.cartes ? 12 : 0);
          for (const ligne of cell.lignes) {
            const largeurLigne = ligne.reduce((t, j) => t + j.large, 0);
            let x = cell.centre ? x0 + Math.max(0, (colonne - largeurLigne) / 2) : x0;
            for (const j of ligne) {
              ctx.font = POLICE({ type: 'paragraphe' }, j).police;
              ctx.fillStyle = j.couleur ? `#${j.couleur}` : rang.entete ? ACCENT : '#22201C';
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

    /*
     * LE BANDEAU DE COULEUR se peint avant le texte, sur toute la largeur utile. C'est ce
     * qui fait qu'une fiche se reconnaît dans une pile sans qu'on la lise.
     */
    if (p.bloc.fond) {
      ctx.fillStyle = `#${p.bloc.fond}`;
      pave(ctx, MARGE - 14, y - 10, LARGEUR - MARGE * 2 + 28,
           p.lignes.length * p.haut + 20, 10);
    }

    if (p.bloc.type === 'puce') {
      ctx.font = POLICE(p.bloc, {}).police;
      ctx.fillStyle = p.bloc.alerte ? ROUGE : '#22201C';
      ctx.fillText('—', MARGE + p.retrait - 24, y);
    }

    for (const ligne of p.lignes) {
      const largeurLigne = ligne.reduce((t, j) => t + j.large, 0);
      let x = MARGE + p.retrait + (p.bloc.centre
        ? Math.max(0, (LARGEUR - MARGE * 2 - p.retrait - largeurLigne) / 2) : 0);
      for (const j of ligne) {
        const { police, taille } = POLICE(p.bloc, j);
        ctx.font = police;
        ctx.fillStyle = j.couleur ? `#${j.couleur}`
          : j.rouge || p.bloc.alerte ? ROUGE
          : p.bloc.type === 'titre' ? ACCENT
          : p.bloc.discret ? GRIS : '#22201C';
        ctx.fillText(j.texte, x, y);
        // La rature : c'est l'autre geste du stylo rouge, et sans elle le mot fautif et
        // le mot correct se lisent comme deux mots de la phrase.
        if (j.barre || j.souligne) {
          // Barré : le mot est faux et le bon est à côté. Souligné : le mot est faux, et
          // c'est à l'élève de trouver. Deux gestes différents, deux traits différents.
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = Math.max(1, taille / 14);
          const hauteurTrait = j.barre ? taille * 0.58 : taille * 1.08;
          ctx.beginPath();
          ctx.moveTo(x, y + hauteurTrait);
          ctx.lineTo(x + j.large, y + hauteurTrait);
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

/**
 * ── EXPORTER DES BLOCS DÉJÀ MIS EN PAGE ─────────────────────────────────────
 *
 * Les fiches d'exercices et le matériel ne passent pas par l'écran de réponse : ils sont
 * construits en code, blocs par blocs, et n'ont aucune raison de faire l'aller-retour par
 * du texte. Ce chemin-là les prend tels quels.
 *
 * @param {string} quoi  'word' | 'image'
 */
export function exporterBlocs(blocs, nom, quoi = 'word') {
  const fichier = `${enNomDeFichier(nom)}-${new Date().toISOString().slice(0, 10)}`;

  if (quoi === 'image') {
    dessiner(blocs).toBlob((b) => b && offrir(b, `${fichier}.png`, 'image/png'), 'image/png');
    return;
  }
  offrir(docx(blocs), `${fichier}.docx`,
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

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
