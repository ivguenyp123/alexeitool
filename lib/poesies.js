/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LE PROGRAMME DE POÉSIES — UNE PAR SEMAINE, ET AUCUN TEXTE RECOPIÉ
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Une poésie par semaine, trente-six semaines. Ce qui coûte à l'enseignant, ce n'est pas
 * de trouver le texte — il le trouve en dix secondes — c'est de DÉCIDER : laquelle,
 * quand, pour quel niveau, et sans se répéter d'une année sur l'autre.
 *
 * C'est donc ça qu'on rend : un programme d'année. Le texte se récupère et s'imprime.
 *
 * ── POURQUOI AUCUN TEXTE N'EST ÉCRIT ICI ────────────────────────────────────
 *
 * Deux raisons, et chacune suffirait.
 *
 * LA PREMIÈRE EST JURIDIQUE. Un poème reste protégé soixante-dix ans après la mort de
 * son auteur. Les deux poètes les plus récités à l'école — Jacques Prévert (mort en
 * 1977) et Maurice Carême (1978) — le sont jusqu'en 2048 et 2049. Les recopier dans un
 * fichier public serait de la contrefaçon. Les NOMMER ne l'est pas : une référence
 * n'est pas une reproduction, et c'est de la référence qu'on a besoin.
 *
 * LA SECONDE EST CELLE DE TOUT LE PROJET. Un texte récité de mémoire par un modèle
 * revient avec un vers changé, une strophe manquante, un mot moderne à la place d'un
 * mot ancien. Et personne ne le vérifie, parce qu'un poème « a l'air » juste. Une classe
 * apprendrait par cœur une version fausse pendant trois semaines.
 *
 * `domainePublic` dit, pour chaque entrée, si le texte est libre de droits — l'enseignant
 * peut alors le photocopier sans se poser de question. Sinon, c'est l'usage pédagogique
 * qui s'applique, et c'est à lui de trancher.
 */

/** Trente-six semaines, comme les listes de mots. */
export const SEMAINES = 36;

/**
 * Un auteur est dans le domaine public soixante-dix ans après sa mort.
 *
 * Le calcul est FAIT, pas recopié : une date qu'on tape à côté d'un nom se désynchronise
 * au premier ajout, et « libre de droits » est exactement l'affirmation qu'on ne veut
 * pas voir devenir fausse en silence.
 */
export const DUREE_PROTECTION = 70;
export const libre = (mort, annee = new Date().getFullYear()) =>
  Boolean(mort) && annee > mort + DUREE_PROTECTION;

/*
 * ── UNE SEMAINE PORTE LES DEUX NIVEAUX ──────────────────────────────────────
 *
 * Première version : une poésie par semaine, réservée à un niveau quand elle était trop
 * difficile. Résultat, onze semaines vides au CE2 — un programme d'année troué, donc un
 * programme qu'on n'utilise pas.
 *
 * Et c'était surtout faux pour cette classe-là : dans un CE2-CM1, les deux groupes
 * n'apprennent pas la même poésie. Chaque semaine porte donc les deux, côte à côte.
 * Quand c'est le même poème pour tout le monde — ça arrive, et c'est un bon moment de
 * classe — la ligne le dit.
 */
const A = (titre, auteur, mort, pour) => ({ titre, auteur, mort, pour });
const S = (semaine, ce2, cm1) => ({ semaine, CE2: ce2, CM1: cm1 || ce2, commun: !cm1 });

export const ANNEE = [
  /* ── Période 1 : la rentrée, l'automne ─────────────────────────────────── */
  S(1, A('La rentrée', 'Anonyme (comptine)', 0, 'très courte, à dire dès le premier jour'),
       A('L\'écolier', 'Maurice Fombeure', 1981, 'l\'école vue de l\'intérieur')),
  S(2, A('Automne', 'Guillaume Apollinaire', 1918, 'six vers, une seule image tenue'),
       A('Chanson d\'automne', 'Paul Verlaine', 1896, 'la musique des vers avant le sens')),
  S(3, A('La fourmi', 'Robert Desnos', 1945, 'quatre vers, un impossible — le plus sûr des débuts'),
       A('Le pélican', 'Robert Desnos', 1945, 'la répétition sans fin, à mémoriser en riant')),
  S(4, A('Les hiboux', 'Robert Desnos', 1945, 'les jeux de sons, à dire de plus en plus vite')),
  S(5, A('L\'écureuil', 'Maurice Carême', 1978, 'un animal, des images simples'),
       A('Le cancre', 'Jacques Prévert', 1977, 'à discuter autant qu\'à apprendre')),
  S(6, A('Pomme et poire', 'Luc Bérimont', 1983, 'la comptine, le rythme'),
       A('Le hareng saur', 'Charles Cros', 1888, 'l\'absurde tenu jusqu\'au bout')),
  S(7, A('Novembre', 'Anonyme', 0, 'la pluie, les jours courts'),
       A('Le dormeur du val', 'Arthur Rimbaud', 1891, 'à expliquer avant — le dernier vers renverse tout')),

  /* ── Période 2 : l'hiver, Noël ─────────────────────────────────────────── */
  S(8, A('Il a neigé', 'Maurice Carême', 1978, 'très courte, très visuelle'),
       A('Hiver', 'Théophile Gautier', 1872, 'le froid, le gel, un vocabulaire riche')),
  S(9, A('La neige', 'Anonyme', 0, 'à dire à deux voix')),
  S(10, A('Noël', 'Théophile Gautier', 1872, 'de saison, et libre de droits')),
  S(11, A('Chanson pour les enfants l\'hiver', 'Jacques Prévert', 1977, 'le bonhomme de neige'),
        A('Déjeuner du matin', 'Jacques Prévert', 1977, 'un récit entier sans un seul adjectif')),
  S(12, A('Les sapins', 'Guillaume Apollinaire', 1918, 'avant les vacances')),

  /* ── Période 3 : janvier-février ───────────────────────────────────────── */
  S(13, A('Le corbeau et le renard', 'Jean de La Fontaine', 1695, 'la fable : dialogue et morale')),
  S(14, A('Le lièvre et la tortue', 'Jean de La Fontaine', 1695, 'plus longue — à apprendre en deux fois')),
  S(15, A('Le rat de ville et le rat des champs', 'Jean de La Fontaine', 1695, 'deux personnages, deux vies'),
        A('La cigale et la fourmi', 'Jean de La Fontaine', 1695, 'celle que tout le monde croit connaître')),
  S(16, A('Chanson', 'Paul Fort', 1960, 'le refrain, la ronde')),
  S(17, A('Le chat et l\'oiseau', 'Jacques Prévert', 1977, 'court, et cruel'),
        A('Pour faire le portrait d\'un oiseau', 'Jacques Prévert', 1977, 'longue et magnifique — à découper')),
  S(18, A('Dans Paris', 'Paul Éluard', 1952, 'l\'emboîtement, facile à retenir'),
        A('Le dromadaire mécontent', 'Jacques Prévert', 1977, 'un récit en prose, pour changer')),
  S(19, A('Le petit chat blanc', 'Claude Roy', 1997, 'les rimes, l\'absurde'),
        A('Le buffet', 'Arthur Rimbaud', 1891, 'un objet regardé longtemps')),

  /* ── Période 4 : le printemps ──────────────────────────────────────────── */
  S(20, A('Le printemps', 'Théodore de Banville', 1891, 'le retour du beau temps')),
  S(21, A('Le temps a laissé son manteau', 'Charles d\'Orléans', 1465, 'le français d\'avant, et ça s\'entend')),
  S(22, A('Chanson de mars', 'Anonyme', 0, 'courte, à chanter'),
        A('Demain, dès l\'aube', 'Victor Hugo', 1885, 'le plus célèbre — à expliquer avant de l\'apprendre')),
  S(23, A('Les papillons', 'Gérard de Nerval', 1855, 'les images, la légèreté')),
  S(24, A('La ronde autour du monde', 'Paul Fort', 1960, 'la fraternité, à dire en cercle')),
  S(25, A('Le cartable', 'Pierre Gamarra', 2009, 'l\'école, l\'objet quotidien'),
        A('Le cageot', 'Francis Ponge', 1988, 'un objet ordinaire regardé de très près')),
  S(26, A('Le pommier', 'Anonyme', 0, 'la nature, à illustrer'),
        A('Il pleure dans mon cœur', 'Paul Verlaine', 1896, 'la musique avant tout')),
  S(27, A('L\'arbre', 'Anonyme', 0, 'à mimer'),
        A('Liberté', 'Paul Éluard', 1952, 'UN EXTRAIT seulement — le poème entier est très long')),

  /* ── Période 5 : mai, juin, la fin ─────────────────────────────────────── */
  S(28, A('Le petit poisson et le pêcheur', 'Jean de La Fontaine', 1695, 'courte pour une fable')),
  S(29, A('Le laboureur et ses enfants', 'Jean de La Fontaine', 1695, 'la morale se discute longtemps')),
  S(30, A('Chanson de la Seine', 'Jacques Prévert', 1977, 'le fleuve, la ville'),
        A('Le message', 'Jacques Prévert', 1977, 'sept vers, une histoire entière')),
  S(31, A('Le cancre heureux', 'Anonyme', 0, 'l\'humour de fin d\'année'),
        A('Le pont Mirabeau', 'Guillaume Apollinaire', 1918, 'le refrain, le temps qui passe')),
  S(32, A('Juin', 'Anonyme', 0, 'l\'été qui arrive')),
  S(33, A('Les hirondelles', 'Anonyme', 0, 'le départ, la migration')),
  S(34, A('L\'école', 'Maurice Carême', 1978, 'la classe, l\'année qui se termine')),
  S(35, A('Les vacances', 'Anonyme', 0, 'courte et joyeuse, la dernière ligne droite')),
  S(36, A('Le bonheur', 'Paul Fort', 1960, 'pour finir sur autre chose qu\'un exercice'))
];

/**
 * La poésie d'une semaine, avec son statut de droits calculé.
 *
 * `aVerifier` marque les entrées dont l'auteur est anonyme ou la date incertaine : ce
 * n'est pas une alerte, c'est une invitation à regarder avant de photocopier trente fois.
 */
export function laPoesie(semaine, { niveau = 'CE2', annee = new Date().getFullYear() } = {}) {
  const s = ANNEE[Number(semaine) - 1];
  const p = s && s[niveau];
  if (!p) return null;
  return {
    semaine: s.semaine, niveau, commun: s.commun, ...p,
    domainePublic: p.mort === 0 ? null : libre(p.mort, annee),
    // Une entrée sans date d'auteur ne peut pas être tranchée par le calcul.
    aVerifier: p.mort === 0,
    ou: `Cherche « ${p.titre}${p.auteur.startsWith('Anonyme') ? '' : ` ${p.auteur}`} » — le `
      + 'texte est partout sur internet. Vérifie-le sur deux sources avant de l\'imprimer.'
  };
}

/** L'année entière pour un niveau. Une semaine vide serait un trou : il n'y en a pas. */
export const lAnnee = (niveau = 'CE2', options = {}) =>
  Array.from({ length: SEMAINES }, (_, i) => laPoesie(i + 1, { ...options, niveau }))
    .filter(Boolean);

/** Les deux niveaux côte à côte — c'est la forme d'une fiche pour un double niveau. */
export const lAnneeDouble = (options = {}) => ANNEE.map((s) => ({
  semaine: s.semaine, commun: s.commun,
  CE2: laPoesie(s.semaine, { ...options, niveau: 'CE2' }),
  CM1: laPoesie(s.semaine, { ...options, niveau: 'CM1' })
}));

/**
 * Ce qui n'est pas libre de droits, nommé.
 *
 * Ce n'est pas un interdit : l'usage en classe d'un poème protégé relève des accords
 * conclus par l'Éducation nationale, et c'est à l'enseignant d'en juger. Mais il doit
 * pouvoir le SAVOIR, plutôt que de le découvrir. Prévert et Carême sont les deux poètes
 * les plus récités de l'école primaire, et ce sont précisément les deux qui posent la
 * question.
 */
export function protegees(annee = new Date().getFullYear()) {
  const out = [];
  const vus = new Set();
  for (const s of ANNEE) {
    for (const niveau of ['CE2', 'CM1']) {
      const p = s[niveau];
      const cle = `${p.titre}|${p.auteur}`;
      if (!p.mort || libre(p.mort, annee) || vus.has(cle)) continue;
      vus.add(cle);
      out.push({ semaine: s.semaine, titre: p.titre, auteur: p.auteur,
                 libreEn: p.mort + DUREE_PROTECTION + 1 });
    }
  }
  return out;
}

export default { SEMAINES, DUREE_PROTECTION, ANNEE, libre, laPoesie, lAnnee,
                 lAnneeDouble, protegees };
