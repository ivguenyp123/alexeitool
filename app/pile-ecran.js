/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  L'ÉCRAN DE LA PILE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Le dimanche soir, la pile est sur la table. Cet écran-là est fait pour être ouvert à ce
 * moment-là, fatigué, avec l'envie d'en finir. Donc :
 *
 *   · rien d'obligatoire pour commencer. On dépose, le reste se remplit après ;
 *   · le dépôt et le collage marchent tous les deux, parce qu'on ne sait jamais dans quel
 *     état arrive le travail des élèves ;
 *   · ce qui manque est écrit en gros — qui n'a pas rendu, quelle copie n'est rattachée à
 *     personne. Ce sont les deux choses qu'on ne voit pas en corrigeant.
 *
 * ── LES COPIES RESTENT SUR LA MACHINE ───────────────────────────────────────
 *
 * Elles sont gardées dans le navigateur, avec la semaine et la liste de classe. Le serveur
 * n'en voit jamais une : il relaie l'envoi caviardé, et il ne l'écrit nulle part.
 *
 * On les garde plutôt que de les tenir en mémoire volatile, parce qu'une heure de saisie
 * perdue par un onglet fermé, c'est une heure qu'on ne recommence pas — on abandonne
 * l'outil. « Vider la pile » est à côté, et il vide vraiment.
 */
import { DOMAINES, HORAIRES, NIVEAUX } from '../lib/semaine.js';
import { table } from '../lib/eleves.js';
import { ici, GESTES } from '../lib/gestes.js';
import { pile, deposer, attribuer, retirer, etat as etatPile, refus } from '../lib/pile.js';
import { pour } from '../lib/attendus.js';
import { textePile, anneeScolaire } from '../lib/contexte.js';
import { envoyer } from './envoi.js';

const $ = (id) => document.getElementById(id);
const el = (t, c, x) => {
  const n = document.createElement(t);
  if (c) n.className = c;
  if (x !== undefined) n.textContent = x;
  return n;
};

export function installerLaPile({ etat, sauver, attendus }) {
  if (!etat.pile) etat.pile = pile({});
  // Une pile relue du stockage est un objet nu : elle repasse par le constructeur pour
  // que les champs ajoutés depuis existent, plutôt que d'être `undefined` à l'usage.
  else etat.pile = pile(etat.pile);

  const laClasse = () => table(etat.classe || []);

  /* ── Ce qu'on peut viser comme domaine ─────────────────────────────────── */
  function remplirDomaines() {
    const sel = $('pileDomaine');
    const niveau = $('pileNiveau').value;
    const choix = niveau ? Object.keys(HORAIRES[niveau] || {})
                         : [...new Set(NIVEAUX.flatMap((n) => Object.keys(HORAIRES[n])))];
    sel.textContent = '';
    sel.append(el('option', null, '—'));
    for (const d of choix) {
      const o = el('option', null, DOMAINES[d] || d);
      o.value = d;
      sel.append(o);
    }
    sel.value = choix.includes(etat.pile.domaine) ? etat.pile.domaine : '';
  }

  /**
   * ── L'ATTENDU VISÉ SE CHOISIT, IL NE SE TAPE PAS ────────────────────────
   *
   * La liste vient du texte officiel déposé, filtré par le domaine, le niveau ET la
   * génération de programme qui s'applique cette année. C'est le seul endroit où l'on
   * peut garantir qu'un attendu est le bon — et on ne peut le garantir que là.
   *
   * Le champ libre reste, parce qu'il faut bien pouvoir travailler avant d'avoir déposé
   * quoi que ce soit. Mais ce qui en sort part au modèle marqué « saisi à la main », et
   * le modèle a l'interdiction de le présenter comme une référence officielle.
   */
  function remplirAttendus() {
    const sel = $('pileAttendu');
    const { domaine, niveau } = etat.pile;
    sel.textContent = '';
    sel.append(el('option', null, '— aucun attendu désigné —'));

    const liste = (domaine && niveau)
      ? pour(attendus(), domaine, niveau, anneeScolaire()) : [];
    for (const a of liste) {
      const o = el('option', null, a.texte.length > 110 ? `${a.texte.slice(0, 110)}…` : a.texte);
      o.value = a.texte;
      sel.append(o);
    }
    const libre = el('option', null, '✎ le taper moi-même');
    libre.value = '@libre';
    sel.append(libre);

    if (etat.pile.attendu && liste.some((a) => a.texte === etat.pile.attendu)) {
      sel.value = etat.pile.attendu;
    } else if (etat.pile.attendu) {
      sel.value = '@libre';
    }

    const rien = !liste.length && domaine && niveau;
    $('pileAttenduNote').textContent = rien
      ? 'Aucun texte officiel n\'est déposé pour ce domaine et ce niveau. Lance '
        + '`npm run programme`, ou tape l\'attendu à la main — il partira marqué comme tel.'
      : '';
    majLibre();
  }

  const majLibre = () => {
    const libre = $('pileAttendu').value === '@libre';
    $('pileAttenduLibre').hidden = !libre;
    if (libre && etat.pile.attendu) $('pileAttenduLibre').value = etat.pile.attendu;
  };

  /* ── Les copies ────────────────────────────────────────────────────────── */

  function rendreCopies() {
    const t = laClasse();
    const e = etatPile(etat.pile, t);
    const zone = $('pileCopies');
    zone.textContent = '';

    for (const c of etat.pile.copies) {
      const ligne = el('div', `copie${c.pseudo ? '' : ' orpheline'}`);

      /*
       * LE SÉLECTEUR D'ÉLÈVE porte des PRÉNOMS — on est dans le navigateur, chez
       * l'enseignant, et lui doit lire des prénoms. La conversion en numéro se fait au
       * moment de partir, pas ici.
       */
      const qui = el('select', 'qui');
      qui.append(el('option', null, '— à qui ? —'));
      for (const eleve of t.eleves) {
        const o = el('option', null,
          `${eleve.prenom}${eleve.nom ? ` ${eleve.nom[0]}.` : ''}`);
        o.value = eleve.pseudo;
        qui.append(o);
      }
      qui.value = c.pseudo || '';
      qui.onchange = () => { attribuer(etat.pile, c.id, qui.value); garder(); };
      ligne.append(qui);

      const corps = el('div', 'corps');
      corps.append(el('div', 'nomFichier', c.nom || 'copie collée'));
      corps.append(el('div', 'apercu', c.texte.slice(0, 160)
        + (c.texte.length > 160 ? '…' : '')));
      // La raison de la non-attribution est écrite là, pas devinée : « deux élèves
      // s'appellent Camille » se règle en un clic, « aucun prénom trouvé » non.
      if (!c.pseudo && c.pourquoiPas) corps.append(el('div', 'pourquoi', c.pourquoiPas));
      ligne.append(corps);

      const x = el('button', 'retirer', '×');
      x.type = 'button';
      x.title = 'Retirer cette copie';
      x.onclick = () => { retirer(etat.pile, c.id); garder(); };
      ligne.append(x);

      zone.append(ligne);
    }

    /*
     * ── L'ÉTAT DE LA PILE, ET SURTOUT CEUX QUI MANQUENT ────────────────────
     *
     * C'est la ligne pour laquelle cet écran existe. Vingt-deux copies pour vingt-six
     * élèves : les quatre absents ne se manifestent pas tout seuls, et on ne s'en aperçoit
     * qu'en rendant les copies, trop tard pour aller les voir.
     */
    const dit = [`${e.deposees} copie${e.deposees > 1 ? 's' : ''}`];
    if (e.orphelines.length) dit.push(`${e.orphelines.length} non rattachée(s)`);
    $('pileCompte').textContent = dit.join(' · ');

    const manque = $('pileManque');
    manque.hidden = !(e.sansCopie.length && e.classe);
    if (!manque.hidden) {
      /*
       * ── ON NE NOMME PAS VINGT-QUATRE ENFANTS ────────────────────────────
       *
       * Mesuré à l'écran : avec deux copies déposées sur une classe de vingt-six, la
       * ligne listait vingt-quatre prénoms. Illisible, et surtout inutile — à ce
       * moment-là on est en train de saisir, pas de vérifier qui manque.
       *
       * La liste ne sert qu'à LA FIN, quand il en reste quelques-uns et qu'on peut
       * encore aller les voir. Tant qu'il en manque beaucoup, le compte suffit.
       */
      const NOMMABLES = 8;
      manque.textContent = e.sansCopie.length <= NOMMABLES
        ? `Rien de : ${e.sansCopie.map((x) => x.prenom).join(', ')}. `
          + 'Ne pas avoir rendu n\'est pas ne pas savoir — rien ne sera conclu sur eux.'
        : `${e.sansCopie.length} élèves sur ${e.classe} n'ont pas de copie dans la pile. `
          + 'Leurs prénoms s\'afficheront quand il n\'en restera plus que quelques-uns.';
    }

    $('pileVider').hidden = !etat.pile.copies.length;

    /*
     * SANS LISTE DE CLASSE, RIEN N'EST MASQUÉ.
     *
     * Le caviardage ne remplace que les prénoms qu'il connaît. Pas de liste, pas de
     * remplacement : les copies partent avec les prénoms des enfants écrits dedans. On
     * ne bloque pas — un blocage à 22 h fait recopier les copies ailleurs, sans aucune
     * garde — mais ça se voit, et le bouton pour y remédier est juste là.
     */
    $('pileSansClasse').hidden = Boolean(t.eleves.length);
  }

  const garder = () => { sauver(); rendreCopies(); rendreGestes(); };

  /* ── Faire entrer des copies : par fichier, ou par collage ─────────────── */

  async function avaler(fichiers) {
    const t = laClasse();
    const refuses = [];
    for (const f of fichiers) {
      const r = refus(f.name);
      if (r) { refuses.push(`${f.name} — ${r}`); continue; }
      const texte = await f.text();
      const d = deposer(etat.pile, { nom: f.name, texte }, t);
      if (!d.ok) refuses.push(`${f.name} — ${d.dit}`);
    }
    // Un refus muet fait recommencer trois fois avant de comprendre. On les dit tous,
    // en entier, et ils restent affichés.
    $('pileRefus').textContent = refuses.join('\n');
    $('pileRefus').hidden = !refuses.length;
    garder();
  }

  $('pileFichiers').onchange = (ev) => {
    avaler([...ev.target.files]);
    ev.target.value = '';
  };

  const zoneDepot = $('pileDepot');
  for (const ev of ['dragenter', 'dragover']) {
    zoneDepot.addEventListener(ev, (e) => {
      e.preventDefault();
      zoneDepot.classList.add('survol');
    });
  }
  for (const ev of ['dragleave', 'drop']) {
    zoneDepot.addEventListener(ev, () => zoneDepot.classList.remove('survol'));
  }
  zoneDepot.addEventListener('drop', (e) => {
    e.preventDefault();
    avaler([...(e.dataTransfer?.files || [])]);
  });
  zoneDepot.onclick = () => $('pileFichiers').click();

  $('pileColler').onclick = () => {
    const texte = $('pileCollage').value;
    if (!texte.trim()) return;
    /*
     * Une copie collée n'a pas de nom de fichier. On tente quand même la reconnaissance
     * sur la PREMIÈRE LIGNE : c'est là qu'un enfant écrit son prénom, et c'est là que
     * l'enseignant le retape en recopiant.
     */
    const d = deposer(etat.pile, { nom: '', texte }, laClasse());
    if (!d.ok) { $('pileRefus').textContent = d.dit; $('pileRefus').hidden = false; return; }
    $('pileRefus').hidden = true;
    $('pileCollage').value = '';
    garder();
  };

  $('pileVider').onclick = () => {
    if (!confirm('Retirer toutes les copies de la pile ? Le texte saisi sera perdu.')) return;
    etat.pile.copies = [];
    garder();
  };

  /* ── Les gestes ────────────────────────────────────────────────────────── */

  function rendreGestes() {
    const zone = $('pileGestes');
    zone.textContent = '';
    const vide = !etat.pile.copies.length;

    /*
     * ── LE BOUTON PRINCIPAL, ET IL S'APPELLE « CORRIGER » ──────────────────
     *
     * Il est sorti de la liste et posé au-dessus, en grand. Les autres gestes sont des
     * ANGLES de correction ; celui-là est la correction. Les confondre dans une même
     * grille, c'est obliger à choisir avant de savoir qu'on avait le choix.
     */
    const principal = GESTES.find((g) => g.id === 'corriger');
    const bouton = $('pileCorriger');
    bouton.disabled = vide;
    $('pileCorrigerNote').textContent = vide
      ? 'Dépose au moins une copie.'
      : [`${etat.pile.copies.length} copie(s).`,
         // Le manque de référence est dit AVANT l'envoi : c'est ce qui a fait inventer
         // « les 12 erreurs du texte » sur une dictée dont le texte n'était pas donné.
         etat.pile.reference ? '' : 'Sans le texte attendu, aucune erreur ne sera comptée.',
         `Ne fera jamais : ${principal.jamais}.`].filter(Boolean).join(' ');
    bouton.onclick = () => lancerSurLaPile(principal);

    for (const g of ici('pile', etat.pile).filter((g) => !g.principal)) {
      const b = el('button', 'geste');
      b.type = 'button';
      b.append(el('b', null, g.nom));
      b.append(el('small', 'lit', `lit : ${g.lit}`));
      b.append(el('small', 'jamais', `ne fera jamais : ${g.jamais}`));
      // Un bouton qui part sur une pile vide reviendrait avec une réponse inventée sur
      // rien. Il est désactivé, et il dit pourquoi.
      b.disabled = vide;
      if (vide) b.title = 'Dépose au moins une copie.';
      b.onclick = () => lancerSurLaPile(g);
      zone.append(b);
    }
  }

  async function lancerSurLaPile(g) {
    $('pile').close();
    const t = laClasse();
    const r = textePile(g, etat.pile, t, {
      attendus: attendus(), annee: anneeScolaire(),
      precision: $('pilePrecision').value || ''
    });

    /*
     * ── CE QU'ON MET SOUS LES YEUX AVANT LA RÉPONSE ────────────────────────
     *
     * Les copies sont écrites par des enfants : elles nomment des camarades, des frères,
     * des voisins. `restes` remonte les mots capitalisés que la liste de classe ne connaît
     * pas — souvent un prénom hors classe, parfois un lieu.
     *
     * On ne bloque pas dessus. Un blocage qu'on ne peut pas lever ferait recopier la pile
     * dans un autre outil, sans garde du tout. On l'affiche, et l'enseignant décide.
     */
    const avant = [
      r.caviardes && `${r.caviardes} prénom(s) de la classe remplacé(s) à l'envoi.`,
      r.restes.length && 'À vérifier — des mots qui ressemblent à des prénoms et que la '
        + `liste de classe ne connaît pas : ${r.restes.slice(0, 8).map((x) => x.mot).join(', ')}.`,
      r.etat.sansCopie.length && `${r.etat.sansCopie.length} élève(s) sans copie : `
        + 'rien ne sera conclu sur eux.'
    ].filter(Boolean).join('\n');

    await envoyer({ nom: g.nom, consigne: g.consigne, texte: r.texte, classe: t,
                    palier: g.palier || 'mid', avant,
                    // Ce que le document exporté devra dire de lui-même — y compris ce
                    // qui manquait au moment de l'envoi.
                    exporte: { exercice: etat.pile.exercice,
                               copies: etat.pile.copies.length,
                               sansCopie: r.etat.sansCopie.length,
                               sansReference: !etat.pile.reference } });
  }

  /* ── Le formulaire ─────────────────────────────────────────────────────── */

  const relire = () => {
    etat.pile.exercice = $('pileExercice').value.trim();
    etat.pile.niveau = $('pileNiveau').value;
    etat.pile.domaine = $('pileDomaine').value;
    etat.pile.consigneDonnee = $('pileConsigne').value.trim();
    etat.pile.reference = $('pileReference').value.trim();
    etat.pile.attendu = $('pileAttendu').value === '@libre'
      ? $('pileAttenduLibre').value.trim()
      : ($('pileAttendu').value === '' ? '' : $('pileAttendu').value);
    sauver();
  };

  $('pileNiveau').onchange = () => { relire(); remplirDomaines(); relire(); remplirAttendus(); };
  $('pileDomaine').onchange = () => { relire(); remplirAttendus(); };
  $('pileAttendu').onchange = () => { majLibre(); relire(); };
  for (const id of ['pileExercice', 'pileConsigne', 'pileAttenduLibre', 'pileReference']) {
    $(id).oninput = relire;
  }

  $('ouvrirPile').onclick = () => {
    $('pileExercice').value = etat.pile.exercice || '';
    $('pileNiveau').value = etat.pile.niveau || '';
    $('pileConsigne').value = etat.pile.consigneDonnee || '';
    $('pileReference').value = etat.pile.reference || '';
    remplirDomaines();
    remplirAttendus();
    if ($('pileAttendu').value === '@libre') $('pileAttenduLibre').value = etat.pile.attendu;
    rendreCopies();
    rendreGestes();
    $('pile').showModal();
  };
  $('fermerPile').onclick = () => $('pile').close();
}

export default { installerLaPile };
