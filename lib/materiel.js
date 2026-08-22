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

const BASE = [
  {
    id: 'table-affiche', famille: 'Calcul', nom: 'Les tables de multiplication, en affiche',
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
    id: 'cartes-tables', famille: 'Calcul', nom: 'Cartes de multiplication à découper',
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
    id: 'bande-numerique', famille: 'Numération', nom: 'Bande numérique',
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
    id: 'tableau-numeration', famille: 'Numération', nom: 'Tableau de numération',
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
    id: 'tableau-conversion', famille: 'Mesures', nom: 'Tableau de conversion',
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
    id: 'dominos-calcul', famille: 'Calcul', nom: 'Dominos de calcul',
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
    id: 'listes-mots', famille: 'Français', nom: 'Les listes de mots de l\'année',
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
    id: 'programme-poesies', famille: 'Français', nom: 'Le programme de poésies de l\'année',
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


/* ══════════════════════════════════════════════════════════════════════════
   LE RESTE DU CATALOGUE
   ══════════════════════════════════════════════════════════════════════════

   Treize fiches, c'était maigre. Un enseignant en fabrique une par semaine
   pendant trente-six semaines, dans six domaines, pour deux niveaux.

   Beaucoup de ce qui suit vient de la pédagogie Montessori — la table de
   Pythagore, les cartes de numération superposables, les symboles
   grammaticaux, les bandes d'addition. Ce matériel a une propriété rare : il
   est AUTOCORRECTIF. L'enfant voit lui-même que ça tombe juste, sans qu'un
   adulte vienne le lui dire. Dans une classe à deux niveaux, où l'enseignant
   est avec l'autre groupe la moitié du temps, ce n'est pas un détail : c'est
   ce qui rend le travail en autonomie possible.
   ══════════════════════════════════════════════════════════════════════════ */

const AJOUTS = [
  /* ── NUMÉRATION ───────────────────────────────────────────────────────── */
  {
    id: 'cartes-numeration', nom: 'Cartes de numération superposables', famille: 'Numération',
    pour: 'Montessori — on empile 3000, 500, 60 et 2 pour voir 3562 apparaître',
    mots: ['numeration', 'carte', 'cartes', 'superposable', 'montessori', 'millier'],
    faire({ jusquA = 9999 } = {}) {
      /*
       * Les couleurs sont celles de Montessori, et elles ne se choisissent pas : vert
       * pour les unités, bleu pour les dizaines, rouge pour les centaines, vert pour les
       * milliers. Un enfant qui a manipulé ce matériel les reconnaît d'un coup d'œil, et
       * en changer casserait le repère.
       */
      const RANGS = [
        { pas: 1, couleur: '1F6B4F', nom: 'unités' },
        { pas: 10, couleur: '1B4F8C', nom: 'dizaines' },
        { pas: 100, couleur: 'C00000', nom: 'centaines' }
      ];
      if (jusquA >= 1000) RANGS.push({ pas: 1000, couleur: '1F6B4F', nom: 'milliers' });

      const blocs = [];
      for (const r of RANGS) {
        blocs.push({ type: 'titre', niveau: 2, morceaux: [{ texte: `Les ${r.nom}` }] });
        const valeurs = Array.from({ length: 9 }, (_, i) => (i + 1) * r.pas);
        blocs.push({
          type: 'tableau', decouper: true, cartes: true,
          rangs: [valeurs.slice(0, 5), valeurs.slice(5)]
            .map((ligne) => ligne.map((v) => [String(v)]))
        });
      }
      blocs.push({ type: 'paragraphe', discret: true, morceaux: [{ texte:
        'À découper et plastifier. Les cartes s\'empilent en alignant leur bord droit : '
        + '3000 + 500 + 60 + 2 donne 3562.' }] });
      return { titre: 'Cartes de numération à superposer', blocs };
    }
  },
  {
    id: 'droite-graduee', nom: 'Droites graduées à compléter', famille: 'Numération',
    pour: 'placer un nombre, lire une graduation — quatre droites par page',
    mots: ['droite', 'graduee', 'graduation', 'ligne des nombres'],
    faire({ de = 0, a = 100, combien = 4 } = {}) {
      const rangs = [];
      for (let k = 0; k < combien; k++) {
        const pas = Math.max(1, Math.round((a - de) / 10));
        const ligne = [];
        for (let n = de; n <= a; n += pas) {
          // Une graduation sur trois est écrite : les autres sont à retrouver.
          ligne.push([(n - de) / pas % 3 === 0 ? String(n) : '']);
        }
        rangs.push(ligne);
        rangs.push(ligne.map(() => ['|']));
      }
      return { titre: `Droites graduées de ${de} à ${a}`,
               blocs: [{ type: 'tableau', rangs, sansBordure: true }] };
    }
  },
  {
    id: 'chiffres-lettres', nom: 'Nombres en chiffres et en lettres', famille: 'Numération',
    pour: 'cartes à associer — le nombre d\'un côté, son écriture de l\'autre',
    mots: ['lettre', 'lettres', 'ecriture', 'chiffre', 'chiffres'],
    faire({ niveau = 'CE2', combien = 12, graine = 1 } = {}) {
      const r = semeur(graine);
      const max = niveau === 'CE2' ? 999 : 9999;
      const nombres = [];
      while (nombres.length < combien) {
        const n = 11 + Math.floor(r() * (max - 11));
        if (!nombres.includes(n)) nombres.push(n);
      }
      return {
        titre: 'Nombres en chiffres et en lettres',
        blocs: [
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'RECTO — les chiffres' }] },
          planche(nombres.map(String), FORMATS.cartes),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'VERSO — les lettres' }] },
          planche(nombres.map(enLettres), FORMATS.cartes, { miroir: true })
        ]
      };
    }
  },

  /* ── CALCUL ───────────────────────────────────────────────────────────── */
  {
    id: 'pythagore', nom: 'Table de Pythagore', famille: 'Calcul',
    pour: 'Montessori — la table complète, et la même à trous pour s\'entraîner',
    mots: ['pythagore', 'table', 'multiplication', 'montessori'],
    faire({ aTrous = false, graine = 1 } = {}) {
      const r = semeur(graine);
      const entete = [[''], ...Array.from({ length: 10 }, (_, i) => [String(i + 1)])];
      const rangs = [entete];
      for (let l = 1; l <= 10; l++) {
        const ligne = [[String(l)]];
        for (let c = 1; c <= 10; c++) {
          // Un quart des cases est vidé : assez pour travailler, pas assez pour décourager.
          ligne.push([aTrous && r() < 0.25 ? '' : String(l * c)]);
        }
        rangs.push(ligne);
      }
      return {
        titre: `Table de Pythagore${aTrous ? ' — à compléter' : ''}`,
        blocs: [
          { type: 'tableau', rangs },
          { type: 'paragraphe', discret: true, morceaux: [{ texte:
            'La table entière se lit dans les deux sens : 7 × 8 et 8 × 7 sont à la même '
            + 'distance de la diagonale. C\'est la commutativité, vue avant d\'être dite.' }] }
        ]
      };
    }
  },
  {
    id: 'table-addition', nom: 'Table d\'addition', famille: 'Calcul',
    pour: 'de 0 à 10 — en affiche, ou à trous',
    mots: ['addition', 'table', 'somme'],
    faire({ aTrous = false, graine = 1 } = {}) {
      const r = semeur(graine);
      const rangs = [[[''], ...Array.from({ length: 11 }, (_, i) => [String(i)])]];
      for (let l = 0; l <= 10; l++) {
        const ligne = [[String(l)]];
        for (let c = 0; c <= 10; c++) ligne.push([aTrous && r() < 0.25 ? '' : String(l + c)]);
        rangs.push(ligne);
      }
      return { titre: `Table d'addition${aTrous ? ' — à compléter' : ''}`,
               blocs: [{ type: 'tableau', rangs }] };
    }
  },
  {
    id: 'bandes-calcul', nom: 'Bandes de calcul à découper', famille: 'Calcul',
    pour: 'une bande, dix calculs — l\'élève coche, l\'enseignant vérifie d\'un coup d\'œil',
    mots: ['bande', 'bandes', 'calcul', 'mental', 'furet'],
    faire({ operation = 'x', tables = [2, 3, 4, 5], graine = 1 } = {}) {
      const r = semeur(graine);
      const signe = { x: '×', '+': '+', '-': '−' }[operation] || '×';
      const rangs = [];
      for (const t of tables) {
        const ligne = [[`Table de ${t}`]];
        for (let i = 1; i <= 10; i++) {
          ligne.push([`${t} ${signe} ${i} = ....`]);
        }
        rangs.push(ligne);
      }
      return { titre: 'Bandes de calcul', blocs: [{ type: 'tableau', decouper: true, rangs }] };
    }
  },
  {
    id: 'compte-est-bon', nom: 'Le compte est bon', famille: 'Calcul',
    pour: 'six nombres, un but — le jeu de calcul mental qui occupe dix minutes',
    mots: ['compte', 'bon', 'jeu', 'calcul mental'],
    faire({ combien = 8, graine = 1, niveau = 'CE2' } = {}) {
      const r = semeur(graine);
      const PLAQUES = niveau === 'CE2' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25]
                                       : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
      const rangs = [[['Les nombres'], ['Le but']]];
      for (let k = 0; k < combien; k++) {
        /*
         * ── LE BUT EST ATTEIGNABLE, ET C'EST VÉRIFIÉ ────────────────────────
         *
         * On ne tire PAS un but au hasard : on le CONSTRUIT en enchaînant des opérations
         * sur les plaques tirées. Un « compte est bon » impossible, c'est une classe
         * entière qui cherche pendant dix minutes ce qui n'existe pas.
         */
        const plaques = [];
        while (plaques.length < 6) plaques.push(PLAQUES[Math.floor(r() * PLAQUES.length)]);
        let but = plaques[0];
        for (let i = 1; i < 4; i++) {
          const p = plaques[i];
          but = r() < 0.6 ? but + p : but * p;
          if (but > 999) { but = Math.round(but / p); }
        }
        rangs.push([[plaques.join('   ')], [String(but)]]);
      }
      return { titre: 'Le compte est bon', blocs: [{ type: 'tableau', rangs }] };
    }
  },

  /* ── MESURES ──────────────────────────────────────────────────────────── */
  {
    id: 'horloges', nom: 'Cadrans d\'horloge à compléter', famille: 'Mesures',
    pour: 'lire l\'heure — les chiffres sont là, les aiguilles se dessinent',
    mots: ['heure', 'horloge', 'cadran', 'aiguille', 'pendule'],
    faire({ combien = 6, graine = 1 } = {}) {
      const r = semeur(graine);
      const rangs = [];
      for (let k = 0; k < combien; k += 3) {
        const ligne = [];
        for (let j = 0; j < 3; j++) {
          const h = 1 + Math.floor(r() * 12);
          const m = [0, 15, 30, 45][Math.floor(r() * 4)];
          ligne.push([
            '     12',
            ' 11        1',
            '10            2',
            ' 9      +      3',
            ' 8            4',
            '   7        5',
            '        6',
            '',
            `${h} h ${String(m).padStart(2, '0')}`
          ]);
        }
        rangs.push(ligne);
      }
      return {
        titre: 'Cadrans à compléter',
        blocs: [
          { type: 'paragraphe', consigne: true,
            morceaux: [{ texte: 'Dessine les aiguilles pour montrer l\'heure écrite.' }] },
          { type: 'tableau', rangs, cartes: true }
        ]
      };
    }
  },
  {
    id: 'monnaie', nom: 'Monnaie à découper', famille: 'Mesures',
    pour: 'pièces et billets — pour la marchande, les problèmes, les rendus de monnaie',
    mots: ['monnaie', 'euro', 'euros', 'piece', 'pieces', 'billet', 'billets', 'argent'],
    faire() {
      const PIECES = ['1 c', '2 c', '5 c', '10 c', '20 c', '50 c', '1 €', '2 €'];
      const BILLETS = ['5 €', '10 €', '20 €', '50 €', '100 €'];
      return {
        titre: 'Monnaie à découper',
        blocs: [
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Les pièces — 4 exemplaires' }] },
          planche(PIECES.flatMap((p) => [p, p, p, p]), FORMATS.etiquettes),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Les billets — 3 exemplaires' }] },
          planche(BILLETS.flatMap((b) => [b, b, b]), FORMATS.cartes)
        ]
      };
    }
  },

  /* ── GÉOMÉTRIE ────────────────────────────────────────────────────────── */
  {
    id: 'papier-pointe', nom: 'Papier pointé', famille: 'Géométrie',
    pour: 'reproduire une figure, tracer à la règle — la page vierge la plus utilisée',
    mots: ['pointe', 'points', 'papier', 'reproduction', 'figure'],
    faire({ colonnes = 14, lignes = 18 } = {}) {
      const rangs = Array.from({ length: lignes }, () =>
        Array.from({ length: colonnes }, () => ['·']));
      return { titre: 'Papier pointé',
               blocs: [{ type: 'tableau', rangs, sansBordure: true }] };
    }
  },
  {
    id: 'quadrillage', nom: 'Quadrillage', famille: 'Géométrie',
    pour: 'reproduire sur quadrillage, poser des opérations, faire un plan',
    mots: ['quadrillage', 'carreau', 'carreaux', 'grille', 'plan'],
    faire({ colonnes = 16, lignes = 22 } = {}) {
      const rangs = Array.from({ length: lignes }, () =>
        Array.from({ length: colonnes }, () => ['']));
      return { titre: 'Quadrillage', blocs: [{ type: 'tableau', rangs }] };
    }
  },
  {
    id: 'patron-cube', nom: 'Patrons de solides', famille: 'Géométrie',
    pour: 'cube et pavé — à découper, plier, coller',
    mots: ['patron', 'patrons', 'solide', 'solides', 'cube', 'pave', 'volume'],
    faire() {
      /*
       * Le patron du cube EN CROIX : quatre carrés en ligne, un au-dessus, un en dessous.
       * C'est le seul des onze patrons possibles que tout le monde reconnaît, et le plus
       * facile à replier pour des mains de huit ans.
       */
      const V = '';
      const croix = [
        [V, ['1'], V, V],
        [['2'], ['3'], ['4'], ['5']],
        [V, ['6'], V, V]
      ].map((r) => r.map((c) => (c === V ? [''] : c)));
      return {
        titre: 'Patron du cube',
        blocs: [
          { type: 'paragraphe', consigne: true, morceaux: [{ texte:
            'Découpe le contour, plie sur chaque trait, colle les languettes.' }] },
          { type: 'tableau', rangs: croix, cartes: true, decouper: true },
          { type: 'paragraphe', discret: true, morceaux: [{ texte:
            'Six faces carrées, toutes de la même taille. Il existe onze patrons '
            + 'différents du cube : celui-ci est le plus simple à replier.' }] }
        ]
      };
    }
  },
  {
    id: 'nomenclature-figures', nom: 'Cartes des figures géométriques', famille: 'Géométrie',
    pour: 'Montessori — le nom d\'un côté, la définition de l\'autre',
    mots: ['figure', 'figures', 'geometrie', 'nomenclature', 'polygone', 'quadrilatere'],
    faire({ niveau = 'CE2' } = {}) {
      const BASE = [
        ['carré', '4 côtés égaux, 4 angles droits'],
        ['rectangle', '4 angles droits, côtés opposés égaux'],
        ['triangle', '3 côtés, 3 sommets'],
        ['cercle', 'tous les points à la même distance du centre'],
        ['losange', '4 côtés égaux'],
        ['segment', 'une portion de droite entre deux points']
      ];
      const PLUS = [
        ['parallélogramme', 'côtés opposés parallèles deux à deux'],
        ['trapèze', 'au moins deux côtés parallèles'],
        ['triangle rectangle', 'un angle droit'],
        ['triangle isocèle', 'deux côtés égaux'],
        ['triangle équilatéral', '3 côtés égaux'],
        ['diamètre', 'le segment qui traverse le cercle par son centre']
      ];
      const liste = niveau === 'CM1' ? [...BASE, ...PLUS] : BASE;
      return {
        titre: 'Les figures géométriques',
        blocs: [
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'RECTO — les noms' }] },
          planche(liste.map(([n]) => n), FORMATS.cartes),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'VERSO — les définitions' }] },
          planche(liste.map(([, d]) => d), FORMATS.cartes, { miroir: true })
        ]
      };
    }
  },

  /* ── FRANÇAIS ─────────────────────────────────────────────────────────── */
  {
    id: 'symboles-grammaire', nom: 'Symboles grammaticaux Montessori', famille: 'Français',
    pour: 'la nature des mots par une forme et une couleur — on pose les symboles sur la phrase',
    mots: ['symbole', 'symboles', 'grammaire', 'nature', 'montessori', 'analyse'],
    faire() {
      /*
       * Formes et couleurs de Montessori. Elles ne sont pas décoratives : le nom est une
       * grande pyramide noire parce qu'il est ancien et solide, le verbe un cercle rouge
       * parce qu'il est l'action et le mouvement. Un enfant qui a manipulé ce matériel
       * les reconnaît partout — en changer casserait le repère.
       */
      const COULEURS_NOM = { '000000': 'noir', '1B4F8C': 'bleu foncé', '3E7FBF': 'bleu clair',
                             C00000: 'rouge', D97706: 'orange', '7C3AED': 'violet',
                             '1F6B4F': 'vert', DB2777: 'rose' };
      const S = [
        ['▲', '000000', 'nom', 'la personne, l\'animal, la chose'],
        ['▲', '1B4F8C', 'article', 'le, la, les, un, une, des'],
        ['▲', '3E7FBF', 'adjectif', 'il dit comment est le nom'],
        ['●', 'C00000', 'verbe', 'l\'action, ce qui se passe'],
        ['●', 'D97706', 'adverbe', 'il dit comment se fait l\'action'],
        ['▬', '7C3AED', 'pronom', 'il remplace le nom'],
        ['▬', '1F6B4F', 'préposition', 'à, de, dans, sur, pour, avec'],
        ['▬', 'DB2777', 'conjonction', 'mais, ou, et, donc, or, ni, car']
      ];
      /*
       * LA COULEUR EST ÉCRITE, pas seulement affichée. Une photocopieuse d'école est en
       * noir et blanc : un tableau où le sens tient dans la couleur ressort en huit
       * nuances de gris identiques. On la nomme, et l'enseignant colorie ou imprime sur
       * du papier de couleur.
       */
      const COULEURS = { '000000': 'noir', '1B4F8C': 'bleu foncé', '3E7FBF': 'bleu clair',
                         C00000: 'rouge', D97706: 'orange', '7C3AED': 'violet',
                         '1F6B4F': 'vert', DB2777: 'rose' };
      const rangs = [[['Symbole'], ['Couleur'], ['Nature'], ['Ce que c\'est']]];
      for (const [f, c, nom, quoi] of S) {
        rangs.push([[`${f} ${f}${f}`], [COULEURS[c] || ''], [nom], [quoi]]);
      }
      const colores = rangs;
      return {
        titre: 'Les symboles grammaticaux',
        blocs: [
          { type: 'tableau', rangs: colores },
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Symboles à découper' }] },
          planche(S.flatMap(([f, c, nom]) =>
            Array(4).fill(`${f}  ${nom}  (${COULEURS_NOM[c]})`)), FORMATS.etiquettes)
        ]
      };
    }
  },
  {
    id: 'tableau-sons', nom: 'Tableau des sons', famille: 'Français',
    pour: 'toutes les façons d\'écrire un son — à afficher, ou en sous-main',
    mots: ['son', 'sons', 'graphie', 'phonologie', 'orthographe'],
    faire() {
      const SONS = [
        ['[o]', 'o, au, eau', 'moto, chaud, bateau'],
        ['[ɛ]', 'è, ê, ai, ei, et', 'père, tête, maison, neige, jouet'],
        ['[s]', 's, ss, c, ç, t', 'sac, poisson, cerise, garçon, attention'],
        ['[z]', 's, z', 'maison, zèbre'],
        ['[k]', 'c, qu, k, ch', 'carte, quatre, kilo, chorale'],
        ['[ʒ]', 'j, g, ge', 'jardin, girafe, pigeon'],
        ['[g]', 'g, gu', 'gare, guitare'],
        ['[f]', 'f, ff, ph', 'fenêtre, chiffre, photo'],
        ['[ɑ̃]', 'an, en, am, em', 'enfant, vent, chambre, ensemble'],
        ['[ɔ̃]', 'on, om', 'maison, nombre'],
        ['[ɛ̃]', 'in, ain, ein, im', 'matin, pain, peintre, timbre'],
        ['[j]', 'ill, y, i', 'famille, crayon, ciel'],
        ['[wa]', 'oi, oy', 'oiseau, voyage'],
        ['[ø]', 'eu, œu', 'jeu, cœur']
      ];
      return {
        titre: 'Tableau des sons',
        blocs: [{ type: 'tableau',
          rangs: [[['Son'], ['S\'écrit'], ['Exemples']], ...SONS.map((s) => s.map((x) => [x]))] }]
      };
    }
  },
  {
    id: 'alphabet-mobile', nom: 'Alphabet mobile', famille: 'Français',
    pour: 'Montessori — les lettres à découper pour composer des mots sans écrire',
    mots: ['alphabet', 'lettre', 'lettres', 'mobile', 'montessori'],
    faire() {
      /*
       * Les voyelles en rouge, les consonnes en bleu : c'est le code Montessori, et c'est
       * ce qui fait qu'un enfant voit la structure d'un mot avant de savoir la nommer.
       * Les lettres fréquentes sont en plusieurs exemplaires, sinon on ne peut pas écrire
       * « maîtresse ».
       */
      const VOYELLES = 'aeiouy';
      const COMBIEN = { e: 8, a: 6, i: 5, o: 4, u: 4, s: 5, n: 5, r: 5, t: 5, l: 4 };
      const lettres = [];
      for (const c of 'abcdefghijklmnopqrstuvwxyz') {
        for (let i = 0; i < (COMBIEN[c] || 3); i++) lettres.push(c);
      }
      return {
        titre: 'Alphabet mobile',
        blocs: [
          { type: 'paragraphe', discret: true, morceaux: [{ texte:
            'Les voyelles sont plus nombreuses, et les lettres fréquentes aussi : sans ça, '
            + 'on ne peut pas écrire « maîtresse ».' }] },
          planche(lettres, FORMATS.etiquettes)
        ]
      };
    }
  },
  {
    id: 'nomenclature-nature', nom: 'Cartes de nature des mots', famille: 'Français',
    pour: 'un mot d\'un côté, sa nature de l\'autre — à trier',
    mots: ['nature', 'classe grammaticale', 'nom', 'verbe', 'adjectif'],
    faire({ niveau = 'CE2', graine = 1 } = {}) {
      const MOTS = [
        ['chat', 'nom'], ['courir', 'verbe'], ['rouge', 'adjectif'], ['le', 'article'],
        ['vite', 'adverbe'], ['il', 'pronom'], ['dans', 'préposition'], ['et', 'conjonction'],
        ['maison', 'nom'], ['manger', 'verbe'], ['petit', 'adjectif'], ['une', 'article'],
        ['souvent', 'adverbe'], ['elle', 'pronom'], ['sur', 'préposition'], ['mais', 'conjonction'],
        ['école', 'nom'], ['écrire', 'verbe'], ['joyeux', 'adjectif'], ['des', 'article'],
        ['lentement', 'adverbe'], ['nous', 'pronom'], ['avec', 'préposition'], ['ou', 'conjonction']
      ];
      const liste = niveau === 'CE2' ? MOTS.slice(0, 16) : MOTS;
      return {
        titre: 'La nature des mots',
        blocs: [
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'RECTO — les mots' }] },
          planche(liste.map(([m]) => m), FORMATS.cartes),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'VERSO — les natures' }] },
          planche(liste.map(([, n]) => n), FORMATS.cartes, { miroir: true })
        ]
      };
    }
  },

  /* ── LA CLASSE ────────────────────────────────────────────────────────── */
  {
    id: 'frise-siecles', nom: 'Frise chronologique', famille: 'La classe',
    pour: 'les grandes périodes et les siècles — à afficher sur le mur du fond',
    mots: ['frise', 'chronologie', 'histoire', 'siecle', 'periode', 'temps'],
    faire() {
      const PERIODES = [
        ['Préhistoire', 'des origines à −3300', 'l\'écriture n\'existe pas encore'],
        ['Antiquité', '−3300 à 476', 'de l\'écriture à la chute de Rome'],
        ['Moyen Âge', '476 à 1492', 'mille ans, châteaux et cathédrales'],
        ['Temps modernes', '1492 à 1789', 'des grandes découvertes à la Révolution'],
        ['Époque contemporaine', '1789 à aujourd\'hui', 'de la Révolution à nous']
      ];
      const siecles = [];
      for (let s = 1; s <= 21; s++) {
        siecles.push([`${romain(s)}e`, `${(s - 1) * 100 + 1} – ${s * 100}`]);
      }
      return {
        titre: 'Frise chronologique',
        blocs: [
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Les cinq périodes' }] },
          { type: 'tableau', rangs: [[['Période'], ['De… à…'], ['Ce qui la marque']],
            ...PERIODES.map((p) => p.map((x) => [x]))] },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Les siècles' }] },
          { type: 'tableau', rangs: (() => {
            const out = [];
            for (let i = 0; i < siecles.length; i += 7) {
              const bout = siecles.slice(i, i + 7);
              out.push(bout.map((s) => [s[0]]));
              out.push(bout.map((s) => [s[1]]));
            }
            return out;
          })() }
        ]
      };
    }
  },
  {
    id: 'sous-main', nom: 'Sous-main de l\'élève', famille: 'La classe',
    pour: 'l\'essentiel sous les yeux toute la journée — à plastifier',
    mots: ['sous-main', 'sous main', 'aide', 'memo', 'affichage'],
    faire({ niveau = 'CE2' } = {}) {
      const blocs = [];
      blocs.push({ type: 'titre', niveau: 2, morceaux: [{ texte: 'Les nombres' }] });
      const bande = [];
      for (let n = 0; n <= 20; n++) bande.push([String(n)]);
      blocs.push({ type: 'tableau', rangs: [bande.slice(0, 11), bande.slice(11)] });

      blocs.push({ type: 'titre', niveau: 2, morceaux: [{ texte: 'La numération' }] });
      blocs.push({ type: 'tableau', rangs: [
        [['milliers'], ['centaines'], ['dizaines'], ['unités']],
        [['1 000'], ['100'], ['10'], ['1']]
      ] });

      blocs.push({ type: 'titre', niveau: 2, morceaux: [{ texte: 'La nature des mots' }] });
      blocs.push({ type: 'tableau', rangs: [
        [['nom'], ['verbe'], ['adjectif'], ['article'], ['pronom']],
        [['chat'], ['courir'], ['rouge'], ['le, une'], ['il, elle']]
      ] });

      blocs.push({ type: 'titre', niveau: 2, morceaux: [{ texte: 'Les mots que je confonds' }] });
      blocs.push({ type: 'tableau', rangs: [
        [['a / à'], ['et / est'], ['on / ont'], ['son / sont'], ['ou / où']],
        [['il a = il avait'], ['il est = il était'], ['on = il'], ['sont = étaient'],
         ['ou = ou bien']]
      ] });

      if (niveau === 'CM1') {
        blocs.push({ type: 'titre', niveau: 2, morceaux: [{ texte: 'Les mesures' }] });
        blocs.push({ type: 'tableau', rangs: [
          [['km'], ['hm'], ['dam'], ['m'], ['dm'], ['cm'], ['mm']],
          [['1 000 m'], [''], [''], ['1 m'], [''], [''], ['']]
        ] });
      }
      return { titre: `Sous-main ${niveau}`, blocs };
    }
  },
  {
    id: 'plan-travail', nom: 'Plan de travail de la semaine', famille: 'La classe',
    pour: 'ce que l\'élève doit faire, ce qu\'il a fait — vierge, à remplir',
    mots: ['plan', 'travail', 'autonomie', 'contrat', 'semaine'],
    faire({ lignes = 12 } = {}) {
      const rangs = [[['Ce que je dois faire'], ['Fait'], ['Vérifié'], ['Ce que j\'en pense']]];
      for (let i = 0; i < lignes; i++) rangs.push([[''], [''], [''], ['']]);
      return {
        titre: 'Mon plan de travail',
        blocs: [
          { type: 'tableau', rangs: [[
            ['Prénom : ..............................'],
            ['Semaine du : ..............................']
          ]] },
          { type: 'tableau', rangs, hautesCases: false }
        ]
      };
    }
  },
  {
    id: 'etiquettes-classe', nom: 'Étiquettes au nom des élèves', famille: 'La classe',
    pour: 'cahiers, casiers, porte-manteaux — la liste de la classe, en étiquettes',
    mots: ['etiquette', 'etiquettes', 'prenom', 'prenoms', 'casier', 'cahier', 'porte-manteau'],
    /*
     * La seule fabrique qui touche à la liste de classe. Elle ne quitte pas la machine —
     * cette fiche est fabriquée ici, hors ligne, et rien n'est envoyé nulle part.
     */
    faire({ classe = [], exemplaires = 4 } = {}) {
      const noms = (classe || []).map((e) => e.prenom).filter(Boolean);
      if (!noms.length) {
        return { titre: 'Étiquettes', blocs: [{ type: 'paragraphe', alerte: true,
          morceaux: [{ texte: 'Ta liste de classe n\'est pas saisie : touche la ligne '
            + '« CE2-CM1 » en haut de l\'écran pour la coller.' }] }] };
      }
      return {
        titre: 'Étiquettes de la classe',
        blocs: [planche(noms.flatMap((n) => Array(exemplaires).fill(n)), FORMATS.etiquettes)]
      };
    }
  },
  {
    id: 'calendrier', nom: 'Calendrier de l\'année', famille: 'La classe',
    pour: 'les trente-six semaines, à cocher — le fil de l\'année sur une page',
    mots: ['calendrier', 'annee', 'semaine', 'semaines', 'periode'],
    faire({ rentree = 2026 } = {}) {
      const PERIODES = [['Période 1', 7], ['Période 2', 7], ['Période 3', 5],
                        ['Période 4', 6], ['Période 5', 11]];
      const rangs = [[['Période'], ['Semaines'], ['Poésie'], ['Liste de mots'], ['Fait']]];
      let s = 1;
      for (const [nom, combien] of PERIODES) {
        for (let i = 0; i < combien; i++, s++) {
          rangs.push([[i === 0 ? nom : ''], [`S${s}`], [''], [`Liste ${s}`], ['']]);
        }
      }
      return { titre: `Année scolaire ${rentree}-${rentree + 1}`,
               blocs: [{ type: 'tableau', rangs }] };
    }
  }
];

/** Les chiffres romains, pour les siècles. Écrits, pas devinés. */
function romain(n) {
  const T = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  let reste = n;
  for (const [v, s] of T) while (reste >= v) { out += s; reste -= v; }
  return out;
}

/**
 * Un nombre en toutes lettres. Écrit ici plutôt que demandé au modèle : « quatre-vingt-dix
 * mille » se fabrique par une règle, et une règle ne se trompe pas une fois sur cinquante.
 */
export function enLettres(n) {
  const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
             'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  const D = { 20: 'vingt', 30: 'trente', 40: 'quarante', 50: 'cinquante', 60: 'soixante' };

  const souscent = (x) => {
    if (x < 17) return U[x];
    if (x < 20) return `dix-${U[x - 10]}`;
    if (x < 70) {
      const d = Math.floor(x / 10) * 10;
      const u = x % 10;
      if (!u) return D[d];
      return u === 1 ? `${D[d]} et un` : `${D[d]}-${U[u]}`;
    }
    if (x < 80) return x === 71 ? 'soixante et onze' : `soixante-${souscent(x - 60)}`;
    if (x < 100) {
      const r = x - 80;
      return r === 0 ? 'quatre-vingts' : `quatre-vingt-${souscent(r)}`;
    }
    return '';
  };

  const souscentmille = (x) => {
    if (x < 100) return souscent(x);
    const c = Math.floor(x / 100);
    const r = x % 100;
    const tete = c === 1 ? 'cent' : `${U[c]} cent${r ? '' : 's'}`;
    return r ? `${tete} ${souscent(r)}` : tete;
  };

  const v = Math.floor(Math.abs(Number(n)));
  if (v < 1000) return souscentmille(v);
  const milliers = Math.floor(v / 1000);
  const reste = v % 1000;
  const tete = milliers === 1 ? 'mille' : `${souscentmille(milliers)} mille`;
  return reste ? `${tete} ${souscentmille(reste)}` : tete;
}

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

/** Le catalogue entier, groupé par famille — sinon trente fiches en vrac sont illisibles. */
export const FABRIQUES = [...BASE, ...AJOUTS];

export const FAMILLES = [...new Set(FABRIQUES.map((f) => f.famille))];
export const parFamille = () => FAMILLES.map((nom) => ({
  nom, fiches: FABRIQUES.filter((f) => f.famille === nom)
}));

export const fabrique = (id) => FABRIQUES.find((f) => f.id === id) || null;
export const demande = (id) => DEMANDES.find((d) => d.id === id) || null;

export default { FORMATS, FABRIQUES, FAMILLES, parFamille, DEMANDES, planche,
                 consigneDe, lireLesItems, enLettres, fabrique, demande };
