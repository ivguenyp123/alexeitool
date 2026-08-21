/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  L'ÉCRAN : SA SEMAINE, ET RIEN D'AUTRE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * On ouvre, on voit son jour. Pas d'accueil, pas de menu, pas de connexion. Tout ce que
 * l'outil saura faire plus tard viendra se greffer AUTOUR de cet écran, jamais devant.
 *
 * ── CE QUE L'ÉCRAN DOIT MONTRER, ET QU'AUCUN EMPLOI DU TEMPS NE MONTRE ───────
 *
 * Pas « qu'est-ce qu'on fait mardi à 14 h » — cette question a deux réponses ici. Mais
 * « est-ce que les deux groupes font la même chose, et si non, lequel travaille seul
 * pendant que je suis avec l'autre ». C'est la seule question qui compte dans une classe
 * à deux niveaux, et c'est ce que la mise en page dit avant même qu'on lise.
 *
 * ── ET LE BILAN DES 24 HEURES EST TOUJOURS VISIBLE ───────────────────────────
 *
 * En bas, en permanence : est-ce que la grille couvre les volumes réglementaires des deux
 * niveaux. Une heure qui manque doit se voir en août, pas se découvrir en juin.
 */
import { JOURS, DOMAINES, REGIMES_DITS, NIVEAUX, HORAIRES,
         duJour, duree, minutes, dire, verdict, chevauchements } from '../lib/semaine.js';
import { SEMAINE, CLASSE } from '../lib/exemple.js';
import { ici } from '../lib/gestes.js';
import { texteDeGeste } from '../lib/contexte.js';

/*
 * Les attendus officiels, s'ils ont été déposés — `npm run programme` les télécharge
 * depuis éduscol. Absents, tout continue de marcher : les consignes annoncent alors le
 * manque au lieu de laisser le modèle combler.
 */
let ATTENDUS = [];
fetch('../registres/attendus.json')
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => { if (j?.attendus) ATTENDUS = j.attendus; })
  .catch(() => { /* pas déposé : c'est un état normal, pas une panne */ });
import { table, caviarder, restes } from '../lib/eleves.js';
import { lire, ecrire, durable } from './stockage.js';
import { envoyer } from './envoi.js';
import { installerLaPile } from './pile-ecran.js';

const $ = (id) => document.getElementById(id);
const el = (t, c, x) => {
  const n = document.createElement(t);
  if (c) n.className = c;
  if (x !== undefined) n.textContent = x;
  return n;
};

/* ── L'état ───────────────────────────────────────────────────────────────── */

let etat = lire();
if (!etat.semaine) etat = { ...etat, semaine: structuredClone(SEMAINE), classe: CLASSE };

/*
 * Le jour ouvert au départ est CELUI D'AUJOURD'HUI.
 *
 * Un outil de classe qu'on ouvre le mardi matin doit montrer mardi. Ouvrir sur lundi
 * obligerait à un clic tous les jours de l'année — et ce clic-là, personne ne le pardonne.
 * Le mercredi, le samedi et le dimanche, on montre le prochain jour de classe.
 */
const CODES = { 1: 'lundi', 2: 'mardi', 3: 'mercredi', 4: 'jeudi', 5: 'vendredi' };
function jourDeDepart() {
  // Le mercredi est travaillé ici. Seul le week-end renvoie au lundi suivant : on regarde
  // en avant, jamais en arrière.
  return CODES[new Date().getDay()] || 'lundi';
}
const AUJ = CODES[new Date().getDay()] || '';
let jourOuvert = jourDeDepart();
let toutVoir = false;
let enEdition = null;   // l'index du créneau modifié, ou -1 pour un nouveau

const sauver = () => { ecrire(etat); rendre(); };

/* ── Le rendu d'un moment ─────────────────────────────────────────────────── */

const nomDomaine = (d) => DOMAINES[d] || d || '—';

function unMoment(c, index) {
  const n = el('button', `moment ${c.regime}`);
  n.type = 'button';

  const quand = el('div', 'quand');
  quand.append(el('b', null, dire(minutes(c.debut))),
               el('span', null, `→ ${dire(minutes(c.fin))}`),
               el('span', null, dire(duree(c))));
  n.append(quand);

  const quoi = el('div', 'quoi');
  quoi.append(el('div', 'regime', REGIMES_DITS[c.regime] || c.regime));

  if (c.regime === 'commun') {
    // Un seul bloc : la forme dit « les deux ensemble » avant qu'on ait lu le mot.
    quoi.append(el('div', 'ensemble', nomDomaine(c.domaine)));
  } else {
    const deux = el('div', 'deux');
    for (const niv of NIVEAUX) {
      const p = el('div', `part ${niv.toLowerCase()}`);
      p.append(el('div', 'qui', niv));
      p.append(el('div', 'qd', nomDomaine(c[niv]?.domaine || c.domaine)));
      deux.append(p);
    }
    quoi.append(deux);
    if (c.regime === 'dedouble') {
      // Le coût du dédoublement, dit sur la carte. C'est l'information qui fait renoncer
      // à dédoubler quand on peut faire autrement — et elle n'est nulle part ailleurs.
      quoi.append(el('div', 'moitie',
        `chacun n'a que ${dire(Math.round(duree(c) / 2))} — les deux séances se suivent`));
    }
  }

  n.append(quoi);
  n.onclick = () => ouvrirMoment(index);
  return n;
}

function unJour(jour, host) {
  const liste = duJour(etat.semaine, jour);
  if (!liste.length) {
    host.append(el('div', 'vide', 'Rien de posé ce jour-là pour l\'instant.'));
    return;
  }
  for (const c of liste) host.append(unMoment(c, etat.semaine.indexOf(c)));
}

/* ── Le rendu complet ─────────────────────────────────────────────────────── */

function rendre() {
  $('classe').textContent = `CE2-CM1 · ${(etat.classe || []).length} élèves`;

  /* Les onglets de jour. */
  const nav = $('jours');
  nav.textContent = '';
  for (const j of JOURS) {
    const b = el('button', null, j[0].toUpperCase() + j.slice(1));
    b.type = 'button';
    if (j === jourOuvert && !toutVoir) b.setAttribute('aria-current', 'true');
    if (j === AUJ) b.prepend(el('span', 'auj', 'aujourd\'hui'));
    b.onclick = () => { jourOuvert = j; toutVoir = false; rendre(); };
    nav.append(b);
  }

  $('voirTout').textContent = toutVoir ? 'Voir un seul jour' : 'Voir toute la semaine';

  /* Le jour, ou les quatre. */
  const jour = $('jour');
  const tout = $('semaine');
  jour.textContent = '';
  tout.textContent = '';
  jour.hidden = toutVoir;
  tout.hidden = !toutVoir;

  if (toutVoir) {
    for (const j of JOURS) {
      const bloc = el('div');
      bloc.append(el('h2', null, j[0].toUpperCase() + j.slice(1)));
      const g = el('div', 'jour');
      unJour(j, g);
      bloc.append(g);
      tout.append(bloc);
    }
  } else {
    unJour(jourOuvert, jour);
  }

  rendreBilan();

  /*
   * L'avertissement de stockage : dit UNE fois, en haut, plutôt que de laisser croire
   * que le travail est gardé. Perdre la sauvegarde est une gêne ; croire à tort qu'on
   * l'a est une perte.
   */
  const a = $('avert');
  a.hidden = durable;
  if (!durable) {
    a.textContent = 'Ce navigateur refuse d\'enregistrer (navigation privée, ou stockage '
      + 'bloqué). Les modifications tiennent le temps de l\'onglet et seront perdues à la '
      + 'fermeture.';
  }
}

function rendreBilan() {
  const b = $('bilan');
  b.textContent = '';
  const v = verdict(etat.semaine);
  const ch = chevauchements(etat.semaine);
  b.className = `bilan ${v.tient && !ch.length ? 'tient' : 'casse'}`;

  const haut = el('div', 'haut');
  haut.append(el('b', null, v.tient ? 'La semaine couvre les 24 heures'
                                    : 'La semaine ne couvre pas les 24 heures'));
  haut.append(el('span', null, v.tient
    ? 'Les volumes réglementaires des deux niveaux sont atteints.'
    : v.texte));
  b.append(haut);

  const lignes = [...(v.lignes || [])];
  for (const x of ch) {
    lignes.push(`${x.jour} · deux séances en même temps : ${x.ap.debut} commence avant la `
      + `fin de ${x.av.debut}–${x.av.fin}`);
  }
  if (lignes.length) {
    const ul = el('ul');
    for (const l of lignes) ul.append(el('li', null, l));
    b.append(ul);
  }
}

/* ── Ce qu'on peut faire sur ce moment ────────────────────────────────────── */

/**
 * ── IL N'Y A AUCUN ÉCRAN QUI LISTE LES OUTILS ───────────────────────────────
 *
 * On touche un moment de la journée, et ce qu'on peut en faire est là. Personne ne
 * cherchera jamais « un outil de préparation » : on a un créneau devant soi.
 *
 * Ce qui est proposé dépend du créneau RÉEL. Le travail en autonomie n'apparaît pas quand
 * les deux groupes sont ensemble — personne n'est seul. « Peut-on éviter de dédoubler »
 * n'apparaît que sur un créneau dédoublé. C'est la différence entre « voilà tout ce que je
 * sais faire » et « voilà ce qui sert ici ».
 */
function ouvrirMoment(index) {
  enEdition = index;
  const c = etat.semaine[index];
  if (!c) return;

  $('momentTitre').textContent = `${c.jour[0].toUpperCase()}${c.jour.slice(1)} · `
    + `${dire(minutes(c.debut))} → ${dire(minutes(c.fin))}`;
  $('momentQuoi').textContent = c.regime === 'commun'
    ? `${REGIMES_DITS[c.regime]} · ${nomDomaine(c.domaine)}`
    : `${REGIMES_DITS[c.regime]} · CE2 ${nomDomaine(c.CE2?.domaine || c.domaine)}`
      + ` · CM1 ${nomDomaine(c.CM1?.domaine || c.domaine)}`;

  const zone = $('gestes');
  zone.textContent = '';
  for (const g of ici('creneau', c)) {
    const b = el('button', 'geste');
    b.type = 'button';
    b.append(el('b', null, g.nom));
    b.append(el('small', 'lit', `lit : ${g.lit}`));
    /*
     * CE QU'IL NE FERA JAMAIS, SUR LE BOUTON.
     *
     * Pas dans une aide qu'on ouvre, pas dans une page « à propos » : là, avant qu'on
     * clique. C'est la seule place où quelqu'un le lira vraiment, et c'est ce qui
     * distingue un outil d'aide d'un outil qui décide.
     */
    b.append(el('small', 'jamais', `ne fera jamais : ${g.jamais}`));
    b.onclick = () => lancer(g, c);
    zone.append(b);
  }

  $('moment').showModal();
}

/**
 * ── LE TRAJET COMPLET, ET LE CAVIARDAGE EST DESSUS ──────────────────────────
 *
 * situation → prénoms remplacés → le fournisseur → prénoms remis → l'écran.
 *
 * Le remplacement se fait ICI, dans le navigateur, parce que c'est le seul endroit qui
 * connaît la classe — et elle n'a aucune raison d'en sortir. Le serveur, lui, refuse tout
 * envoi qui n'est pas marqué caviardé : il ne peut pas le vérifier, mais il rend l'oubli
 * impossible à commettre en silence.
 */
async function lancer(g, c) {
  $('moment').close();
  const classe = table(etat.classe || []);
  const precision = $('precision')?.value || '';
  const brut = texteDeGeste(g, c, { classe: etat.classe || [], attendus: ATTENDUS, precision });
  const { texte, combien } = caviarder(brut, classe);

  /*
   * ── ON NE CHERCHE LES PRÉNOMS OUBLIÉS QUE DANS CE QU'UN HUMAIN A ÉCRIT ─────
   *
   * Mesuré : lancé sur le texte entier, le détecteur signalait « Mathématiques »,
   * « Chacun », « Travaille » — des mots de MON propre cadre, capitalisés en début de
   * phrase. Du bruit dans une alerte, c'est ce qui fait qu'on cesse de la lire, et alors
   * elle ne sert plus le jour où elle a raison.
   *
   * Le cadre est généré ici : il ne peut pas contenir le prénom d'un enfant. Seule la
   * précision libre en contient, puisque c'est la seule partie qu'une personne a tapée.
   */
  const suspects = restes(caviarder(precision, classe).texte, classe);
  const avant = [
    suspects.length && 'À vérifier — dans ta précision, des mots qui ressemblent à des '
      + 'prénoms et que la liste de classe ne connaît pas : '
      + `${suspects.slice(0, 6).map((x) => x.mot).join(', ')}.`,
    combien && `${combien} prénom(s) remplacé(s) à l'envoi.`
  ].filter(Boolean).join('\n');

  await envoyer({ nom: g.nom, consigne: g.consigne, texte, classe,
                  palier: g.palier || 'mid', avant });
}

/* ── La clé, au premier lancement ─────────────────────────────────────────── */

/**
 * On demande la clé À L'ÉCRAN plutôt que de renvoyer vers un terminal.
 *
 * Le message du serveur avait beau être juste, il envoyait éditer un fichier caché — et,
 * en Codespace, dans un labyrinthe de secrets injectés au démarrage du conteneur. Un
 * enseignant n'ira jamais là. Personne n'y va volontiers.
 *
 * La clé ne repart jamais vers ici : la route ne rend que `pret`.
 */
async function verifierLaCle() {
  try {
    const r = await fetch('/api/etat');
    const j = await r.json();
    if (!j.pret) $('pasDeCle').showModal();
  } catch { /* serveur absent : l'écran marche quand même, sans les gestes */ }
}

$('cleValider').onclick = async () => {
  const cle = $('champCle').value.trim();
  $('cleEtat').className = 'etat';
  $('cleEtat').textContent = 'Enregistrement…';
  try {
    const r = await fetch('/api/cle', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cle })
    });
    const j = await r.json();
    if (!r.ok) {
      $('cleEtat').className = 'etat rate';
      $('cleEtat').textContent = j.dit || 'Refusée.';
      return;
    }
    // On efface le champ tout de suite : la clé n'a aucune raison de rester à l'écran.
    $('champCle').value = '';
    $('pasDeCle').close();
  } catch {
    $('cleEtat').className = 'etat rate';
    $('cleEtat').textContent = 'Le serveur local ne répond pas.';
  }
};

$('champCle').onkeydown = (e) => { if (e.key === 'Enter') $('cleValider').click(); };

$('sortieFermer').onclick = () => $('sortie').close();
$('sortieCopier').onclick = async () => {
  try {
    await navigator.clipboard.writeText($('sortieTexte').textContent);
    $('sortieCopier').textContent = 'Copié';
    setTimeout(() => { $('sortieCopier').textContent = 'Copier'; }, 1500);
  } catch {
    // Le presse-papiers est refusé hors contexte sécurisé. On le dit plutôt que de
    // laisser croire que la copie a eu lieu.
    $('sortieCopier').textContent = 'Copie refusée par le navigateur';
  }
};

/* ── L'édition d'un moment ────────────────────────────────────────────────── */

const dlg = $('edition');

function ouvrirEdition(index) {
  enEdition = index;
  const c = etat.semaine[index];
  if (!c) return;

  $('editionTitre').textContent = `${c.jour[0].toUpperCase()}${c.jour.slice(1)} · `
    + `${dire(minutes(c.debut))} → ${dire(minutes(c.fin))}`;
  $('chDebut').value = c.debut;
  $('chFin').value = c.fin;
  for (const r of dlg.querySelectorAll('input[name=regime]')) r.checked = r.value === c.regime;

  majChoixDomaines(c);
  for (const r of dlg.querySelectorAll('input[name=regime]')) {
    r.onchange = () => majChoixDomaines(lireFormulaire());
  }
  dlg.showModal();
}

/**
 * Les listes de domaines dépendent du régime — et surtout du NIVEAU.
 *
 * Un CE2 ne peut pas faire « Sciences et technologie » : ce domaine n'existe pas au
 * cycle 2. Proposer la même liste aux deux groupes laisserait poser une grille
 * impossible, que le bilan signalerait ensuite sans qu'on comprenne pourquoi.
 */
function majChoixDomaines(c) {
  const zone = $('choixDomaines');
  zone.textContent = '';
  const regime = c.regime;

  const liste = (niveau) => Object.keys(HORAIRES[niveau]);

  if (regime === 'commun') {
    // Seulement ce que les DEUX niveaux ont à leur programme.
    const communs = liste('CE2').filter((d) => liste('CM1').includes(d));
    zone.append(unChoix('Les deux groupes', 'domaine', communs, c.domaine));
  } else {
    for (const niv of NIVEAUX) {
      zone.append(unChoix(niv, `domaine_${niv}`, liste(niv),
                          c[niv]?.domaine || c.domaine));
    }
  }

  $('noteRegime').textContent = regime === 'dedouble'
    ? 'Séparément : les deux séances se suivent, donc chaque groupe ne reçoit que la '
      + 'moitié du créneau. C\'est le régime le plus coûteux — à réserver à ce qui ne '
      + 'peut vraiment pas se mener en même temps.'
    : regime === 'decale'
      ? 'En alternance : les deux groupes travaillent en même temps, l\'un en autonomie '
        + 'pendant que vous êtes avec l\'autre. Chacun reçoit la totalité du créneau — et '
        + 'les deux peuvent faire des choses différentes.'
      : 'Ensemble : même séance pour tout le monde. Seuls les domaines communs aux deux '
        + 'cycles sont proposés.';
}

function unChoix(libelle, nom, domaines, valeur) {
  const lab = el('label', null, libelle);
  const sel = el('select');
  sel.name = nom;
  for (const d of domaines) {
    const o = el('option', null, DOMAINES[d] || d);
    o.value = d;
    if (d === valeur) o.selected = true;
    sel.append(o);
  }
  lab.append(sel);
  return lab;
}

function lireFormulaire() {
  const f = $('formEdition');
  const regime = f.querySelector('input[name=regime]:checked')?.value || 'commun';
  const c = { jour: etat.semaine[enEdition].jour, debut: $('chDebut').value,
              fin: $('chFin').value, regime };
  if (regime === 'commun') {
    c.domaine = f.querySelector('[name=domaine]')?.value || '';
  } else {
    for (const niv of NIVEAUX) {
      c[niv] = { domaine: f.querySelector(`[name=domaine_${niv}]`)?.value || '' };
    }
  }
  return c;
}

$('formEdition').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const c = lireFormulaire();
  if (!duree(c)) {
    // On refuse plutôt que d'enregistrer un créneau qui ne dure rien : il disparaîtrait
    // de tous les comptes sans que rien ne l'explique.
    $('noteRegime').textContent = 'L\'heure de fin doit venir après l\'heure de début.';
    return;
  }
  etat.semaine[enEdition] = c;
  dlg.close();
  sauver();
});

$('annuler').onclick = () => dlg.close();
$('supprimer').onclick = () => {
  etat.semaine.splice(enEdition, 1);
  dlg.close();
  sauver();
};

$('voirTout').onclick = () => { toutVoir = !toutVoir; rendre(); };
$('fermerMoment').onclick = () => $('moment').close();
$('fermerPasEncore').onclick = () => $('pasEncore').close();
$('modifierHoraire').onclick = () => { $('moment').close(); ouvrirEdition(enEdition); };

installerLaPile({ etat, sauver: () => ecrire(etat), attendus: () => ATTENDUS });

rendre();
verifierLaCle();
