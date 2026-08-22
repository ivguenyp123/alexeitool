/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  LES LISTES DE MOTS — CINQ PAR JOUR, TRENTE-SIX SEMAINES
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * C'est le rituel le plus régulier de l'école élémentaire : une liste par semaine,
 * apprise cinq mots par jour, dictée le vendredi. Il en faut trente-six par niveau, et
 * les fabriquer à la main prend une soirée qu'on n'a pas.
 *
 * ── ELLES SONT GROUPÉES PAR RÈGLE, PAS PAR HASARD ───────────────────────────
 *
 * Une liste de mots tirés au sort n'apprend rien : l'enfant les mémorise un par un et
 * oublie tout en octobre. Une liste qui porte UNE régularité — le son [ɛ] écrit « ai »,
 * le pluriel en -aux, les mots en -tion — s'apprend d'un bloc et se transfère.
 *
 * Chaque semaine porte donc son intitulé, et l'intitulé est ce que l'enseignant dira à
 * voix haute le lundi.
 *
 * ── CE QUE CE FICHIER N'EST PAS ─────────────────────────────────────────────
 *
 * Ce n'est PAS l'échelle Dubois-Buyse, ni aucune liste officielle. C'est un choix de
 * mots courants, organisés par régularité orthographique, à corriger librement : les
 * mots d'une classe dépendent de ce qu'on y lit.
 *
 * On le dit franchement plutôt que de laisser croire à une référence. Une liste
 * présentée comme officielle et qui ne l'est pas est exactement le genre d'affirmation
 * que le reste de l'outil passe son temps à empêcher.
 */

/** Trente-six semaines de classe : c'est la longueur d'une année scolaire. */
export const SEMAINES = 36;

/** Cinq mots par jour, quatre jours d'apprentissage, dictée le cinquième. */
export const PAR_JOUR = 5;

const L = (regle, mots) => ({ regle, mots });

/*
 * ── CE2 ─────────────────────────────────────────────────────────────────────
 *
 * Vingt mots par semaine : quatre jours de cinq. L'ordre suit l'année — les sons
 * simples en septembre, les homophones et les pluriels irréguliers au printemps.
 */
export const CE2 = [
  L('Les jours et les mois', ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche', 'janvier', 'février', 'mars', 'avril', 'juillet', 'septembre', 'octobre', 'novembre', 'décembre', 'semaine', 'année', 'matin', 'soir']),
  L('Le son [o] : o, au, eau', ['gâteau', 'bateau', 'chapeau', 'cadeau', 'oiseau', 'château', 'chaud', 'jaune', 'aussi', 'gauche', 'sauter', 'épaule', 'domino', 'vélo', 'métro', 'photo', 'numéro', 'stylo', 'moto', 'zéro']),
  L('Le son [ɛ] : è, ê, ai, ei', ['père', 'mère', 'frère', 'règle', 'fenêtre', 'forêt', 'tête', 'fête', 'maison', 'semaine', 'faire', 'plaire', 'aigle', 'laine', 'peigne', 'neige', 'reine', 'treize', 'seize', 'baleine']),
  L('Le son [s] : s, ss, c, ç', ['saison', 'souris', 'poisson', 'boisson', 'classe', 'tasse', 'cerise', 'ciel', 'citron', 'cinéma', 'garçon', 'leçon', 'français', 'balançoire', 'maçon', 'danse', 'penser', 'chanson', 'passer', 'assez']),
  L('Le son [k] : c, qu, k', ['carte', 'canard', 'cuisine', 'école', 'quatre', 'quinze', 'quand', 'question', 'banque', 'brique', 'casque', 'musique', 'kilo', 'képi', 'koala', 'coq', 'sac', 'lac', 'parc', 'avec']),
  L('Le son [ʒ] : j, g, ge', ['jardin', 'jaune', 'jouet', 'joli', 'jeudi', 'girafe', 'genou', 'gentil', 'geste', 'nager', 'manger', 'plonger', 'ranger', 'pigeon', 'bourgeon', 'plongeon', 'orange', 'village', 'image', 'nuage']),
  L('Les mots invariables (1)', ['aujourd\'hui', 'demain', 'hier', 'toujours', 'jamais', 'souvent', 'parfois', 'beaucoup', 'assez', 'trop', 'très', 'bien', 'mal', 'vite', 'lentement', 'encore', 'déjà', 'bientôt', 'longtemps', 'ensuite']),
  L('Le son [ɑ̃] : an, en, am, em', ['enfant', 'maman', 'grand', 'blanc', 'dent', 'vent', 'temps', 'content', 'chambre', 'jambe', 'lampe', 'ampoule', 'ensemble', 'novembre', 'décembre', 'trembler', 'entendre', 'attendre', 'pendant', 'souvent']),
  L('Le son [ɔ̃] : on, om', ['maison', 'saison', 'garçon', 'bonbon', 'chanson', 'poisson', 'nombre', 'ombre', 'tomber', 'pompier', 'compter', 'plombier', 'monter', 'monde', 'ronde', 'onze', 'concours', 'content', 'longtemps', 'bonjour']),
  L('Le son [ɛ̃] : in, ain, ein', ['matin', 'jardin', 'lapin', 'sapin', 'moulin', 'dessin', 'main', 'pain', 'bain', 'train', 'demain', 'certain', 'peintre', 'ceinture', 'plein', 'frein', 'timbre', 'simple', 'important', 'intéressant']),
  L('Les lettres muettes finales', ['petit', 'grand', 'chaud', 'froid', 'gris', 'gros', 'long', 'rond', 'blanc', 'franc', 'tapis', 'souris', 'nid', 'pied', 'doigt', 'poing', 'sang', 'dent', 'nuit', 'lit']),
  L('Le pluriel en -s et en -x', ['bateaux', 'gâteaux', 'chapeaux', 'oiseaux', 'châteaux', 'cadeaux', 'jeux', 'cheveux', 'feux', 'lieux', 'genoux', 'bijoux', 'cailloux', 'choux', 'hiboux', 'joujoux', 'poux', 'clous', 'trous', 'fous']),
  L('Le son [j] : ill, y, i', ['famille', 'fille', 'bille', 'grille', 'papillon', 'coquillage', 'travailler', 'réveiller', 'feuille', 'bouteille', 'abeille', 'soleil', 'conseil', 'appareil', 'crayon', 'rayon', 'voyage', 'moyen', 'yeux', 'noyau']),
  L('Les mots invariables (2)', ['dans', 'sans', 'sous', 'sur', 'vers', 'chez', 'pour', 'avec', 'contre', 'entre', 'depuis', 'pendant', 'avant', 'après', 'devant', 'derrière', 'dehors', 'dedans', 'ailleurs', 'partout']),
  L('a / à — et / est', ['il a', 'elle a', 'à la maison', 'à midi', 'à côté', 'il est', 'elle est', 'c\'est', 'et puis', 'papa et maman', 'on a', 'on est', 'a mangé', 'a couru', 'à l\'école', 'à pied', 'est parti', 'est tombé', 'et voilà', 'et alors']),
  L('Le son [f] : f, ff, ph', ['fenêtre', 'facile', 'fromage', 'confiture', 'girafe', 'chiffre', 'coiffure', 'effacer', 'difficile', 'offrir', 'photo', 'téléphone', 'éléphant', 'phrase', 'pharmacie', 'orthographe', 'dauphin', 'phoque', 'alphabet', 'géographie']),
  L('Le son [z] : s entre voyelles, z', ['maison', 'saison', 'cousin', 'chose', 'rose', 'chemise', 'valise', 'oiseau', 'raisin', 'poison', 'zéro', 'zoo', 'zèbre', 'gazon', 'bizarre', 'douze', 'onze', 'treize', 'quatorze', 'quinze']),
  L('Les mots de la classe', ['cahier', 'classeur', 'crayon', 'gomme', 'règle', 'ciseaux', 'colle', 'trousse', 'cartable', 'ardoise', 'tableau', 'affiche', 'leçon', 'exercice', 'dictée', 'lecture', 'récréation', 'maître', 'maîtresse', 'directeur']),
  L('Le son [g] : g, gu', ['gare', 'gomme', 'gâteau', 'goûter', 'légume', 'figure', 'guitare', 'guépard', 'guerre', 'baguette', 'guichet', 'longue', 'langue', 'bague', 'vague', 'blague', 'dialogue', 'catalogue', 'guirlande', 'déguisement']),
  L('Le féminin des adjectifs', ['grand / grande', 'petit / petite', 'joli / jolie', 'noir / noire', 'vert / verte', 'gris / grise', 'gros / grosse', 'bas / basse', 'gentil / gentille', 'pareil / pareille', 'heureux / heureuse', 'peureux / peureuse', 'premier / première', 'dernier / dernière', 'léger / légère', 'cher / chère', 'neuf / neuve', 'vif / vive', 'long / longue', 'blanc / blanche']),
  L('Le son [wa] : oi, oy', ['oiseau', 'poisson', 'boîte', 'étoile', 'histoire', 'armoire', 'mémoire', 'devoir', 'savoir', 'pouvoir', 'noir', 'soir', 'froid', 'droit', 'toit', 'roi', 'voix', 'noyer', 'nettoyer', 'voyage']),
  L('Les mots en -tion et -sion', ['attention', 'récréation', 'addition', 'question', 'opération', 'invitation', 'punition', 'direction', 'collection', 'information', 'situation', 'population', 'décision', 'télévision', 'occasion', 'permission', 'expression', 'discussion', 'passion', 'mission']),
  L('Le son [ø] et [œ] : eu, œu', ['jeu', 'feu', 'cheveux', 'heureux', 'deux', 'bleu', 'peu', 'mieux', 'fleur', 'couleur', 'chaleur', 'malheur', 'beurre', 'heure', 'peur', 'sœur', 'cœur', 'bœuf', 'œuf', 'nœud']),
  L('Les verbes du quotidien', ['aller', 'venir', 'faire', 'dire', 'prendre', 'mettre', 'voir', 'savoir', 'pouvoir', 'vouloir', 'devoir', 'partir', 'sortir', 'dormir', 'écrire', 'lire', 'boire', 'croire', 'ouvrir', 'offrir']),
  L('Les doubles consonnes', ['pomme', 'homme', 'flamme', 'comme', 'donner', 'bonne', 'année', 'ennui', 'appeler', 'apporter', 'attendre', 'attention', 'ballon', 'aller', 'belle', 'nouvelle', 'terre', 'verre', 'erreur', 'arrêter']),
  L('Les animaux', ['chien', 'chat', 'cheval', 'vache', 'mouton', 'cochon', 'poule', 'canard', 'lapin', 'souris', 'écureuil', 'renard', 'hérisson', 'grenouille', 'papillon', 'araignée', 'fourmi', 'abeille', 'escargot', 'poisson']),
  L('Le son [ə] et l\'accent aigu', ['école', 'élève', 'été', 'épée', 'étoile', 'éléphant', 'télévision', 'téléphone', 'récréation', 'départ', 'début', 'décembre', 'métier', 'métro', 'menu', 'petit', 'venir', 'tenir', 'devoir', 'cheval']),
  L('son / sont — on / ont', ['son cahier', 'son frère', 'ils sont', 'elles sont', 'on part', 'on mange', 'ils ont', 'elles ont', 'son ballon', 'sont partis', 'on écrit', 'ont mangé', 'son nom', 'sont arrivés', 'on joue', 'ont couru', 'son école', 'sont contents', 'on regarde', 'ont vu']),
  L('Le corps', ['tête', 'cheveux', 'oreille', 'bouche', 'nez', 'dent', 'langue', 'cou', 'épaule', 'bras', 'coude', 'main', 'doigt', 'ongle', 'jambe', 'genou', 'pied', 'talon', 'dos', 'ventre']),
  L('Les mots en -eur et -eure', ['docteur', 'facteur', 'directeur', 'professeur', 'chanteur', 'joueur', 'coiffeur', 'agriculteur', 'ordinateur', 'ascenseur', 'couleur', 'chaleur', 'douleur', 'odeur', 'fleur', 'peur', 'heure', 'demeure', 'meilleure', 'majeure']),
  L('La maison', ['cuisine', 'chambre', 'salon', 'couloir', 'escalier', 'fenêtre', 'porte', 'toit', 'mur', 'plafond', 'armoire', 'placard', 'fauteuil', 'canapé', 'tiroir', 'miroir', 'lampe', 'rideau', 'tapis', 'jardin']),
  L('Le passé : é ou er', ['il a mangé', 'il va manger', 'elle a chanté', 'elle veut chanter', 'j\'ai trouvé', 'je dois trouver', 'nous avons joué', 'nous allons jouer', 'ils ont travaillé', 'ils vont travailler', 'tu as regardé', 'tu peux regarder', 'j\'ai dessiné', 'je vais dessiner', 'on a rangé', 'on doit ranger', 'elle a parlé', 'elle sait parler', 'il a sauté', 'il veut sauter']),
  L('La nature', ['arbre', 'branche', 'feuille', 'racine', 'fleur', 'herbe', 'forêt', 'rivière', 'ruisseau', 'montagne', 'colline', 'vallée', 'champ', 'prairie', 'sentier', 'rocher', 'sable', 'plage', 'nuage', 'orage']),
  L('Les nombres en lettres', ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'vingt', 'trente', 'quarante', 'cinquante', 'cent']),
  L('Les mots invariables (3)', ['alors', 'donc', 'mais', 'ou', 'car', 'puis', 'enfin', 'surtout', 'peut-être', 'presque', 'plutôt', 'autour', 'ainsi', 'aussitôt', 'quelquefois', 'autrefois', 'désormais', 'cependant', 'pourtant', 'lorsque']),
  L('Révision de l\'année', ['aujourd\'hui', 'beaucoup', 'toujours', 'attention', 'question', 'récréation', 'famille', 'travailler', 'monsieur', 'madame', 'quelqu\'un', 'personne', 'quelque chose', 'tellement', 'vraiment', 'heureusement', 'malheureusement', 'certainement', 'rapidement', 'lentement'])
];

/*
 * ── CM1 ─────────────────────────────────────────────────────────────────────
 *
 * Le CM1 ouvre le cycle 3 : les listes portent moins sur les sons — supposés acquis —
 * et davantage sur la MORPHOLOGIE. Familles de mots, préfixes, suffixes, homophones
 * grammaticaux, accords difficiles. Ce n'est pas « la même chose en plus long ».
 */
export const CM1 = [
  L('Les mots invariables à revoir', ['aujourd\'hui', 'toujours', 'jamais', 'souvent', 'parfois', 'beaucoup', 'assez', 'plutôt', 'presque', 'surtout', 'pourtant', 'cependant', 'néanmoins', 'aussitôt', 'désormais', 'autrefois', 'longtemps', 'davantage', 'volontiers', 'également']),
  L('La famille du mot « terre »', ['terre', 'terrain', 'terrasse', 'terrier', 'atterrir', 'enterrer', 'déterrer', 'souterrain', 'territoire', 'terrestre', 'méditerranée', 'terreau', 'parterre', 'terrien', 'extraterrestre', 'terrassier', 'atterrissage', 'enterrement', 'territorial', 'terrifiant']),
  L('Les préfixes in-, im-, ir-, il-', ['inutile', 'incapable', 'invisible', 'inconnu', 'impossible', 'impatient', 'imprudent', 'immobile', 'irrégulier', 'irréel', 'irrésistible', 'irrespirable', 'illisible', 'illégal', 'illimité', 'illogique', 'malheureux', 'maladroit', 'désordre', 'désagréable']),
  L('Les suffixes -ment', ['rapidement', 'lentement', 'doucement', 'facilement', 'difficilement', 'heureusement', 'malheureusement', 'certainement', 'probablement', 'évidemment', 'prudemment', 'violemment', 'patiemment', 'récemment', 'fréquemment', 'apparemment', 'vraiment', 'gentiment', 'énormément', 'précisément']),
  L('ce / se — ces / ses', ['ce matin', 'ce livre', 'se lever', 'se laver', 'ces enfants', 'ces livres', 'ses parents', 'ses affaires', 'ce chemin', 'se souvenir', 'ces jours', 'ses amis', 'ce moment', 'se dépêcher', 'ces maisons', 'ses cheveux', 'ce garçon', 'se taire', 'ces fleurs', 'ses mains']),
  L('Le pluriel en -aux et -eux', ['journal / journaux', 'animal / animaux', 'cheval / chevaux', 'hôpital / hôpitaux', 'général / généraux', 'canal / canaux', 'signal / signaux', 'végétal / végétaux', 'métal / métaux', 'bocal / bocaux', 'travail / travaux', 'vitrail / vitraux', 'corail / coraux', 'émail / émaux', 'bail / baux', 'bal / bals', 'carnaval / carnavals', 'festival / festivals', 'récital / récitals', 'chacal / chacals']),
  L('Les mots en -ail, -eil, -euil', ['travail', 'détail', 'éventail', 'portail', 'chandail', 'soleil', 'réveil', 'conseil', 'appareil', 'orteil', 'fauteuil', 'écureuil', 'chevreuil', 'seuil', 'deuil', 'accueil', 'recueil', 'cercueil', 'orgueil', 'feuille']),
  L('La famille du mot « port »', ['port', 'porte', 'porter', 'apporter', 'emporter', 'rapporter', 'transporter', 'supporter', 'reporter', 'exporter', 'importer', 'déporter', 'portable', 'portail', 'portefeuille', 'porteur', 'portière', 'transport', 'importance', 'important']),
  L('Le son [j] difficile', ['bataille', 'muraille', 'volaille', 'ferraille', 'grenouille', 'citrouille', 'nouille', 'brouillard', 'chatouiller', 'gribouiller', 'bouillon', 'billet', 'quille', 'chenille', 'vanille', 'béquille', 'coquillage', 'gaspiller', 'briller', 'habiller']),
  L('Les homophones : mais / mes / met', ['mais oui', 'mais non', 'mes parents', 'mes affaires', 'il met', 'elle met', 'mets la table', 'un mets', 'mais alors', 'mes amis', 'il met son manteau', 'mais pourtant', 'mes cahiers', 'elle met du temps', 'mais enfin', 'mes chaussures', 'il met le couvert', 'mais bien sûr', 'mes voisins', 'mets-toi là']),
  L('Les mots en -ance et -ence', ['confiance', 'méfiance', 'distance', 'assistance', 'importance', 'ressemblance', 'connaissance', 'naissance', 'puissance', 'croissance', 'patience', 'prudence', 'silence', 'science', 'conscience', 'expérience', 'différence', 'préférence', 'présence', 'absence']),
  L('La famille du mot « chant »', ['chant', 'chanter', 'chanteur', 'chanteuse', 'chanson', 'chantonner', 'enchanter', 'enchanté', 'déchanter', 'chantier', 'cantatrice', 'incantation', 'chorale', 'chœur', 'refrain', 'couplet', 'mélodie', 'harmonie', 'musique', 'instrument']),
  L('Les verbes en -eler et -eter', ['appeler', 'j\'appelle', 'nous appelons', 'rappeler', 'jeter', 'je jette', 'nous jetons', 'rejeter', 'geler', 'il gèle', 'congeler', 'peler', 'acheter', 'j\'achète', 'racheter', 'épeler', 'ficeler', 'renouveler', 'étinceler', 'feuilleter']),
  L('Les mots avec h', ['heure', 'heureux', 'histoire', 'hiver', 'homme', 'hôpital', 'horloge', 'hôtel', 'humide', 'habitude', 'hasard', 'haricot', 'hibou', 'hérisson', 'hauteur', 'thé', 'théâtre', 'thermomètre', 'rythme', 'cahier']),
  L('on / ont — son / sont — a / à', ['on part', 'ils ont', 'son livre', 'ils sont', 'il a', 'à midi', 'on croit', 'elles ont eu', 'son idée', 'elles sont là', 'elle a vu', 'à travers', 'on dirait', 'ont compris', 'son avis', 'sont revenus', 'a répondu', 'à peine', 'on verra', 'ont décidé']),
  L('Les mots de la géographie', ['continent', 'océan', 'montagne', 'plaine', 'plateau', 'vallée', 'fleuve', 'rivière', 'affluent', 'frontière', 'région', 'département', 'commune', 'capitale', 'population', 'climat', 'paysage', 'agriculture', 'industrie', 'territoire']),
  L('Le participe passé en -é / -i / -u', ['mangé', 'chanté', 'trouvé', 'donné', 'parlé', 'fini', 'grandi', 'choisi', 'rempli', 'sorti', 'vu', 'lu', 'bu', 'cru', 'venu', 'tenu', 'couru', 'perdu', 'entendu', 'attendu']),
  L('Les mots en -oir et -oire', ['devoir', 'savoir', 'pouvoir', 'vouloir', 'miroir', 'couloir', 'trottoir', 'arrosoir', 'histoire', 'mémoire', 'victoire', 'armoire', 'mâchoire', 'baignoire', 'écritoire', 'laboratoire', 'territoire', 'observatoire', 'obligatoire', 'provisoire']),
  L('La famille du mot « lire »', ['lire', 'lecture', 'lecteur', 'lisible', 'illisible', 'relire', 'élire', 'élection', 'relecture', 'lisiblement', 'livre', 'librairie', 'libraire', 'bibliothèque', 'littérature', 'roman', 'récit', 'chapitre', 'paragraphe', 'poésie']),
  L('Les mots en -eux / -euse', ['heureux / heureuse', 'nombreux / nombreuse', 'dangereux / dangereuse', 'courageux / courageuse', 'curieux / curieuse', 'sérieux / sérieuse', 'silencieux / silencieuse', 'délicieux / délicieuse', 'précieux / précieuse', 'joyeux / joyeuse', 'peureux / peureuse', 'paresseux / paresseuse', 'chanceux / chanceuse', 'orageux / orageuse', 'boueux / boueuse', 'neigeux / neigeuse', 'creux / creuse', 'affreux / affreuse', 'généreux / généreuse', 'ennuyeux / ennuyeuse']),
  L('Les mots de la science', ['expérience', 'observation', 'mesure', 'résultat', 'matière', 'liquide', 'solide', 'gaz', 'énergie', 'électricité', 'lumière', 'chaleur', 'température', 'volume', 'masse', 'squelette', 'muscle', 'organe', 'digestion', 'respiration']),
  L('leur / leurs', ['leur maison', 'leurs maisons', 'leur ballon', 'leurs ballons', 'je leur parle', 'leur cartable', 'leurs cartables', 'je leur donne', 'leur maître', 'leurs parents', 'on leur explique', 'leur classe', 'leurs affaires', 'il leur montre', 'leur chien', 'leurs chiens', 'nous leur écrivons', 'leur avis', 'leurs idées', 'elle leur répond']),
  L('Les mots en -et, -ait, -aie', ['jouet', 'paquet', 'bouquet', 'ticket', 'carnet', 'sifflet', 'il faisait', 'elle chantait', 'nous allions', 'j\'avais', 'la craie', 'la baie', 'la haie', 'la monnaie', 'la plaie', 'le portrait', 'le trait', 'le lait', 'l\'extrait', 'le souhait']),
  L('La famille du mot « nombre »', ['nombre', 'nombreux', 'dénombrer', 'innombrable', 'numéro', 'numéroter', 'numérique', 'numération', 'compter', 'comptable', 'comptine', 'décompte', 'calcul', 'calculer', 'calculatrice', 'chiffre', 'chiffrer', 'total', 'somme', 'quantité']),
  L('Les mots en -tion difficiles', ['addition', 'soustraction', 'multiplication', 'division', 'opération', 'solution', 'situation', 'population', 'circulation', 'construction', 'production', 'destruction', 'invention', 'attention', 'intention', 'récréation', 'respiration', 'alimentation', 'organisation', 'explication']),
  L('ou / où — la / là / l\'a', ['ou bien', 'où vas-tu', 'ici ou là', 'où habites-tu', 'la maison', 'là-bas', 'il l\'a vu', 'la porte', 'là-haut', 'elle l\'a dit', 'ou alors', 'd\'où viens-tu', 'la classe', 'celui-là', 'il l\'a pris', 'ou plutôt', 'là où', 'la récréation', 'jusque-là', 'on l\'a trouvé']),
  L('Les mots de l\'histoire', ['siècle', 'époque', 'préhistoire', 'antiquité', 'Moyen Âge', 'Renaissance', 'révolution', 'roi', 'reine', 'seigneur', 'château', 'chevalier', 'monument', 'vestige', 'archéologue', 'document', 'témoignage', 'chronologie', 'frise', 'événement']),
  L('Les verbes irréguliers au présent', ['je vais', 'tu vas', 'il va', 'nous allons', 'vous allez', 'ils vont', 'je fais', 'nous faisons', 'vous faites', 'ils font', 'je peux', 'nous pouvons', 'ils peuvent', 'je veux', 'nous voulons', 'ils veulent', 'je prends', 'nous prenons', 'ils prennent', 'je viens']),
  L('Les mots en -é, -ée, -er', ['la journée', 'la matinée', 'la soirée', 'l\'année', 'la pensée', 'l\'idée', 'l\'entrée', 'la dictée', 'le musée', 'le lycée', 'le cahier', 'le grenier', 'le panier', 'l\'escalier', 'le calendrier', 'le boulanger', 'le fermier', 'le pompier', 'le quartier', 'le sentier']),
  L('La famille du mot « jour »', ['jour', 'journée', 'journal', 'journalier', 'journaliste', 'aujourd\'hui', 'bonjour', 'toujours', 'séjour', 'ajourner', 'jadis', 'quotidien', 'hebdomadaire', 'mensuel', 'annuel', 'matin', 'midi', 'après-midi', 'soir', 'nuit']),
  L('Les mots en -ien / -ienne', ['musicien / musicienne', 'mécanicien / mécanicienne', 'pharmacien / pharmacienne', 'électricien / électricienne', 'informaticien', 'italien / italienne', 'parisien / parisienne', 'ancien / ancienne', 'gardien / gardienne', 'chien / chienne', 'bien', 'rien', 'combien', 'soutien', 'entretien', 'maintien', 'lien', 'sien', 'mien']),
  L('L\'accord de l\'adjectif', ['un grand arbre', 'une grande maison', 'de grands arbres', 'de grandes maisons', 'un beau jardin', 'une belle fleur', 'de beaux jardins', 'de belles fleurs', 'un vieux livre', 'une vieille armoire', 'un nouvel élève', 'une nouvelle élève', 'un cheval blanc', 'une jument blanche', 'des chevaux blancs', 'des juments blanches', 'un pull neuf', 'une veste neuve', 'des pulls neufs', 'des vestes neuves']),
  L('Les mots de l\'art', ['peinture', 'peintre', 'tableau', 'portrait', 'paysage', 'sculpture', 'sculpteur', 'statue', 'dessin', 'esquisse', 'couleur', 'nuance', 'pinceau', 'palette', 'musée', 'galerie', 'exposition', 'artiste', 'œuvre', 'chef-d\'œuvre']),
  L('Les mots en -ant / -ent', ['pendant', 'maintenant', 'cependant', 'auparavant', 'suivant', 'précédent', 'différent', 'évident', 'excellent', 'prudent', 'patient', 'content', 'lent', 'récent', 'violent', 'silencieux', 'en chantant', 'en marchant', 'en riant', 'en dormant']),
  L('Les mots invariables (avancés)', ['parmi', 'malgré', 'selon', 'sauf', 'hormis', 'envers', 'auprès', 'lors', 'dès', 'jusqu\'à', 'afin de', 'à travers', 'au-delà', 'en dehors', 'grâce à', 'à cause de', 'plutôt que', 'tandis que', 'alors que', 'bien que']),
  L('Révision de l\'année', ['exceptionnel', 'personnellement', 'immédiatement', 'particulièrement', 'complètement', 'entièrement', 'suffisamment', 'notamment', 'finalement', 'généralement', 'quelquefois', 'quelque part', 'n\'importe quoi', 'tout à coup', 'tout à fait', 'peu à peu', 'de temps en temps', 'à peu près', 'au fur et à mesure', 'c\'est-à-dire'])
];

const REGISTRE = { CE2, CM1 };

/**
 * La liste d'une semaine.
 *
 * @param {number} semaine  1 à 36
 * @returns {{regle, mots, jours:Array<Array<string>>}} — `jours` est le découpage réel :
 *   c'est ce que l'enfant colle dans son cahier le lundi.
 */
export function laListe(niveau, semaine) {
  const liste = (REGISTRE[niveau] || [])[Number(semaine) - 1];
  if (!liste) return null;
  const jours = [];
  for (let i = 0; i < liste.mots.length; i += PAR_JOUR) {
    jours.push(liste.mots.slice(i, i + PAR_JOUR));
  }
  return { semaine: Number(semaine), niveau, regle: liste.regle, mots: liste.mots, jours };
}

/** Toutes les semaines d'un niveau — pour imprimer l'année entière d'un coup. */
export const lAnnee = (niveau) => Array.from({ length: SEMAINES }, (_, i) =>
  laListe(niveau, i + 1)).filter(Boolean);

/**
 * Ce que le registre a, et ce qu'il n'a pas. Le compte est vérifié, pas annoncé : une
 * année à trente-quatre semaines se verrait en juin, quand il est trop tard.
 */
export function etat() {
  return Object.entries(REGISTRE).map(([niveau, listes]) => ({
    niveau,
    semaines: listes.length,
    complet: listes.length === SEMAINES,
    mots: listes.reduce((s, l) => s + l.mots.length, 0)
  }));
}

export default { SEMAINES, PAR_JOUR, CE2, CM1, laListe, lAnnee, etat };
