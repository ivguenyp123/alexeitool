/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LES DEUX ÉCRANS QUI FABRIQUENT DU PAPIER
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * MATÉRIEL — les objets de classe : tables en affiche, cartes à découper, bandes
 * numériques, tableaux de conversion, listes de mots de l'année, programme de poésies.
 * On choisit, on imprime.
 *
 * EXERCICES — une phrase, une fiche. « je veux une évaluation des tables de 5 » et il
 * sort DEUX documents : la fiche pour les enfants, vide, et le corrigé, à part.
 *
 * ── POURQUOI DEUX BOUTONS D'EXPORT ET PAS UN ────────────────────────────────
 *
 * Parce que le corrigé ne doit jamais partir avec la fiche. Deux boutons séparés, deux
 * fichiers séparés, deux noms de fichier différents : à aucun moment on ne peut envoyer
 * l'un en croyant envoyer l'autre.
 */
import { parFamille, DEMANDES, consigneDe, lireLesItems, planche, FORMATS }
  from '../lib/materiel.js';
import { laFamille, pastel } from '../lib/couleurs.js';
import { MOTIFS } from '../lib/dessins.js';
import { fabriquer, lireLesExercices, ficheEleve, corrige, CONSIGNE_MODELE }
  from '../lib/exercices.js';
import { blocsDeFiche, blocsDeCorrige, aucuneReponse } from '../lib/fiche.js';
import { pied, titre as titreBloc } from '../lib/miseenforme.js';
import { exporterBlocs } from './export.js';
import { envoyer } from './envoi.js';

const $ = (id) => document.getElementById(id);
const el = (t, c, x) => {
  const n = document.createElement(t);
  if (c) n.className = c;
  if (x !== undefined) n.textContent = x;
  return n;
};

const leJour = () => new Date().toLocaleDateString('fr-FR',
  { day: 'numeric', month: 'long', year: 'numeric' });

/* ══════════════════════════════════════════════════════════════════════════
   LE MATÉRIEL
   ══════════════════════════════════════════════════════════════════════════ */

export function installerLeMateriel({ etat }) {
  const niveau = () => $('materielNiveau').value || 'CE2';

  function rendre() {
    const zone = $('materielListe');
    zone.textContent = '';

    /*
     * ── GROUPÉES PAR FAMILLE, ET FILTRABLES ───────────────────────────────
     *
     * Trente fiches en vrac, c'est exactement le catalogue que le reste de l'outil
     * refuse : une grille qu'on fait défiler est une machine à ne pas trouver. Ici on
     * cherche du matériel — c'est un magasin de fournitures, pas un routage par
     * intention — mais ça ne dispense pas de le ranger.
     */
    const filtre = ($('materielCherche').value || '').toLowerCase().trim();
    let montrees = 0;

    for (const famille of parFamille()) {
      const fiches = famille.fiches.filter((f) => !filtre
        || `${f.nom} ${f.pour} ${f.mots.join(' ')}`.toLowerCase().includes(filtre));
      if (!fiches.length) continue;
      const t = laFamille(famille.nom);
      const titre = el('h3', 'famille', `${t.emoji}  ${famille.nom} — ${fiches.length}`);
      // La couleur de l'écran est CELLE DU BANDEAU IMPRIMÉ. Chercher « la bleue » à
      // l'écran et la retrouver bleue dans la pile, c'est tout l'intérêt.
      titre.style.color = `#${t.trait}`;
      titre.style.background = `#${t.fond}`;
      zone.append(titre);
      for (const f of fiches) {
      montrees += 1;
      const carte = el('div', 'fabrique');
      carte.style.borderLeft = `4px solid #${t.trait}`;
      carte.append(el('b', null, `${f.emoji || t.emoji}  ${f.nom}`));
      carte.append(el('small', 'lit', f.pour));

      /*
       * Les options sont RÉDUITES à ce qui change vraiment d'une impression à l'autre.
       * Un formulaire de huit champs devant une fiche de tables, personne ne le remplit.
       */
      const reglages = el('div', 'reglages-fabrique');
      const champs = {};
      for (const [cle, def] of Object.entries(OPTIONS[f.id] || {})) {
        const lab = el('label', null, def.nom);
        // Un choix fermé se fait dans un menu, pas dans un champ libre : personne ne
        // devine qu'il faut taper « sapin ».
        const inp = def.choix ? el('select') : el('input');
        if (def.choix) {
          for (const c of def.choix) {
            const o = el('option', null, c.nom);
            o.value = c.valeur;
            inp.append(o);
          }
        } else {
          inp.type = def.type || 'text';
          if (def.min !== undefined) inp.min = def.min;
          if (def.max !== undefined) inp.max = def.max;
        }
        inp.value = def.valeur;
        lab.append(inp);
        reglages.append(lab);
        champs[cle] = inp;
      }
      if (reglages.children.length) carte.append(reglages);

      const lire = () => {
        // La liste de classe suit : les étiquettes au nom des élèves en ont besoin, et
        // elle est fabriquée ICI, hors ligne — rien ne part nulle part.
        const o = { niveau: niveau(), classe: etat.classe || [] };
        for (const [cle, inp] of Object.entries(champs)) {
          const def = OPTIONS[f.id][cle];
          o[cle] = def.liste
            ? inp.value.split(/[^0-9]+/).filter(Boolean).map(Number)
            : def.type === 'number' ? Number(inp.value)
            : def.booleen ? inp.value === 'oui'
            : inp.value;
        }
        return o;
      };

      const boutons = el('div', 'boutons');
      for (const [quoi, nom] of [['word', 'Word'], ['image', 'Image']]) {
        const b = el('button', null, nom);
        b.type = 'button';
        b.onclick = () => {
          const r = f.faire(lire());
          exporterBlocs([...titreBloc({ exercice: r.titre, emoji: f.emoji || t.emoji,
                                        couleur: t.trait, fond: t.fond }),
                         ...r.blocs,
                         ...pied({ exercice: r.titre, quand: leJour() })],
                        r.titre, quoi);
        };
        boutons.append(b);
      }
      carte.append(boutons);
      zone.append(carte);
      }
    }
    if (!montrees) {
      zone.append(el('p', 'note', `Rien ne correspond à « ${filtre} ». `
        + 'Essaie « carte », « table », « mesure », « poésie »…'));
    }

    /* Ce que le modèle doit remplir : un sujet, un format, et c'est tout. */
    const sel = $('materielFormat');
    if (!sel.children.length) {
      for (const d of DEMANDES) {
        const o = el('option', null, `${d.nom} — ${d.pour}`);
        o.value = d.id;
        sel.append(o);
      }
    }
  }

  $('materielNiveau').onchange = rendre;
  $('materielCherche').oninput = rendre;

  $('materielDemander').onclick = async () => {
    const d = DEMANDES.find((x) => x.id === $('materielFormat').value);
    if (!d) return;
    const sujet = $('materielSujet').value.trim();
    const combien = Number($('materielCombien').value) || 24;
    $('materiel').close();

    const j = await envoyer({
      nom: d.nom,
      consigne: consigneDe(d, { sujet, niveau: niveau(), combien }),
      texte: `Sujet : ${sujet || '(libre)'}\nNiveau : ${niveau()}\nNombre d'items : ${combien}`,
      classe: null, palier: 'mid',
      avant: 'Le modèle fournit la liste ; la mise en page est faite ici.'
    });
    if (!j) return;

    const { items, ecartees } = lireLesItems(j.texte);
    if (!items.length) {
      $('sortieMeta').textContent = 'Aucun item lisible dans la réponse : rien à mettre en '
        + 'page. Relance, ou précise le sujet.';
      return;
    }
    /*
     * Les cartes recto-verso : le dos n'est fabriqué que si le modèle a donné les deux
     * parties. Sinon on imprime le recto seul, plutôt qu'une planche de dos vides.
     */
    const format = FORMATS[d.format] || FORMATS.cartes;
    const aUnDos = items.some((x) => x.droite);
    const blocs = [
      ...titreBloc({ exercice: `${d.nom}${sujet ? ` — ${sujet}` : ''}`,
                     emoji: '🃏', couleur: laFamille('Français').trait,
                     fond: laFamille('Français').fond }),
      { type: 'paragraphe', discret: true, morceaux: [{ texte:
        `${items.length} items · ${format.nom}${ecartees.length
          ? ` · ${ecartees.length} ligne(s) écartée(s) : ce n'étaient pas des items` : ''}` }] },
      // La même teinte au recto et au verso : une carte retournée reste la sienne.
      planche(items.map((x) => x.gauche), format, { fond: (v, i) => pastel(i) })
    ];
    if (aUnDos) {
      blocs.push({ type: 'saut' });
      blocs.push({ type: 'titre', niveau: 2, morceaux: [{ texte: 'VERSO — imprimer au dos' }] });
      blocs.push(planche(items.map((x) => x.droite), format,
                         { miroir: true, fond: (v, i) => pastel(i) }));
    }
    blocs.push(...pied({ exercice: d.nom, quand: leJour(), modele: j.fournisseur }));

    $('sortieMeta').textContent = `${items.length} items mis en page. `
      + `${aUnDos ? 'Recto-verso : imprime les deux pages sur la même feuille.' : ''}`;
    proposerLExport(blocs, d.nom);
  };

  $('ouvrirMateriel').onclick = () => { rendre(); $('materiel').showModal(); };
  $('fermerMateriel').onclick = () => $('materiel').close();
}

/*
 * Les réglages d'une fabrique. Trois au maximum : au-delà, c'est un formulaire, et un
 * formulaire devant une fiche de tables n'est jamais rempli.
 */
const OPTIONS = {
  'table-affiche': { tables: { nom: 'Tables', valeur: '2 3 4 5 6 7 8 9 10', liste: true } },
  'cartes-tables': { tables: { nom: 'Tables', valeur: '5', liste: true } },
  'bande-numerique': { de: { nom: 'De', valeur: 0, type: 'number' },
                       a: { nom: 'À', valeur: 100, type: 'number' } },
  'dominos-calcul': { tables: { nom: 'Tables', valeur: '2 5 10', liste: true },
                      combien: { nom: 'Dominos', valeur: 16, type: 'number', min: 4, max: 40 } },
  'listes-mots': { de: { nom: 'De la semaine', valeur: 1, type: 'number', min: 1, max: 36 },
                   a: { nom: 'À la semaine', valeur: 6, type: 'number', min: 1, max: 36 } },
  'programme-poesies': { de: { nom: 'De la semaine', valeur: 1, type: 'number', min: 1, max: 36 },
                         a: { nom: 'À la semaine', valeur: 36, type: 'number', min: 1, max: 36 } },
  'coloriage-magique': {
    motif: { nom: 'Dessin', valeur: 'etoile',
             choix: MOTIFS.map((m) => ({ valeur: m.id, nom: `${m.emoji} ${m.nom}` })) },
    graine: { nom: 'Tirage', valeur: 1, type: 'number', min: 1, max: 999 },
    /*
     * LE CORRIGÉ EST UN CHOIX EXPLICITE, et il change le nom du fichier. C'est la même
     * règle que pour les évaluations : on ne doit jamais imprimer l'un en croyant
     * imprimer l'autre.
     */
    corrige: { nom: 'Ce qu\'on imprime', valeur: 'non', booleen: true,
               choix: [{ valeur: 'non', nom: 'la fiche à colorier' },
                       { valeur: 'oui', nom: 'le corrigé de l\'enseignant' }] }
  },
  'points-a-relier': {
    motif: { nom: 'Dessin', valeur: 'etoile',
             choix: MOTIFS.map((m) => ({ valeur: m.id, nom: `${m.emoji} ${m.nom}` })) },
    combien: { nom: 'Points', valeur: 28, type: 'number', min: 8, max: 60 }
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   LES EXERCICES
   ══════════════════════════════════════════════════════════════════════════ */

export function installerLesExercices() {
  let dernier = null;

  const dire = (t) => { $('exoEtat').textContent = t; };

  async function lancer() {
    const demande = $('exoDemande').value.trim();
    if (!demande) return;
    const niveau = $('exoNiveau').value || 'CE2';
    const graine = Number($('exoGraine').value) || 1;

    const r = fabriquer(demande, { niveau, graine });

    /* ── CE QUI SE CALCULE : rien ne part au fournisseur ──────────────────── */
    if (r.genre === 'calcul') {
      dernier = r;
      const bouts = [`${r.items.length} exercices · ${r.compris.join(' · ')}`,
                     'Calculé ici : aucune donnée n\'est partie au fournisseur.'];
      if (r.manque) {
        bouts.push(`Tu en as demandé ${r.manque.demande} ; il n'en existe que `
          + `${r.manque.obtenu} de ce type. Les voilà tous.`);
      }
      if (r.ignores.length) bouts.push(`Pas compris : ${r.ignores.join(', ')}.`);
      dire(bouts.join('\n'));
      montrer(r);
      return;
    }

    /* ── SINON : le modèle, avec la forme qui permet de séparer les deux ──── */
    dire('Envoi…');
    const j = await envoyer({
      nom: 'Fiche d\'exercices', consigne: CONSIGNE_MODELE,
      texte: `Ce que l'enseignant demande : ${demande}\nNiveau : ${niveau}`,
      classe: null, palier: 'mid'
    });
    if (!j) return;

    const { items, consigne } = lireLesExercices(j.texte);
    if (!items.length) {
      dire('La réponse ne se laisse pas découper en énoncés et réponses : impossible d\'en '
        + 'faire une fiche vide. Relance, ou reformule la demande.');
      return;
    }
    const t = demande.length > 60 ? `${demande.slice(0, 60)}…` : demande;
    dernier = {
      items,
      fiche: ficheEleve(items, { titre: t, niveau, consigne }),
      corrige: corrige(items, { titre: t, niveau })
    };
    dire(`${items.length} exercices. La fiche des élèves ne porte aucune réponse ; le `
      + 'corrigé est un document séparé.');
    montrer(dernier);
  }

  /**
   * Les deux exports, séparés — et le contrôle passe AVANT d'écrire la fiche.
   */
  function montrer(r) {
    const zone = $('exoBoutons');
    zone.textContent = '';

    const controle = aucuneReponse(r.fiche);
    if (!controle.propre) {
      // On refuse d'imprimer plutôt que de risquer une fiche corrigée d'avance.
      zone.append(el('p', 'refus', `La fiche des élèves n'est pas propre : `
        + `${controle.pourquoi}. Elle n'est pas proposée à l'impression.`));
      return;
    }

    for (const [quoi, nom] of [['word', 'Word'], ['image', 'Image']]) {
      const b = el('button', 'plein', `La fiche des élèves — ${nom}`);
      b.type = 'button';
      b.onclick = () => exporterBlocs(
        [...blocsDeFiche(r.fiche), ...pied({ exercice: r.fiche.titre, quand: leJour() })],
        r.fiche.titre, quoi);
      zone.append(b);
    }
    for (const [quoi, nom] of [['word', 'Word'], ['image', 'Image']]) {
      const b = el('button', 'corrigeBouton', `Le corrigé — ${nom}`);
      b.type = 'button';
      b.onclick = () => exporterBlocs(
        [...blocsDeCorrige(r.corrige), ...pied({ exercice: r.corrige.titre, quand: leJour() })],
        r.corrige.titre, quoi);
      zone.append(b);
    }

    const apercu = el('div', 'apercuFiche');
    for (const it of r.fiche.items.slice(0, 8)) {
      apercu.append(el('div', null, `${it.numero}.  ${it.enonce}`));
    }
    if (r.fiche.items.length > 8) apercu.append(el('div', 'note', '…'));
    zone.append(apercu);
  }

  $('exoLancer').onclick = lancer;
  $('exoDemande').onkeydown = (e) => { if (e.key === 'Enter') lancer(); };
  // Changer la graine redonne une AUTRE fiche du même type : deux sujets pour deux
  // moitiés de classe, sans y penser.
  $('exoGraine').onchange = () => { if (dernier) lancer(); };
  $('ouvrirExercices').onclick = () => { $('exercices').showModal(); $('exoDemande').focus(); };
  $('fermerExercices').onclick = () => $('exercices').close();
}

/** Après une réponse du modèle, proposer l'export sans quitter l'écran de sortie. */
function proposerLExport(blocs, nom) {
  const zone = $('sortieMeta').parentElement;
  const anciens = zone.querySelector('.exportBlocs');
  if (anciens) anciens.remove();
  const d = el('div', 'exportBlocs boutons');
  for (const [quoi, libelle] of [['word', 'Imprimer en Word'], ['image', 'En image']]) {
    const b = el('button', 'plein', libelle);
    b.type = 'button';
    b.onclick = () => exporterBlocs(blocs, nom, quoi);
    d.append(b);
  }
  zone.insertBefore(d, $('sortieMeta').nextSibling);
}

export default { installerLeMateriel, installerLesExercices };
