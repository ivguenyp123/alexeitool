/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LE MATÉRIEL — DES FEUILLES A4 QU'ON IMPRIME ET QU'ON DÉCOUPE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Ce qui coûte le plus cher à un enseignant, ce n'est pas de savoir quoi faire : c'est de
 * FABRIQUER. Trente cartes à découper, une bande numérique, un tableau de conversion, les
 * étiquettes de la semaine — chacun de ces objets prend une heure à mettre en page, et il
 * en faut un nouveau chaque semaine.
 *
 * ── DEUX FAMILLES, ET ELLES NE SE MÉLANGENT PAS ─────────────────────────────
 *
 * CE QUI SE CALCULE est fabriqué ICI, en code : les tables, les bandes numériques, les
 * tableaux de numération et de conversion, les dominos de calcul. Une bande numérique où
 * un nombre manque, personne ne le voit — et elle sert toute l'année.
 *
 * CE QUI DEMANDE DU CONTENU part au modèle : les étiquettes de vocabulaire, les cartes de
 * conjugaison, le loto des mots. Là, il est bon, et une erreur se voit.
 *
 * ── L'IMPRESSION EST UNE CONTRAINTE, PAS UNE FINITION ───────────────────────
 *
 * Une planche de cartes doit tenir sur une A4 avec des marges vraies, et les traits de
 * coupe doivent tomber juste. Une grille « à peu près » donne trente cartes de travers
 * qu'on ne peut pas plastifier.
 */
import { semeur } from './calculs.js';
import { laListe } from './mots.js';
import { lAnneeDouble } from './poesies.js';

/**
 * ── LES FORMATS D'IMPRESSION ────────────────────────────────────────────────
 *
 * Combien de cartes tiennent sur une page, et de quelle taille. Ce ne sont pas des
 * chiffres décoratifs : ils décident si le résultat est utilisable.
 */
export const FORMATS = {
  cartes: { colonnes: 3, lignes: 4, nom: '12 cartes par page (6,3 × 6,7 cm)' },
  grandesCartes: { colonnes: 2, lignes: 3, nom: '6 grandes cartes par page' },
  dominos: { colonnes: 2, lignes: 8, nom: '16 dominos par page' },
  etiquettes: { colonnes: 4, lignes: 8, nom: '32 étiquettes par page' },
  loto: { colonnes: 3, lignes: 3, nom: 'une grille de loto 3 × 3' }
};

const nombre = (n) => String(n);

/* ══════════════════════════════════════════════════════════════════════════
   CE QUI SE CALCULE
   ══════════════════════════════════════════════════════════════════════════ */

export const FABRIQUES = [
  {
    id: 'table-affiche', nom: 'Les tables de multiplication, en affiche',
    pour: 'à afficher au mur, ou à coller dans le cahier',
    mots: ['table', 'tables', 'multiplication', 'affiche'],
    faire({ tables = [2, 3, 4, 5, 6, 7, 8, 9, 10] } = {}) {
      // Une colonne par table, dix lignes : c'est la forme que tout le monde connaît, et
      // ce n'est pas le moment d'innover.
      const rangs = [tables.map((t) => [`Table de ${t}`])];
      for (let i = 1; i <= 10; i++) {
        rangs.push(tables.map((t) => [`${t} × ${i} = ${t * i}`]));
      }
      return { titre: 'Tables de multiplication', blocs: [{ type: 'tableau', rangs }] };
    }
  },
  {
    id: 'cartes-tables', nom: 'Cartes de multiplication à découper',
    pour: 'à plastifier — le calcul devant, le résultat derrière',
    mots: ['carte', 'cartes', 'table', 'tables', 'multiplication', 'decouper'],
    faire({ tables = [5], graine = 1 } = {}) {
      const r = semeur(graine);
      const faits = [];
      for (const t of tables) for (let i = 1; i <= 10; i++) faits.push([t, i]);
      /*
       * Le VERSO est imprimé en miroir, colonne par colonne : plié en deux, chaque
       * résultat tombe derrière son calcul. Sans l'inversion, tout est décalé d'une
       * carte et la planche est bonne à jeter.
       */
      return {
        titre: `Cartes — table${tables.length > 1 ? 's' : ''} de ${tables.join(', ')}`,
        blocs: [
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'RECTO — à découper' }] },
          planche(faits.map(([a, b]) => `${a} × ${b}`), FORMATS.cartes),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'VERSO — imprimer au dos' }] },
          planche(faits.map(([a, b]) => `${a * b}`), FORMATS.cartes, { miroir: true })
        ]
      };
    }
  },
  {
    id: 'bande-numerique', nom: 'Bande numérique',
    pour: 'à coller sur la table — les nombres sous les yeux',
    mots: ['bande', 'numerique', 'ligne des nombres', 'frise numerique'],
    faire({ de = 0, a = 100, pas = 1 } = {}) {
      const rangs = [];
      let ligne = [];
      for (let n = de; n <= a; n += pas) {
        ligne.push([nombre(n)]);
        // Dix par ligne : c'est la structure décimale, et elle se voit à l'œil.
        if (ligne.length === 10) { rangs.push(ligne); ligne = []; }
      }
      if (ligne.length) rangs.push(ligne);
      return { titre: `Bande numérique de ${de} à ${a}`,
               blocs: [{ type: 'tableau', rangs }] };
    }
  },
  {
    id: 'tableau-numeration', nom: 'Tableau de numération',
    pour: 'jusqu\'au million — à plastifier, on écrit dessus au feutre',
    mots: ['numeration', 'tableau', 'millier', 'milliers', 'centaine', 'dizaine'],
    faire({ jusquA = 'million' } = {}) {
      const classes = jusquA === 'million'
        ? [['Millions', ['c', 'd', 'u']], ['Mille', ['c', 'd', 'u']], ['Unités', ['c', 'd', 'u']]]
        : [['Mille', ['c', 'd', 'u']], ['Unités', ['c', 'd', 'u']]];
      const rangs = [
        classes.flatMap(([nom, cols]) => cols.map((_, i) => [i === 1 ? nom : ''])),
        classes.flatMap(([, cols]) => cols.map((c) => [c]))
      ];
      // Six lignes vides : de quoi écrire six nombres avant de réimprimer.
      for (let i = 0; i < 6; i++) rangs.push(rangs[1].map(() => ['']));
      return { titre: 'Tableau de numération', blocs: [{ type: 'tableau', rangs }] };
    }
  },
  {
    id: 'tableau-conversion', nom: 'Tableau de conversion',
    pour: 'longueurs, masses, contenances — les trois sur une page',
    mots: ['conversion', 'conversions', 'mesure', 'mesures', 'tableau'],
    faire() {
      const blocs = [];
      const FAMILLES = [
        ['Longueurs', ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']],
        ['Masses', ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg']],
        ['Contenances', ['kL', 'hL', 'daL', 'L', 'dL', 'cL', 'mL']]
      ];
      for (const [nom, unites] of FAMILLES) {
        blocs.push({ type: 'titre', niveau: 2, morceaux: [{ texte: nom }] });
        const rangs = [unites.map((u) => [u])];
        for (let i = 0; i < 4; i++) rangs.push(unites.map(() => ['']));
        blocs.push({ type: 'tableau', rangs });
      }
      return { titre: 'Tableaux de conversion', blocs };
    }
  },
  {
    id: 'dominos-calcul', nom: 'Dominos de calcul',
    pour: 'un jeu qui boucle : le dernier domino se raccorde au premier',
    mots: ['domino', 'dominos', 'jeu', 'calcul'],
    faire({ tables = [2, 5, 10], combien = 16, graine = 1 } = {}) {
      const r = semeur(graine);
      /*
       * ── LA BOUCLE EST VÉRIFIÉE, PAS ESPÉRÉE ────────────────────────────
       *
       * Un jeu de dominos qui ne boucle pas est un jeu cassé : les enfants arrivent au
       * bout et il reste des pièces. On fabrique donc la chaîne d'abord, et chaque
       * domino porte la réponse du précédent — le dernier reboucle sur le premier.
       */
      const faits = [];
      for (let i = 0; i < combien; i++) {
        const t = tables[i % tables.length];
        const b = 1 + Math.floor(r() * 10);
        faits.push({ calcul: `${t} × ${b}`, resultat: t * b });
      }
      const pieces = faits.map((f, i) => ({
        gauche: nombre(faits[(i + faits.length - 1) % faits.length].resultat),
        droite: f.calcul
      }));
      return {
        titre: 'Dominos de calcul',
        blocs: [
          { type: 'paragraphe', morceaux: [{ texte: 'À découper. Le jeu boucle : le dernier '
            + 'domino se raccorde au premier.' }] },
          { type: 'tableau', decouper: true,
            rangs: pieces.map((p) => [[p.gauche], [p.droite]]) }
        ]
      };
    }
  },
  {
    id: 'listes-mots', nom: 'Les listes de mots de l\'année',
    pour: 'une liste par semaine, cinq mots par jour — à coller dans le cahier',
    mots: ['mot', 'mots', 'liste', 'listes', 'dictee', 'orthographe'],
    faire({ niveau = 'CE2', de = 1, a = 6 } = {}) {
      const blocs = [];
      for (let s = de; s <= a; s++) {
        const l = laListe(niveau, s);
        if (!l) continue;
        blocs.push({ type: 'titre', niveau: 2,
                     morceaux: [{ texte: `Semaine ${l.semaine} — ${l.regle}` }] });
        blocs.push({ type: 'tableau',
          rangs: [
            l.jours.map((_, i) => [`Jour ${i + 1}`]),
            l.jours.map((j) => j)
          ] });
      }
      return { titre: `Listes de mots ${niveau} — semaines ${de} à ${a}`, blocs };
    }
  },
  {
    id: 'programme-poesies', nom: 'Le programme de poésies de l\'année',
    pour: 'trente-six semaines, les deux niveaux — les textes se récupèrent sur internet',
    mots: ['poesie', 'poesies', 'poeme', 'poemes', 'recitation'],
    faire({ de = 1, a = 36 } = {}) {
      const annee = lAnneeDouble().filter((s) => s.semaine >= de && s.semaine <= a);
      const rangs = [[['Sem.'], ['CE2'], ['CM1']]];
      for (const s of annee) {
        rangs.push([
          [String(s.semaine)],
          [s.CE2.titre, s.CE2.auteur, s.CE2.domainePublic === false ? '(sous droits)' : ''],
          s.commun ? ['— la même —']
            : [s.CM1.titre, s.CM1.auteur, s.CM1.domainePublic === false ? '(sous droits)' : '']
        ]);
      }
      return {
        titre: 'Poésies de l\'année',
        blocs: [
          { type: 'tableau', rangs },
          { type: 'paragraphe', discret: true, morceaux: [{ texte:
            'Les textes ne sont pas reproduits ici : ils se trouvent en ligne en quelques '
            + 'secondes. « Sous droits » signale les auteurs morts depuis moins de '
            + 'soixante-dix ans — l\'usage en classe reste possible, la diffusion non.' }] }
        ]
      };
    }
  }
];

/**
 * Une planche de cartes à découper.
 *
 * `miroir` inverse chaque rangée : c'est ce qui fait tomber le verso derrière le recto
 * quand on imprime en recto-verso. Sans lui, la planche entière est décalée.
 */
export function planche(textes, format = FORMATS.cartes, { miroir = false } = {}) {
  const rangs = [];
  for (let i = 0; i < textes.length; i += format.colonnes) {
    const rang = textes.slice(i, i + format.colonnes).map((t) => [t]);
    while (rang.length < format.colonnes) rang.push(['']);
    rangs.push(miroir ? [...rang].reverse() : rang);
  }
  return { type: 'tableau', decouper: true, cartes: true, rangs };
}

/* ══════════════════════════════════════════════════════════════════════════
   CE QUI DEMANDE DU CONTENU
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les formats que le modèle remplit. On lui demande une LISTE, jamais une mise en page :
 * la mise en page est notre affaire, et un modèle qui dessine des tableaux en ASCII rend
 * des planches inutilisables.
 */
export const DEMANDES = [
  { id: 'etiquettes-mots', nom: 'Étiquettes de mots à découper',
    pour: 'pour trier, classer, fabriquer des phrases',
    quoi: 'une liste de mots, un par ligne', format: 'etiquettes' },
  { id: 'cartes-question', nom: 'Cartes question-réponse',
    pour: 'à plastifier — la question devant, la réponse derrière',
    quoi: 'une liste de « question || réponse », une par ligne', format: 'cartes' },
  { id: 'loto-vocabulaire', nom: 'Loto de vocabulaire',
    pour: 'une grille 3 × 3 par élève, et les cartes à tirer',
    quoi: 'une liste de mots, un par ligne', format: 'loto' },
  { id: 'memory', nom: 'Jeu de memory',
    pour: 'les paires à associer',
    quoi: 'une liste de « gauche || droite », une paire par ligne', format: 'cartes' },
  { id: 'cartes-conjugaison', nom: 'Cartes de conjugaison',
    pour: 'un verbe, un temps, une personne — la réponse au dos',
    quoi: 'une liste de « consigne || forme conjuguée », une par ligne', format: 'cartes' }
];

/** Ce qu'on demande au modèle pour remplir un format. */
export function consigneDe(demande, { sujet = '', niveau = 'CE2', combien = 24 } = {}) {
  return `Tu fournis le CONTENU d'un matériel de classe qui sera imprimé et découpé.

CE QU'ON TE DEMANDE : ${demande.quoi}.
SUJET : ${sujet || '(à toi de choisir, en restant au programme)'}
NIVEAU : ${niveau}
COMBIEN : ${combien} items, ni plus ni moins.

LA FORME EST STRICTE, parce que l'outil met en page lui-même :
· une ligne par item, rien d'autre sur la ligne ;
· pas de numérotation, pas de puce, pas de titre, pas de commentaire ;
· quand deux parties sont demandées, elles sont séparées par deux barres : « chat || le chat » ;
· CHAQUE ITEM TIENT EN QUELQUES MOTS. Une carte de 6 cm ne contient pas une phrase de
  vingt mots : ce qui déborde est illisible une fois imprimé.

CE QUE TU NE FAIS JAMAIS :
· Tu ne dessines aucun tableau, aucune grille, aucun cadre : la mise en page n'est pas ton
  travail, et un tableau en caractères rend la planche inutilisable.
· Tu ne mets ni consigne, ni explication, ni exemple corrigé — seulement les items.
· Tu ne cites aucun attendu officiel : tu ne les as pas.
· Tu ne dépasses pas le niveau demandé. Un CE2 est en fin de cycle 2, un CM1 en début de
  cycle 3.`;
}

/** Lire la liste rendue. Ce qui n'est pas une ligne d'item est écarté, et compté. */
export function lireLesItems(reponse) {
  const items = [];
  const ecartees = [];
  for (const brute of String(reponse || '').split('\n')) {
    const l = brute.replace(/\*\*/g, '').replace(/^\s*(?:\d{1,3}[.)]|[-–—•*·])\s*/, '').trim();
    if (!l) continue;
    // Un titre, une consigne, une phrase d'introduction : tout ça n'est pas un item.
    if (l.length > 90 || /^(consigne|voici|attention|note)\b/i.test(l)) {
      ecartees.push(l);
      continue;
    }
    const paire = /^(.+?)\s*\|\|\s*(.+)$/.exec(l);
    items.push(paire ? { gauche: paire[1].trim(), droite: paire[2].trim() }
                     : { gauche: l, droite: '' });
  }
  return { items, ecartees };
}

export const fabrique = (id) => FABRIQUES.find((f) => f.id === id) || null;
export const demande = (id) => DEMANDES.find((d) => d.id === id) || null;

export default { FORMATS, FABRIQUES, DEMANDES, planche, consigneDe, lireLesItems,
                 fabrique, demande };
