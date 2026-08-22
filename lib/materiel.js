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
import { cellule } from './docx.js';
import { laFamille, MONTESSORI, GRAMMAIRE, CRAYONS, pastel } from './couleurs.js';
import { MOTIFS, motif as leMotif, grille, pointsARelier } from './dessins.js';
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
    id: 'table-affiche', emoji: '✳️', famille: 'Calcul', nom: 'Les tables de multiplication, en affiche',
    pour: 'à afficher au mur, ou à coller dans le cahier',
    mots: ['table', 'tables', 'multiplication', 'affiche'],
    faire({ tables = [2, 3, 4, 5, 6, 7, 8, 9, 10] } = {}) {
      // Une colonne par table, dix lignes : c'est la forme que tout le monde connaît, et
      // ce n'est pas le moment d'innover.
      const rangs = [tables.map((t, i) => ({
        lignes: [`Table de ${t}`], fond: pastel(i), gras: true
      }))];
      for (let i = 1; i <= 10; i++) {
        rangs.push(tables.map((t, k) => ({
          lignes: [`${t} × ${i} = ${t * i}`],
          // Une ligne sur deux est voilée : neuf colonnes de chiffres se lisent de
          // travers dès qu'on suit une ligne du doigt.
          fond: i % 2 ? undefined : pastel(k)
        })));
      }
      return { titre: 'Tables de multiplication',
               blocs: [{ type: 'tableau', rangs, centre: true }] };
    }
  },
  {
    id: 'cartes-tables', emoji: '🃏', famille: 'Calcul', nom: 'Cartes de multiplication à découper',
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
          // Chaque table a sa teinte : mélangées dans une boîte, les cartes se retrient
          // sans qu'on lise un seul calcul.
          planche(faits.map(([a, b]) => `${a} × ${b}`), FORMATS.cartes,
                  { fond: (t, i) => pastel(tables.indexOf(faits[i][0])), taille: 30 }),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'VERSO — imprimer au dos' }] },
          planche(faits.map(([a, b]) => `${a * b}`), FORMATS.cartes,
                  { miroir: true, fond: (t, i) => pastel(tables.indexOf(faits[i][0])),
                    taille: 30 })
        ]
      };
    }
  },
  {
    id: 'bande-numerique', emoji: '🔟', famille: 'Numération', nom: 'Bande numérique',
    pour: 'à coller sur la table — les nombres sous les yeux',
    mots: ['bande', 'numerique', 'ligne des nombres', 'frise numerique'],
    faire({ de = 0, a = 100, pas = 1 } = {}) {
      const rangs = [];
      let ligne = [];
      for (let n = de; n <= a; n += pas) {
        // Les multiples de dix sont teintés et en gras : la structure décimale n'est
        // plus quelque chose qu'on explique, c'est quelque chose qui se voit.
        const dizaine = n % 10 === 0;
        ligne.push(dizaine
          ? { lignes: [nombre(n)], fond: MONTESSORI.dizaines.fond,
              couleur: MONTESSORI.dizaines.trait, gras: true }
          : [nombre(n)]);
        if (ligne.length === 10) { rangs.push(ligne); ligne = []; }
      }
      if (ligne.length) rangs.push(ligne);
      return { titre: `Bande numérique de ${de} à ${a}`,
               blocs: [{ type: 'tableau', rangs, centre: true, entete: false }] };
    }
  },
  {
    id: 'tableau-numeration', emoji: '📊', famille: 'Numération', nom: 'Tableau de numération',
    pour: 'jusqu\'au million — à plastifier, on écrit dessus au feutre',
    mots: ['numeration', 'tableau', 'millier', 'milliers', 'centaine', 'dizaine'],
    faire({ jusquA = 'million' } = {}) {
      const classes = jusquA === 'million'
        ? [['Millions', ['c', 'd', 'u']], ['Mille', ['c', 'd', 'u']], ['Unités', ['c', 'd', 'u']]]
        : [['Mille', ['c', 'd', 'u']], ['Unités', ['c', 'd', 'u']]];
      // Une classe, une teinte — c'est ce qui fait qu'on voit les paquets de trois
      // chiffres avant de compter les colonnes.
      const teinte = (k) => pastel(classes.length - 1 - k);
      const rangs = [
        classes.flatMap(([nom, cols], k) => cols.map((_, i) => ({
          lignes: [i === 1 ? nom : ''], fond: teinte(k), gras: true, centre: true
        }))),
        classes.flatMap(([, cols], k) => cols.map((c) => ({
          lignes: [c], fond: teinte(k), centre: true
        })))
      ];
      // Six lignes vides : de quoi écrire six nombres avant de réimprimer.
      for (let i = 0; i < 6; i++) {
        rangs.push(classes.flatMap(([, cols], k) => cols.map(() => ({
          lignes: [''], fond: teinte(k)
        }))));
      }
      return { titre: 'Tableau de numération',
               blocs: [{ type: 'tableau', rangs, centre: true }] };
    }
  },
  {
    id: 'tableau-conversion', emoji: '⚖️', famille: 'Mesures', nom: 'Tableau de conversion',
    pour: 'longueurs, masses, contenances — les trois sur une page',
    mots: ['conversion', 'conversions', 'mesure', 'mesures', 'tableau'],
    faire() {
      const blocs = [];
      const FAMILLES = [
        ['Longueurs', ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], MONTESSORI.dizaines],
        ['Masses', ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'], MONTESSORI.unites],
        ['Contenances', ['kL', 'hL', 'daL', 'L', 'dL', 'cL', 'mL'], MONTESSORI.centaines]
      ];
      for (const [nom, unites, teinte] of FAMILLES) {
        blocs.push({ type: 'titre', niveau: 2, couleur: teinte.trait,
                     morceaux: [{ texte: nom }] });
        /*
         * L'UNITÉ DE BASE est marquée. C'est la seule colonne qui compte pour convertir,
         * et c'est celle qu'on cherche des yeux à chaque fois : le mètre, le gramme, le
         * litre. Le reste se déduit d'elle.
         */
        const base = unites[3];
        const rangs = [unites.map((u) => ({
          lignes: [u], fond: teinte.fond, gras: true,
          couleur: u === base ? teinte.trait : undefined
        }))];
        for (let i = 0; i < 4; i++) {
          rangs.push(unites.map((u) => (u === base
            ? { lignes: [''], fond: teinte.fond } : ['']))); }
        blocs.push({ type: 'tableau', rangs, centre: true, bordure: teinte.trait });
      }
      return { titre: 'Tableaux de conversion', blocs };
    }
  },
  {
    id: 'dominos-calcul', emoji: '🎲', famille: 'Calcul', nom: 'Dominos de calcul',
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
          // Les deux moitiés d'un domino ne se confondent pas : à gauche un résultat, à
          // droite un calcul. Deux teintes, et l'enfant sait de quel côté chercher.
          { type: 'tableau', decouper: true, centre: true, entete: false,
            rangs: pieces.map((p) => [
              { lignes: [p.gauche], fond: 'FFF1D6', gras: true, taille: 28 },
              { lignes: [p.droite], fond: 'E1EDFA', taille: 28 }
            ]) }
        ]
      };
    }
  },
  {
    id: 'listes-mots', emoji: '✏️', famille: 'Français', nom: 'Les listes de mots de l\'année',
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
    id: 'programme-poesies', emoji: '📜', famille: 'Français', nom: 'Le programme de poésies de l\'année',
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
    id: 'cartes-numeration', emoji: '🧱', nom: 'Cartes de numération superposables', famille: 'Numération',
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
        { pas: 1, nom: 'unités', ...MONTESSORI.unites },
        { pas: 10, nom: 'dizaines', ...MONTESSORI.dizaines },
        { pas: 100, nom: 'centaines', ...MONTESSORI.centaines }
      ];
      if (jusquA >= 1000) RANGS.push({ pas: 1000, nom: 'milliers', ...MONTESSORI.milliers });

      const blocs = [];
      for (const r of RANGS) {
        blocs.push({ type: 'titre', niveau: 2, couleur: r.trait,
                     morceaux: [{ texte: `Les ${r.nom} — en ${r.teinte}` }] });
        const valeurs = Array.from({ length: 9 }, (_, i) => (i + 1) * r.pas);
        blocs.push({
          type: 'tableau', decouper: true, cartes: true, bordure: r.trait,
          rangs: [valeurs.slice(0, 5), valeurs.slice(5)]
            .map((ligne) => ligne.map((v) => ({
              lignes: [String(v)], fond: r.fond, couleur: r.trait, gras: true, taille: 30
            })))
        });
      }
      blocs.push({ type: 'paragraphe', discret: true, morceaux: [{ texte:
        'À découper et plastifier. Les cartes s\'empilent en alignant leur bord droit : '
        + '3000 + 500 + 60 + 2 donne 3562.' }] });
      return { titre: 'Cartes de numération à superposer', blocs };
    }
  },
  {
    id: 'droite-graduee', emoji: '➡️', nom: 'Droites graduées à compléter', famille: 'Numération',
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
               blocs: [{ type: 'tableau', rangs, sansBordure: true, entete: false }] };
    }
  },
  {
    id: 'chiffres-lettres', emoji: '🔡', nom: 'Nombres en chiffres et en lettres', famille: 'Numération',
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
    id: 'pythagore', emoji: '🧩', nom: 'Table de Pythagore', famille: 'Calcul',
    pour: 'Montessori — la table complète, et la même à trous pour s\'entraîner',
    mots: ['pythagore', 'table', 'multiplication', 'montessori'],
    faire({ aTrous = false, graine = 1 } = {}) {
      const r = semeur(graine);
      const BORD = { fond: 'E1EDFA', couleur: '1B4F8C', gras: true };
      const entete = [{ lignes: [''], ...BORD },
                      ...Array.from({ length: 10 }, (_, i) => ({
                        lignes: [String(i + 1)], ...BORD }))];
      const rangs = [entete];
      for (let l = 1; l <= 10; l++) {
        const ligne = [{ lignes: [String(l)], ...BORD }];
        for (let c = 1; c <= 10; c++) {
          // Un quart des cases est vidé : assez pour travailler, pas assez pour décourager.
          const vide = aTrous && r() < 0.25;
          /*
           * LA DIAGONALE EST TEINTÉE. Ce sont les carrés — 1, 4, 9, 16… — et c'est l'axe
           * autour duquel la table se replie : 7 × 8 et 8 × 7 sont à égale distance d'elle.
           * La commutativité se voit avant d'être dite, à condition qu'on voie l'axe.
           */
          ligne.push({ lignes: [vide ? '' : String(l * c)],
                       fond: l === c ? 'FFF1D6' : undefined,
                       couleur: l === c ? '9A5B06' : undefined, gras: l === c });
        }
        rangs.push(ligne);
      }
      return {
        titre: `Table de Pythagore${aTrous ? ' — à compléter' : ''}`,
        blocs: [
          { type: 'tableau', rangs, centre: true },
          { type: 'paragraphe', discret: true, morceaux: [{ texte:
            'La table entière se lit dans les deux sens : 7 × 8 et 8 × 7 sont à la même '
            + 'distance de la diagonale. C\'est la commutativité, vue avant d\'être dite.' }] }
        ]
      };
    }
  },
  {
    id: 'table-addition', emoji: '➕', nom: 'Table d\'addition', famille: 'Calcul',
    pour: 'de 0 à 10 — en affiche, ou à trous',
    mots: ['addition', 'table', 'somme'],
    faire({ aTrous = false, graine = 1 } = {}) {
      const r = semeur(graine);
      const BORD = { fond: 'DFF2E8', couleur: '1F6B4F', gras: true };
      const rangs = [[{ lignes: [''], ...BORD },
                      ...Array.from({ length: 11 }, (_, i) => ({
                        lignes: [String(i)], ...BORD }))]];
      for (let l = 0; l <= 10; l++) {
        const ligne = [{ lignes: [String(l)], ...BORD }];
        for (let c = 0; c <= 10; c++) {
          // La diagonale, ce sont LES DOUBLES : 4 + 4, 7 + 7. Ce sont les premiers faits
          // qu'un enfant retient, et voir où ils sont aide à retrouver les autres.
          ligne.push({ lignes: [aTrous && r() < 0.25 ? '' : String(l + c)],
                       fond: l === c ? 'FFF1D6' : undefined,
                       couleur: l === c ? '9A5B06' : undefined, gras: l === c });
        }
        rangs.push(ligne);
      }
      return { titre: `Table d'addition${aTrous ? ' — à compléter' : ''}`,
               blocs: [{ type: 'tableau', rangs, centre: true }] };
    }
  },
  {
    id: 'bandes-calcul', emoji: '📋', nom: 'Bandes de calcul à découper', famille: 'Calcul',
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
      return { titre: 'Bandes de calcul',
               blocs: [{ type: 'tableau', decouper: true, rangs, entete: false }] };
    }
  },
  {
    id: 'compte-est-bon', emoji: '🎯', nom: 'Le compte est bon', famille: 'Calcul',
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
    id: 'horloges', emoji: '🕐', nom: 'Cadrans d\'horloge à compléter', famille: 'Mesures',
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
    id: 'monnaie', emoji: '💶', nom: 'Monnaie à découper', famille: 'Mesures',
    pour: 'pièces et billets — pour la marchande, les problèmes, les rendus de monnaie',
    mots: ['monnaie', 'euro', 'euros', 'piece', 'pieces', 'billet', 'billets', 'argent'],
    faire() {
      /*
       * ── LES COULEURS SONT CELLES DES VRAIS BILLETS ──────────────────────
       *
       * Rouge pour le dix, bleu pour le vingt, orange pour le cinquante, vert pour le
       * cent. Un enfant qui a joué à la marchande avec ces couleurs-là reconnaît un
       * billet dans la vraie vie — et c'est bien à ça que sert la leçon sur la monnaie.
       * Les pièces suivent le même partage : cuivre, or, bicolore.
       */
      const PIECES = [
        ['1 c', 'E8D3C4'], ['2 c', 'E8D3C4'], ['5 c', 'E8D3C4'],
        ['10 c', 'FAEBA8'], ['20 c', 'FAEBA8'], ['50 c', 'FAEBA8'],
        ['1 €', 'EDE6D0'], ['2 €', 'EDE6D0']
      ];
      const BILLETS = [
        ['5 €', 'E4E4E4'], ['10 €', 'F8C9C9'], ['20 €', 'C6DBF2'],
        ['50 €', 'FBDCB4'], ['100 €', 'C2E8D3']
      ];
      const teintes = new Map([...PIECES, ...BILLETS]);
      return {
        titre: 'Monnaie à découper',
        blocs: [
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Les pièces — 4 exemplaires' }] },
          planche(PIECES.flatMap(([p]) => [p, p, p, p]), FORMATS.etiquettes,
                  { fond: (t) => teintes.get(t), gras: true, taille: 26 }),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Les billets — 3 exemplaires' }] },
          planche(BILLETS.flatMap(([b]) => [b, b, b]), FORMATS.cartes,
                  { fond: (t) => teintes.get(t), taille: 30 })
        ]
      };
    }
  },

  /* ── GÉOMÉTRIE ────────────────────────────────────────────────────────── */
  {
    id: 'papier-pointe', emoji: '📍', nom: 'Papier pointé', famille: 'Géométrie',
    pour: 'reproduire une figure, tracer à la règle — la page vierge la plus utilisée',
    mots: ['pointe', 'points', 'papier', 'reproduction', 'figure'],
    faire({ colonnes = 14, lignes = 18 } = {}) {
      const rangs = Array.from({ length: lignes }, () =>
        Array.from({ length: colonnes }, () => ['·']));
      return { titre: 'Papier pointé',
               blocs: [{ type: 'tableau', rangs, sansBordure: true, entete: false }] };
    }
  },
  {
    id: 'quadrillage', emoji: '🔲', nom: 'Quadrillage', famille: 'Géométrie',
    pour: 'reproduire sur quadrillage, poser des opérations, faire un plan',
    mots: ['quadrillage', 'carreau', 'carreaux', 'grille', 'plan'],
    faire({ colonnes = 16, lignes = 22 } = {}) {
      const rangs = Array.from({ length: lignes }, () =>
        Array.from({ length: colonnes }, () => ['']));
      return { titre: 'Quadrillage', blocs: [{ type: 'tableau', rangs, entete: false }] };
    }
  },
  {
    id: 'patron-cube', emoji: '📦', nom: 'Patrons de solides', famille: 'Géométrie',
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
    id: 'nomenclature-figures', emoji: '🔷', nom: 'Cartes des figures géométriques', famille: 'Géométrie',
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
          // La même teinte au recto et au verso : une carte retournée reste la sienne,
          // et une paire dépareillée se repère sans lire.
          planche(liste.map(([n]) => n), FORMATS.cartes,
                  { fond: (t, i) => pastel(i), taille: 28 }),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'VERSO — les définitions' }] },
          planche(liste.map(([, d]) => d), FORMATS.cartes,
                  { miroir: true, fond: (t, i) => pastel(i) })
        ]
      };
    }
  },

  /* ── FRANÇAIS ─────────────────────────────────────────────────────────── */
  {
    id: 'symboles-grammaire', emoji: '🔺', nom: 'Symboles grammaticaux Montessori', famille: 'Français',
    pour: 'la nature des mots par une forme et une couleur — on pose les symboles sur la phrase',
    mots: ['symbole', 'symboles', 'grammaire', 'nature', 'montessori', 'analyse'],
    faire() {
      /*
       * Formes et couleurs de Montessori. Elles ne sont pas décoratives : le nom est une
       * grande pyramide noire parce qu'il est ancien et solide, le verbe un cercle rouge
       * parce qu'il est l'action et le mouvement. Un enfant qui a manipulé ce matériel
       * les reconnaît partout — en changer casserait le repère.
       */
      const rangs = [[
        { lignes: ['Symbole'], gras: true }, { lignes: ['Couleur'], gras: true },
        { lignes: ['Nature'], gras: true }, { lignes: ['Ce que c\'est'], gras: true }
      ]];
      for (const g of GRAMMAIRE) {
        rangs.push([
          { lignes: [`${g.forme} ${g.forme}${g.forme}`], fond: g.fond,
            couleur: g.trait, taille: 30, centre: true },
          { lignes: [g.teinte], couleur: g.trait, gras: true },
          { lignes: [g.nature], couleur: g.trait, gras: true },
          [g.quoi]
        ]);
      }
      /*
       * LA COULEUR EST ÉCRITE, pas seulement affichée. Une photocopieuse d'école est en
       * noir et blanc : un tableau où le sens tient dans la couleur ressort en huit
       * nuances de gris identiques. Elle est donc nommée dans sa propre colonne — et
       * l'imprimante d'Alexei, elle, la sort en vrai.
       */
      return {
        titre: 'Les symboles grammaticaux',
        blocs: [
          { type: 'tableau', rangs },
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Symboles à découper' }] },
          planche(
            GRAMMAIRE.flatMap((g) => Array(4).fill(`${g.forme} ${g.nature}`)),
            FORMATS.etiquettes,
            { fond: (t, i) => GRAMMAIRE[Math.floor(i / 4)].fond,
              couleur: (t, i) => GRAMMAIRE[Math.floor(i / 4)].trait })
        ]
      };
    }
  },
  {
    id: 'tableau-sons', emoji: '🔊', nom: 'Tableau des sons', famille: 'Français',
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
        blocs: [{ type: 'tableau', rangs: [
          [['Son'], ['S\'écrit'], ['Exemples']],
          // Quatorze lignes de graphies se suivent du doigt et se perdent : une ligne sur
          // deux est voilée pour qu'on reste dessus.
          ...SONS.map((son, i) => son.map((x, k) => ({
            lignes: [x], fond: i % 2 ? undefined : 'F2F0EA',
            couleur: k === 0 ? 'A3155A' : undefined, gras: k === 0 })))
        ] }]
      };
    }
  },
  {
    id: 'alphabet-mobile', emoji: '🔤', nom: 'Alphabet mobile', famille: 'Français',
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
            'Les voyelles sont en rouge, les consonnes en bleu — c\'est le code Montessori. '
            + 'Les lettres fréquentes sont en plusieurs exemplaires : sans ça, on ne peut '
            + 'pas écrire « maîtresse ».' }] },
          planche(lettres, FORMATS.etiquettes, {
            fond: (l) => (VOYELLES.includes(l)
              ? MONTESSORI.voyelle.fond : MONTESSORI.consonne.fond),
            couleur: (l) => (VOYELLES.includes(l)
              ? MONTESSORI.voyelle.trait : MONTESSORI.consonne.trait),
            taille: 32
          })
        ]
      };
    }
  },
  {
    id: 'nomenclature-nature', emoji: '🏷️', nom: 'Cartes de nature des mots', famille: 'Français',
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
      /*
       * LES CARTES PORTENT LA COULEUR DU SYMBOLE. Le verbe est rouge ici comme il est
       * rouge sur la planche des symboles grammaticaux : deux matériels différents, un
       * seul code. C'est ce qui fait qu'un enfant transporte ce qu'il a compris de l'un
       * à l'autre au lieu de réapprendre.
       */
      const teinte = (nature) => GRAMMAIRE.find((g) => g.nature === nature) || {};
      return {
        titre: 'La nature des mots',
        blocs: [
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'RECTO — les mots' }] },
          planche(liste.map(([m]) => m), FORMATS.cartes,
                  { fond: (t, i) => teinte(liste[i][1]).fond, taille: 30 }),
          { type: 'saut' },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'VERSO — les natures' }] },
          planche(liste.map(([, n]) => n), FORMATS.cartes,
                  { miroir: true, fond: (t) => teinte(t).fond,
                    couleur: (t) => teinte(t).trait, taille: 26 })
        ]
      };
    }
  },

  /* ── LA CLASSE ────────────────────────────────────────────────────────── */
  {
    id: 'frise-siecles', emoji: '🏰', nom: 'Frise chronologique', famille: 'La classe',
    pour: 'les grandes périodes et les siècles — à afficher sur le mur du fond',
    mots: ['frise', 'chronologie', 'histoire', 'siecle', 'periode', 'temps'],
    faire() {
      // Une période, une couleur — c'est le code des frises murales de l'école, et un
      // élève qui repère « la jaune » avant de lire « Antiquité » est un élève qui se
      // repère dans le temps.
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
          { type: 'tableau', rangs: [
            [['Période'], ['De… à…'], ['Ce qui la marque']],
            ...PERIODES.map((p, i) => p.map((x, k) => ({
              lignes: [x], fond: pastel(i), gras: k === 0 })))
          ] },
          { type: 'titre', niveau: 2, morceaux: [{ texte: 'Les siècles' }] },
          { type: 'tableau', entete: false, centre: true, rangs: (() => {
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
    id: 'sous-main', emoji: '🗺️', nom: 'Sous-main de l\'élève', famille: 'La classe',
    pour: 'l\'essentiel sous les yeux toute la journée — à plastifier',
    mots: ['sous-main', 'sous main', 'aide', 'memo', 'affichage'],
    faire({ niveau = 'CE2' } = {}) {
      const blocs = [];
      // Chaque encadré du sous-main a sa couleur : sur une page qui reste sous les yeux
      // toute la journée, on va au bon coin sans relire les quatre titres.
      const bandeau = (texte, i) => ({
        type: 'titre', niveau: 2, fond: pastel(i), centre: true,
        morceaux: [{ texte }]
      });
      blocs.push(bandeau('Les nombres', 0));
      const bande = [];
      for (let n = 0; n <= 20; n++) bande.push([String(n)]);
      blocs.push({ type: 'tableau', entete: false, centre: true,
                   rangs: [bande.slice(0, 11), bande.slice(11)] });

      blocs.push(bandeau('La numération', 1));
      blocs.push({ type: 'tableau', rangs: [
        [['milliers'], ['centaines'], ['dizaines'], ['unités']],
        [['1 000'], ['100'], ['10'], ['1']]
      ] });

      blocs.push(bandeau('La nature des mots', 2));
      blocs.push({ type: 'tableau', rangs: [
        [['nom'], ['verbe'], ['adjectif'], ['article'], ['pronom']],
        [['chat'], ['courir'], ['rouge'], ['le, une'], ['il, elle']]
      ] });

      blocs.push(bandeau('Les mots que je confonds', 3));
      blocs.push({ type: 'tableau', rangs: [
        [['a / à'], ['et / est'], ['on / ont'], ['son / sont'], ['ou / où']],
        [['il a = il avait'], ['il est = il était'], ['on = il'], ['sont = étaient'],
         ['ou = ou bien']]
      ] });

      if (niveau === 'CM1') {
        blocs.push(bandeau('Les mesures', 4));
        blocs.push({ type: 'tableau', rangs: [
          [['km'], ['hm'], ['dam'], ['m'], ['dm'], ['cm'], ['mm']],
          [['1 000 m'], [''], [''], ['1 m'], [''], [''], ['']]
        ] });
      }
      return { titre: `Sous-main ${niveau}`, blocs };
    }
  },
  {
    id: 'plan-travail', emoji: '✅', nom: 'Plan de travail de la semaine', famille: 'La classe',
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
          ]], entete: false },
          { type: 'tableau', rangs, hautesCases: false }
        ]
      };
    }
  },
  {
    id: 'etiquettes-classe', emoji: '📛', nom: 'Étiquettes au nom des élèves', famille: 'La classe',
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
    id: 'calendrier', emoji: '📅', nom: 'Calendrier de l\'année', famille: 'La classe',
    pour: 'les trente-six semaines, à cocher — le fil de l\'année sur une page',
    mots: ['calendrier', 'annee', 'semaine', 'semaines', 'periode'],
    faire({ rentree = 2026 } = {}) {
      const PERIODES = [['Période 1', 7], ['Période 2', 7], ['Période 3', 5],
                        ['Période 4', 6], ['Période 5', 11]];
      const rangs = [[['Période'], ['Semaines'], ['Poésie'], ['Liste de mots'], ['Fait']]];
      let s = 1;
      PERIODES.forEach(([nom, combien], k) => {
        for (let i = 0; i < combien; i++, s++) {
          rangs.push([
            { lignes: [i === 0 ? nom : ''], fond: pastel(k), gras: true },
            { lignes: [`S${s}`], fond: pastel(k) },
            [''], [`Liste ${s}`], ['']
          ]);
        }
      });
      return { titre: `Année scolaire ${rentree}-${rentree + 1}`,
               blocs: [{ type: 'tableau', rangs }] };
    }
  },
  /* ── LES DEUX FICHES QU'ILS RÉCLAMENT ─────────────────────────────────── */
  {
    id: 'coloriage-magique', emoji: '🎨', nom: 'Coloriage magique',
    famille: 'Calcul',
    pour: 'un calcul par case, une couleur par résultat — et un dessin apparaît',
    mots: ['coloriage', 'magique', 'dessin', 'couleur', 'couleurs', 'calcul', 'autonomie'],
    faire({ motif = 'etoile', niveau = 'CE2', graine = 1, colonnes = 14,
            corrige = false } = {}) {
      const r = semeur(graine);
      const m = leMotif(motif);
      const cases = grille(m, { colonnes, lignes: colonnes });

      /*
       * ── LES BANDES DE RÉSULTATS ────────────────────────────────────────
       *
       * Une couleur, une tranche de résultats. Les tranches se touchent sans se
       * chevaucher : une case dont le résultat tombe dans deux couleurs à la fois est
       * une case que l'enfant ne peut pas trancher, et il s'arrête là.
       */
      const utilises = [...new Set(cases.flat())];
      const largeur = niveau === 'CM1' ? 14 : 11;
      const debut = niveau === 'CM1' ? 6 : 2;
      const bande = new Map(utilises.map((k, i) => [k, {
        bas: debut + i * (largeur + 1), haut: debut + i * (largeur + 1) + largeur
      }]));

      const rangs = cases.map((rang) => rang.map((k) => {
        const b = bande.get(k);
        const resultat = b.bas + Math.floor(r() * (b.haut - b.bas + 1));
        return {
          lignes: [calculDe(r, resultat, niveau)], taille: 15, centre: true,
          // Le corrigé est le MÊME quadrillage, déjà peint : l'enseignant compare d'un
          // coup d'œil au lieu de refaire cent quatre-vingt-seize calculs.
          fond: corrige ? CRAYONS[k].fond : undefined
        };
      }));

      const legende = [[{ lignes: ['Résultat'], gras: true },
                        { lignes: ['Couleur'], gras: true }]];
      for (const k of utilises) {
        const b = bande.get(k);
        legende.push([
          { lignes: [`de ${b.bas} à ${b.haut}`], centre: true },
          { lignes: [CRAYONS[k].nom], fond: CRAYONS[k].fond,
            couleur: CRAYONS[k].trait, gras: true, centre: true }
        ]);
      }

      return {
        titre: `Coloriage magique — ${m.nom}${corrige ? ' (corrigé)' : ''}`,
        blocs: [
          { type: 'paragraphe', consigne: true, morceaux: [{ texte:
            'Calcule chaque case, puis colorie-la selon la couleur de son résultat.' }] },
          { type: 'tableau', rangs: legende, centre: true },
          { type: 'blanc', morceaux: [] },
          { type: 'tableau', rangs, centre: true, entete: false },
          { type: 'paragraphe', discret: true, morceaux: [{ texte:
            `${colonnes * colonnes} cases. C'est une fiche d'autonomie — de quoi occuper `
            + 'calmement une moitié de classe pendant que l\'autre travaille avec toi.' }] }
        ]
      };
    }
  },
  {
    id: 'points-a-relier', emoji: '⭐', nom: 'Points à relier',
    famille: 'Géométrie',
    pour: 'relier les nombres dans l\'ordre, à la règle — le dessin sort tout seul',
    mots: ['point', 'points', 'relier', 'dessin', 'ordre', 'nombres', 'regle'],
    faire({ motif = 'etoile', combien = 28, colonnes = 22, lignes = 24 } = {}) {
      const m = leMotif(motif);
      const points = pointsARelier(m, { colonnes, lignes, combien });
      const teinte = laFamille('Géométrie');
      const place = new Map(points.map((p) => [`${p.colonne}:${p.ligne}`, p.numero]));
      const rangs = Array.from({ length: lignes }, (_, l) =>
        Array.from({ length: colonnes }, (_, c) => {
          const n = place.get(`${c}:${l}`);
          // Le point AU-DESSUS du nombre : c'est lui qu'on relie, et un enfant qui vise le
          // chiffre trace un trait à côté du sommet.
          return n ? { lignes: ['•', String(n)], couleur: teinte.trait,
                       gras: true, taille: 18, centre: true }
                   : { lignes: [''], centre: true };
        }));
      return {
        titre: `Points à relier — ${m.nom}`,
        blocs: [
          { type: 'paragraphe', consigne: true, morceaux: [{ texte:
            `Relie les points de 1 à ${points.length}, à la règle. Qu'est-ce qui `
            + 'apparaît ?' }] },
          { type: 'tableau', rangs, sansBordure: true, centre: true, entete: false }
        ]
      };
    }
  }
];

/**
 * ── UN CALCUL QUI TOMBE SUR LE BON RÉSULTAT ─────────────────────────────────
 *
 * Le coloriage magique marche à l'envers d'un exercice ordinaire : on connaît la réponse
 * — c'est la couleur de la case — et on cherche un calcul qui y mène. Une addition
 * convient toujours ; la multiplication n'est proposée que si le nombre se décompose, la
 * division que si elle tombe juste. Jamais d'à-peu-près : une case fausse et l'enfant
 * colorie de travers sans qu'on sache pourquoi.
 */
function calculDe(r, resultat, niveau) {
  // Les espaces sont INSÉCABLES : « 26 − 16 » coupé en deux lignes déforme la case, et
  // une grille de coloriage bancale ne se colorie pas.
  const E = '\u00A0';
  const formes = [];
  for (let a = 2; a <= 10; a++) {
    const b = resultat / a;
    if (Number.isInteger(b) && b >= 2 && b <= 10) formes.push(`${a}${E}×${E}${b}`);
  }
  const a = 1 + Math.floor(r() * Math.max(1, resultat - 1));
  formes.push(`${a}${E}+${E}${resultat - a}`);
  const c = resultat + 2 + Math.floor(r() * 18);
  formes.push(`${c}${E}−${E}${c - resultat}`);
  if (niveau === 'CM1') {
    for (let d = 2; d <= 9; d++) {
      if (resultat * d <= 99) formes.push(`${resultat * d}${E}:${E}${d}`);
    }
  }
  return formes[Math.floor(r() * formes.length)];
}

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
export function planche(textes, format = FORMATS.cartes,
                        { miroir = false, fond, couleur, taille, gras = false } = {}) {
  // `fond` et `couleur` acceptent une fonction : c'est ainsi qu'une planche d'alphabet
  // sort ses voyelles en rouge et ses consonnes en bleu sans qu'on la découpe en deux.
  const de = (v, t, i) => (typeof v === 'function' ? v(t, i) : v);
  const rangs = [];
  for (let i = 0; i < textes.length; i += format.colonnes) {
    const rang = textes.slice(i, i + format.colonnes).map((t, j) => {
      const carte = { lignes: [t] };
      const f = de(fond, t, i + j);
      const c = de(couleur, t, i + j);
      if (f) carte.fond = f;
      if (c) carte.couleur = c;
      if (taille) carte.taille = taille;
      if (gras) carte.gras = true;
      return carte;
    });
    while (rang.length < format.colonnes) rang.push({ lignes: [''] });
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
    quoi: 'une liste de « consigne || forme conjuguée », une par ligne', format: 'cartes' },
  { id: 'devinettes', nom: 'Devinettes, charades et rébus',
    pour: 'le rituel du matin — une carte par jour, tirée au sort',
    quoi: 'une liste de « devinette || réponse », une par ligne', format: 'cartes' }
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

export { cellule, MOTIFS };

export default { FORMATS, FABRIQUES, FAMILLES, parFamille, DEMANDES, planche,
                 consigneDe, lireLesItems, enLettres, fabrique, demande, cellule };
