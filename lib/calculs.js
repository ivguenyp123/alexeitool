/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LES EXERCICES QUI SE CALCULENT — ET QUI NE SE DEMANDENT DONC PAS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * C'est la règle du projet, appliquée là où elle compte le plus :
 *
 *     LE CHIFFRE AU CODE, L'EXPLICATION À L'AGENT.
 *
 * Une évaluation sur la table de 5 a vingt réponses, et elles sont toutes vraies ou
 * toutes fausses. Un modèle qui en rate une produit un corrigé impeccable et faux — que
 * personne ne relira, parce qu'on ne relit pas un corrigé de tables. L'enfant est alors
 * corrigé de travers sur ce qu'il avait juste.
 *
 * Alors tout ce qui se calcule est calculé ICI : les tables, les opérations posées, les
 * compléments, les conversions, les périmètres. Le modèle garde ce qu'il fait bien —
 * les énoncés de problèmes, la conjugaison, le vocabulaire.
 *
 * ── UNE FICHE SE REFAIT À L'IDENTIQUE ───────────────────────────────────────
 *
 * Le tirage est SEMÉ. Deux fiches tirées avec la même graine sont les mêmes, ce qui
 * permet de réimprimer celle qu'on a perdue, et de donner deux sujets différents aux
 * deux moitiés d'une classe sans y penser.
 */

/** Un tirage reproductible. Court, sans dépendance, et suffisant pour des exercices. */
export function semeur(graine = 1) {
  let a = (Number(graine) >>> 0) || 1;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const entre = (r, min, max) => min + Math.floor(r() * (max - min + 1));
const piocher = (r, liste) => liste[Math.floor(r() * liste.length)];

/** Mélanger sans jamais rendre deux fois la même liste dans le même ordre. */
function melanger(r, liste) {
  const t = [...liste];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/*
 * ── LA PLACE QUE PREND UNE RÉPONSE ────────────────────────────────────────────
 *
 * Ce n'est pas de la décoration : une fiche d'opérations posées où l'on n'a pas laissé
 * la hauteur nécessaire est une fiche que l'élève ne peut pas remplir. Chaque exercice
 * dit donc de combien de place il a besoin.
 *
 *   case    une réponse courte, un nombre        → un cadre sur la même ligne
 *   ligne   une phrase, un mot                   → une ligne pointillée
 *   pose    une opération à poser en colonnes    → un carreau de plusieurs centimètres
 *   lignes3 une réponse développée               → trois lignes
 */
export const PLACES = ['case', 'ligne', 'pose', 'lignes3'];

/**
 * ── LES GÉNÉRATEURS ──────────────────────────────────────────────────────────
 *
 * `mots` sert au routage : ce sont les mots qu'un enseignant écrit vraiment quand il
 * demande cette fiche. « je veux une évaluation des multiplications de table de 5 ».
 *
 * `niveaux` dit à qui ça s'adresse. Un CE2 et un CM1 n'ont pas les mêmes nombres, et
 * donner au CE2 la version du CM1 n'est pas « plus exigeant » : c'est hors programme.
 */
export const GENERATEURS = [
  {
    id: 'tables', nom: 'Tables de multiplication', niveaux: ['CE2', 'CM1'],
    mots: ['table', 'tables', 'multiplication', 'multiplications', 'fois'],
    place: 'case',
    /**
     * Les tables demandées se lisent dans la question : « la table de 5 », « les tables
     * de 6 et 7 ». Aucune précision, on prend celles du niveau.
     */
    faire(r, { tables = [], combien = 20, niveau = 'CE2' } = {}) {
      const jeu = tables.length ? tables
        : (niveau === 'CE2' ? [2, 3, 4, 5, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const toutes = [];
      for (const t of jeu) for (let i = 1; i <= 10; i++) toutes.push([t, i]);

      const choisies = melanger(r, toutes).slice(0, combien);
      return choisies.map(([a, b]) => ({
        enonce: `${a} × ${b} =`, reponse: String(a * b), place: 'case'
      }));
    }
  },
  {
    id: 'addition-posee', nom: 'Additions posées', niveaux: ['CE2', 'CM1'],
    mots: ['addition', 'additions', 'poser', 'posee', 'posees', 'plus'],
    place: 'pose',
    faire(r, { combien = 6, niveau = 'CE2', retenue = null } = {}) {
      const max = niveau === 'CE2' ? 999 : 99999;
      const out = [];
      let garde = 0;
      while (out.length < combien && garde++ < 500) {
        const a = entre(r, max / 3, max);
        const b = entre(r, max / 3, max);
        // « avec retenue » ou « sans retenue » : c'est une demande courante, et c'est
        // une propriété qu'on peut VÉRIFIER plutôt qu'espérer.
        const aRetenue = String(a).split('').reverse()
          .some((c, i) => Number(c) + Number(String(b).split('').reverse()[i] || 0) >= 10);
        if (retenue !== null && aRetenue !== retenue) continue;
        out.push({ enonce: `${a} + ${b}`, reponse: String(a + b), place: 'pose' });
      }
      return out;
    }
  },
  {
    id: 'soustraction-posee', nom: 'Soustractions posées', niveaux: ['CE2', 'CM1'],
    mots: ['soustraction', 'soustractions', 'moins', 'retirer'],
    place: 'pose',
    faire(r, { combien = 6, niveau = 'CE2' } = {}) {
      const max = niveau === 'CE2' ? 999 : 99999;
      return Array.from({ length: combien }, () => {
        const a = entre(r, Math.floor(max / 2), max);
        // Le plus petit en second : au CE2 comme au CM1, on ne pose pas une
        // soustraction dont le résultat est négatif.
        const b = entre(r, 1, a - 1);
        return { enonce: `${a} − ${b}`, reponse: String(a - b), place: 'pose' };
      });
    }
  },
  {
    id: 'multiplication-posee', nom: 'Multiplications posées', niveaux: ['CE2', 'CM1'],
    mots: ['multiplication posee', 'multiplications posees', 'poser une multiplication'],
    place: 'pose',
    faire(r, { combien = 4, niveau = 'CE2' } = {}) {
      return Array.from({ length: combien }, () => {
        const a = niveau === 'CE2' ? entre(r, 12, 99) : entre(r, 120, 999);
        const b = niveau === 'CE2' ? entre(r, 2, 9) : entre(r, 12, 99);
        return { enonce: `${a} × ${b}`, reponse: String(a * b), place: 'pose' };
      });
    }
  },
  {
    id: 'division', nom: 'Divisions euclidiennes', niveaux: ['CM1'],
    mots: ['division', 'divisions', 'diviser', 'partager', 'euclidienne'],
    place: 'pose',
    faire(r, { combien = 4 } = {}) {
      return Array.from({ length: combien }, () => {
        const b = entre(r, 2, 9);
        const q = entre(r, 11, 99);
        const reste = entre(r, 0, b - 1);
        const a = b * q + reste;
        return { enonce: `${a} ÷ ${b}`, reponse: `${q} reste ${reste}`, place: 'pose' };
      });
    }
  },
  {
    id: 'complements', nom: 'Compléments', niveaux: ['CE2', 'CM1'],
    mots: ['complement', 'complements', 'completer', 'combien pour aller'],
    place: 'case',
    faire(r, { combien = 15, niveau = 'CE2' } = {}) {
      const cible = niveau === 'CE2' ? [10, 100] : [100, 1000];
      return Array.from({ length: combien }, () => {
        const c = piocher(r, cible);
        const a = entre(r, 1, c - 1);
        return { enonce: `${a} + ..... = ${c}`, reponse: String(c - a), place: 'case' };
      });
    }
  },
  {
    id: 'doubles', nom: 'Doubles et moitiés', niveaux: ['CE2', 'CM1'],
    mots: ['double', 'doubles', 'moitie', 'moities'],
    place: 'case',
    faire(r, { combien = 16, niveau = 'CE2' } = {}) {
      const max = niveau === 'CE2' ? 50 : 500;
      return Array.from({ length: combien }, () => {
        const n = entre(r, 2, max);
        // La moitié n'est demandée que sur un nombre pair : sinon la réponse n'est pas
        // au programme, et l'exercice n'évalue plus ce qu'il croit évaluer.
        return r() < 0.5
          ? { enonce: `le double de ${n} =`, reponse: String(n * 2), place: 'case' }
          : { enonce: `la moitié de ${n * 2} =`, reponse: String(n), place: 'case' };
      });
    }
  },
  {
    id: 'comparer', nom: 'Comparer et ranger les nombres', niveaux: ['CE2', 'CM1'],
    mots: ['comparer', 'comparaison', 'ranger', 'ordre', 'plus grand', 'plus petit'],
    place: 'case',
    faire(r, { combien = 12, niveau = 'CE2' } = {}) {
      const max = niveau === 'CE2' ? 9999 : 999999;
      return Array.from({ length: combien }, () => {
        const a = entre(r, 100, max);
        const b = entre(r, 100, max);
        return { enonce: `${a} ..... ${b}`, reponse: a > b ? '>' : (a < b ? '<' : '='),
                 place: 'case' };
      });
    }
  },
  {
    id: 'decomposer', nom: 'Décomposer un nombre', niveaux: ['CE2', 'CM1'],
    mots: ['decomposer', 'decomposition', 'numeration', 'chiffre des', 'milliers'],
    place: 'ligne',
    faire(r, { combien = 8, niveau = 'CE2' } = {}) {
      const max = niveau === 'CE2' ? 9999 : 999999;
      return Array.from({ length: combien }, () => {
        const n = entre(r, 1000, max);
        const bouts = [];
        const s = String(n);
        for (let i = 0; i < s.length; i++) {
          const v = Number(s[i]) * (10 ** (s.length - 1 - i));
          if (v) bouts.push(String(v));
        }
        return { enonce: `${n} = `, reponse: bouts.join(' + '), place: 'ligne' };
      });
    }
  },
  {
    id: 'conversions', nom: 'Conversions de mesures', niveaux: ['CE2', 'CM1'],
    mots: ['conversion', 'conversions', 'convertir', 'mesure', 'mesures', 'longueur',
           'masse', 'contenance', 'metre', 'gramme', 'litre'],
    place: 'case',
    /*
     * Les facteurs sont écrits, pas calculés à la volée : une conversion fausse dans un
     * corrigé de mesures est invisible, et c'est le genre d'erreur qui se recopie.
     */
    faire(r, { combien = 12, niveau = 'CE2', famille = '' } = {}) {
      const FAMILLES = {
        longueur: [['km', 'm', 1000], ['m', 'cm', 100], ['m', 'dm', 10], ['cm', 'mm', 10],
                   ['m', 'mm', 1000]],
        masse: [['kg', 'g', 1000], ['t', 'kg', 1000], ['g', 'mg', 1000]],
        contenance: [['L', 'cL', 100], ['L', 'mL', 1000], ['L', 'dL', 10]]
      };
      const choix = famille && FAMILLES[famille]
        ? FAMILLES[famille]
        : Object.values(FAMILLES).flat();
      return Array.from({ length: combien }, () => {
        const [grand, petit, facteur] = piocher(r, choix);
        const n = entre(r, 1, niveau === 'CE2' ? 20 : 200);
        return r() < 0.6
          ? { enonce: `${n} ${grand} = ..... ${petit}`, reponse: String(n * facteur),
              place: 'case' }
          : { enonce: `${n * facteur} ${petit} = ..... ${grand}`, reponse: String(n),
              place: 'case' };
      });
    }
  },
  {
    id: 'durees', nom: 'Lire et calculer des durées', niveaux: ['CE2', 'CM1'],
    mots: ['duree', 'durees', 'heure', 'heures', 'minute', 'minutes', 'temps'],
    place: 'case',
    faire(r, { combien = 10 } = {}) {
      return Array.from({ length: combien }, () => {
        const h = entre(r, 7, 20);
        const m = entre(r, 0, 55);
        const duree = entre(r, 10, 120);
        const fin = h * 60 + m + duree;
        const dire = (t) => `${String(Math.floor(t / 60) % 24).padStart(2, '0')} h `
          + `${String(t % 60).padStart(2, '0')}`;
        return {
          enonce: `Il est ${dire(h * 60 + m)}. Dans ${duree} minutes, il sera :`,
          reponse: dire(fin), place: 'case'
        };
      });
    }
  },
  {
    id: 'perimetre', nom: 'Périmètres', niveaux: ['CM1'],
    mots: ['perimetre', 'perimetres', 'contour'],
    place: 'case',
    faire(r, { combien = 8 } = {}) {
      return Array.from({ length: combien }, () => {
        const L = entre(r, 3, 40);
        const l = entre(r, 2, L);
        return r() < 0.5
          ? { enonce: `Périmètre d'un rectangle de ${L} cm sur ${l} cm :`,
              reponse: `${2 * (L + l)} cm`, place: 'case' }
          : { enonce: `Périmètre d'un carré de côté ${L} cm :`,
              reponse: `${4 * L} cm`, place: 'case' };
      });
    }
  },
  {
    id: 'fractions', nom: 'Fractions simples', niveaux: ['CM1'],
    mots: ['fraction', 'fractions', 'demi', 'quart', 'tiers'],
    place: 'case',
    faire(r, { combien = 10 } = {}) {
      return Array.from({ length: combien }, () => {
        const d = piocher(r, [2, 3, 4, 5, 10]);
        const n = entre(r, 2, 12) * d;
        return { enonce: `${n === d ? 'Le' : 'Le'} ${{ 2: 'demi', 3: 'tiers', 4: 'quart',
          5: 'cinquième', 10: 'dixième' }[d]} de ${n} =`,
          reponse: String(n / d), place: 'case' };
      });
    }
  },
  {
    id: 'multiplier-10', nom: 'Multiplier par 10, 100, 1000', niveaux: ['CE2', 'CM1'],
    mots: ['par 10', 'par 100', 'par 1000', 'dizaine', 'centaine'],
    place: 'case',
    faire(r, { combien = 15, niveau = 'CE2' } = {}) {
      const facteurs = niveau === 'CE2' ? [10, 100] : [10, 100, 1000];
      return Array.from({ length: combien }, () => {
        const n = entre(r, 2, 99);
        const f = piocher(r, facteurs);
        return { enonce: `${n} × ${f} =`, reponse: String(n * f), place: 'case' };
      });
    }
  }
];

/** Un générateur par son identifiant. */
export const generateur = (id) => GENERATEURS.find((g) => g.id === id) || null;

/** Ce qui existe pour un niveau donné. Le CE2 ne voit pas les fractions du CM1. */
export const pourLeNiveau = (niveau) =>
  GENERATEURS.filter((g) => !niveau || g.niveaux.includes(niveau));

export default { semeur, GENERATEURS, generateur, pourLeNiveau, PLACES };
