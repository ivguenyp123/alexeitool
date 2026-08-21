/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  OÙ SE RANGENT LES GESTES — ET POURQUOI IL N'Y A PAS DE LISTE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── LA QUESTION ─────────────────────────────────────────────────────────────
 *
 * On a trente-deux choses que l'outil saura faire. Où les met-on ? Un écran « les
 * outils » ? Un menu ? Dans les jours ?
 *
 * ── LA RÉPONSE : NULLE PART, ET PARTOUT ─────────────────────────────────────
 *
 * Il n'y a AUCUN écran qui liste ce que l'outil sait faire. C'est la leçon la plus chère
 * payée ailleurs : une grille de cartes qu'on fait défiler est une machine à ne pas
 * trouver, et une machine à créer des doublons. Un enseignant ne cherchera jamais « un
 * agent de correction » ; il a une pile de copies devant lui.
 *
 * LA RÈGLE, ET ELLE TIENT TOUT :
 *
 *   UN GESTE SE RANGE LÀ OÙ VIT CE QU'IL LIT.
 *
 *   il lit une séance          → il est SUR le créneau, dans la journée
 *   il lit une pile de copies  → il est SUR la pile, quand elle existe
 *   il lit un élève            → il est SUR la fiche de l'élève
 *   il lit la période          → il est SUR la période
 *   il lit toute la semaine    → il est SUR la semaine
 *
 * On ne navigue donc jamais vers un outil : on est déjà devant la chose, et ce qu'on peut
 * en faire est là. C'est le même principe que le routage par capacité de la plateforme
 * technique — trouver par la matière, pas par le nom — mais rendu SPATIAL, parce qu'un
 * enseignant navigue dans le temps et dans les objets, pas dans une barre de recherche.
 *
 * ── ET TOUS LES GESTES NE S'APPLIQUENT PAS À TOUT ───────────────────────────
 *
 * Le plan de travail autonome n'a aucun sens sur un créneau où les deux groupes sont
 * ensemble : personne ne travaille seul. La dictée n'a rien à faire sur un créneau de
 * sport. Ce qui est proposé dépend donc du créneau RÉEL — son domaine, son régime — et
 * pas d'une liste figée.
 *
 * C'est ce qui fait la différence entre « voilà tout ce que je sais faire » et « voilà ce
 * qui sert ici ».
 */

/** Là où un geste peut vivre. Fermé — chaque ancrage est un endroit réel de l'écran. */
export const ANCRAGES = ['creneau', 'pile', 'eleve', 'periode', 'semaine', 'classe'];

/**
 * Ce que chaque geste fait, lit, et ne fait jamais.
 *
 * Le troisième champ est le plus important : c'est lui qui empêche un outil d'aide de
 * devenir un outil qui décide. Il est écrit ici, une fois, et l'écran l'affiche — il ne
 * vit pas dans la tête de celui qui a codé le bouton.
 *
 * `quand` limite l'apparition. Absent, le geste vaut pour tous les cas de son ancrage.
 *
 * `consigne` est ce qui part au modèle. Elle REPREND l'interdiction plutôt que de s'y
 * référer : le modèle ne lit pas le champ `jamais`, il ne lit que la consigne. Une
 * interdiction écrite seulement dans l'interface est une interdiction qui ne s'applique
 * pas.
 *
 * Et toutes portent la même : ne citer AUCUN attendu officiel. Le registre des attendus
 * n'existe pas encore ici — un modèle qui les récite de mémoire produit des références
 * fausses avec l'aplomb de références sourcées, et personne ne va vérifier un numéro de
 * compétence sur une fiche de préparation.
 */
export const GESTES = [
  /* ── SUR UN CRÉNEAU ────────────────────────────────────────────────────── */
  {
    id: 'preparer-seance', ancrage: 'creneau',
    nom: 'Préparer cette séance',
    lit: 'le domaine et la durée du créneau, les attendus du niveau, ce qui a déjà été fait',
    rend: 'un déroulé minuté, les consignes telles qu\'elles seront dites, les critères de réussite',
    jamais: 'proposer un déroulé plus long que le créneau, sans le signaler',
    consigne: `Tu prépares UNE séance pour une classe à deux niveaux, CE2 et CM1.

CE QUE TU RENDS, dans cet ordre et rien d'autre :
1. L'objectif, en une phrase qui commence par un verbe d'action de l'élève.
2. Le matériel.
3. Le déroulé MINUTÉ, phase par phase, dont le total tombe exactement sur la durée donnée.
4. Les consignes, écrites telles qu'elles seront DITES à voix haute.
5. Les critères de réussite, formulés du point de vue de l'élève.

CE QUE TU NE FAIS JAMAIS :
· Tu ne cites AUCUN attendu officiel, aucune référence de programme, aucun numéro de
  compétence. Tu ne les as pas sous les yeux, et les inventer produirait une fiche fausse
  avec l'aplomb d'une fiche sourcée.
· Tu ne proposes pas un déroulé plus long que la durée donnée. S'il ne rentre pas, tu
  coupes une phase et tu DIS laquelle tu as coupée.`
  },
  {
    id: 'deux-taches', ancrage: 'creneau',
    quand: (c) => c.regime !== 'commun',
    nom: 'Une entrée commune, deux tâches',
    lit: 'les attendus des deux niveaux sur ce domaine',
    rend: 'le temps collectif partagé, les deux consignes, et le moment précis où les groupes se séparent',
    jamais: 'donner au CE2 une version allégée du CM1 — ce sont deux tâches, pas une tâche réduite',
    consigne: `Une entrée commune, deux tâches — pour une classe CE2-CM1.

Le CE2 est en fin de cycle 2, le CM1 en début de cycle 3 : ce ne sont pas deux étapes
d'une même progression, ce sont deux cycles avec deux échéances.

CE QUE TU RENDS :
1. Le temps collectif partagé : la même entrée pour tout le monde, et sa durée.
2. Le MOMENT PRÉCIS où les groupes se séparent.
3. La tâche du CE2, avec son critère de réussite.
4. La tâche du CM1, avec son critère de réussite.

CE QUE TU NE FAIS JAMAIS :
· Tu ne donnes pas au CE2 une version allégée du CM1. Ce sont DEUX tâches, pas une tâche
  et sa réduction. Si les deux tâches ne diffèrent que par la quantité, tu l'admets et tu
  proposes plutôt de dédoubler la séance.
· Tu n'inventes aucun attendu officiel : tu ne les as pas.`
  },
  {
    id: 'plan-autonome', ancrage: 'creneau',
    quand: (c) => c.regime === 'decale',
    nom: 'Le travail du groupe en autonomie',
    lit: 'le domaine du groupe qui travaille seul, la durée, ce qui a déjà été enseigné',
    rend: 'des tâches réellement faisables sans adulte, l\'autocorrection, quoi faire quand on a fini et quand on est bloqué',
    jamais: 'mettre en autonomie une notion qui n\'a jamais été vue en dirigé',
    consigne: `Le travail du groupe qui reste SEUL pendant que l'enseignant est avec l'autre.

Le critère est unique et il est dur : chaque tâche doit pouvoir être faite ET vérifiée
sans adulte. Une tâche qui demande une explication n'a rien à faire ici.

CE QUE TU RENDS :
1. Trois à cinq tâches, dans l'ordre où les faire.
2. L'autocorrection de chacune — comment l'élève sait tout seul s'il a juste.
3. Ce qu'on fait quand on a fini avant les autres.
4. Ce qu'on fait quand on est bloqué, sans déranger l'enseignant.

CE QUE TU NE FAIS JAMAIS :
· Tu ne mets jamais en autonomie une notion qui n'a pas déjà été enseignée en dirigé. Si
  la notion donnée n'a manifestement pas été installée, tu le DIS et tu proposes du
  réinvestissement à la place.
· Tu n'inventes aucun attendu officiel.`
  },
  {
    id: 'cout-dedoublement', ancrage: 'creneau',
    quand: (c) => c.regime === 'dedouble',
    nom: 'Peut-on éviter de dédoubler ?',
    lit: 'les attendus des deux niveaux sur ce domaine, l\'écart entre eux',
    rend: 'si ce créneau peut passer en alternance — et ce que ça changerait pour chaque groupe',
    jamais: 'conclure qu\'on peut fusionner deux attendus qui ne se recouvrent pas',
    consigne: `On te donne un créneau DÉDOUBLÉ : deux séances menées l'une après l'autre, donc chaque
groupe ne reçoit que la moitié du temps. C'est le régime le plus coûteux.

LA QUESTION : ce créneau peut-il passer en ALTERNANCE — les deux groupes en même temps,
l'un en autonomie pendant que l'enseignant est avec l'autre ?

CE QUE TU RENDS :
1. Ta réponse : oui, non, ou « oui à une condition » — et laquelle.
2. Ce que ça changerait pour chaque groupe, en minutes.
3. Si oui : ce que fait le groupe en autonomie pendant ce temps.
4. Si non : la raison précise, en une phrase.

CE QUE TU NE FAIS JAMAIS :
· Tu ne conclus pas qu'on peut fusionner deux attendus qui ne se recouvrent pas. Gagner du
  temps en supprimant un apprentissage n'est pas gagner du temps.
· Tu n'inventes aucun attendu officiel.`
  },
  {
    id: 'redire-autrement', ancrage: 'creneau',
    nom: 'Trois façons de le redire',
    lit: 'la notion, et ce qui a été dit sans passer',
    rend: 'trois entrées de nature différente — une manipulation, une image, un contre-exemple',
    jamais: 'reformuler sans changer d\'entrée : c\'est ce qui a déjà échoué',
    consigne: `Une explication n'est pas passée. Tu en proposes TROIS AUTRES, de nature différente.

Trois entrées différentes, pas la même explication trois fois :
· une MANIPULATION — quelque chose que l'élève fait avec ses mains ou son corps ;
· une IMAGE ou une analogie tirée de son quotidien ;
· un CONTRE-EXEMPLE — un cas où ça ne marche pas, et pourquoi.

CE QUE TU RENDS : les trois, chacune en trois lignes maximum, avec ce que chacune suppose
que l'élève sache déjà.

CE QUE TU NE FAIS JAMAIS :
· Tu ne reformules pas la même explication en plus lent ou en plus simple. C'est ce qui a
  déjà échoué.
· Tu ne dis pas que l'élève « n'a pas compris » : tu ne l'as pas vu. Tu travailles sur
  l'explication, pas sur l'enfant.`
  },
  {
    id: 'sortie-seance', ancrage: 'creneau',
    nom: 'Qui a compris, en cinq minutes',
    lit: 'l\'objectif de la séance',
    rend: 'une ou deux questions de fin de séance, et comment lire les réponses',
    jamais: 'transformer ce contrôle rapide en évaluation notée',
    consigne: `Une question de fin de séance, pour savoir AVANT de partir qui a compris.

CE QUE TU RENDS :
1. Une question, deux au maximum. Courtes. Réponse en moins d'une minute.
2. La grille de lecture : ce qu'une bonne réponse contient, et ce que chaque type
   d'erreur révèlerait.

CE QUE TU NE FAIS JAMAIS :
· Tu n'en fais pas une évaluation notée. C'est un contrôle de température, pas un bilan :
  rien de ce qui en sort ne doit finir dans un livret.
· Tu ne proposes pas une question dont la réponse est « oui » ou « non » : elle ne
  distinguerait pas celui qui sait de celui qui devine.`
  },

  /* ── SUR UNE PILE DE COPIES ────────────────────────────────────────────── */
  {
    id: 'pile-ou-ca-bloque', ancrage: 'pile',
    nom: 'Ce qui bloque, et pour qui',
    lit: 'toutes les copies de l\'exercice, et l\'attendu visé',
    rend: 'les difficultés regroupées par nature, avec qui est concerné, et ce que ça implique pour la suite',
    jamais: 'classer les élèves entre eux, ni produire un rang',
    consigne: `Tu lis TOUTE la pile d'un coup, et tu dis ce qui revient.

C'est la seule chose qu'un enseignant ne peut pas faire en corrigeant : il voit les copies
l'une après l'autre, et une difficulté présente dans douze d'entre elles lui apparaît douze
fois séparément, jamais une seule fois ensemble. C'est ça qu'on te demande.

CE QUE TU RENDS, dans cet ordre :
1. LES DIFFICULTÉS, regroupées PAR NATURE — pas par élève. Pour chacune : ce qui se passe
   dans la tête de l'élève, les numéros concernés, et UNE citation exacte tirée d'une copie
   qui la montre. Tu ranges de la plus fréquente à la plus rare.
2. CE QUI EST ACQUIS. Une liste de difficultés rendue seule fait croire que rien ne marche.
   Dis ce qui est réussi par presque tout le monde, et par qui ça ne l'est pas.
3. LES CAS ISOLÉS : ce qui n'apparaît que chez un ou deux, et qui ne relève donc pas d'une
   reprise collective.
4. CE QUE TU NE SAIS PAS TRANCHER — les copies où ce que tu lis peut s'expliquer de deux
   façons. Nomme les deux, et dis ce qu'il faudrait regarder pour décider.

CE QUE TU NE FAIS JAMAIS :
· Tu ne classes pas les élèves entre eux. Pas de rang, pas de « les meilleurs », pas de
  « les plus faibles », pas de groupes de niveau. Tu regroupes des ERREURS, pas des
  enfants.
· Tu ne mets aucune note, aucun score, aucun pourcentage de réussite par élève.
· Tu ne cites aucun attendu officiel autre que celui qui t'est donné. Si aucun ne t'est
  donné, tu n'en cites aucun — tu ne les as pas.
· Tu ne conclus rien sur les élèves dont tu n'as pas la copie.`
  },
  {
    id: 'mot-a-eleve', ancrage: 'pile',
    nom: 'Le mot à écrire sur chaque copie',
    lit: 'la copie et l\'attendu visé',
    rend: 'trois phrases adressées à l\'élève : ce qui est réussi, la seule chose à reprendre, comment s\'y prendre',
    jamais: 'écrire un commentaire sur la personne plutôt que sur le travail',
    consigne: `Pour CHAQUE copie, tu proposes le mot à écrire dessus. Trois phrases, pas plus.

Il sera relu et réécrit avant d'atterrir sur la copie : tu proposes, l'enseignant tranche.
Écris-le donc tel qu'il pourrait être recopié, pas comme une analyse à son intention.

LES TROIS PHRASES, dans cet ordre, et toujours les trois :
1. CE QUI EST RÉUSSI, précisément — pas « bon travail », mais la chose exacte que cet
   élève-là a réussie, en citant ce qu'il a écrit.
2. LA SEULE CHOSE À REPRENDRE. Une. Pas trois. Un enfant qui lit quatre reproches n'en
   retient aucun, et celui qui en mériterait quatre a surtout besoin qu'on lui en désigne
   une.
3. COMMENT S'Y PRENDRE la prochaine fois — un geste concret, faisable seul. « Relis-toi »
   n'est pas un geste ; « relis en cherchant d'abord les verbes » en est un.

TU T'ADRESSES À UN ENFANT DE HUIT OU NEUF ANS. Tu le tutoies. Phrases courtes, mots
ordinaires, aucun terme technique que tu n'expliques pas dans la phrase même.

CE QUE TU NE FAIS JAMAIS :
· Tu n'écris rien sur la PERSONNE — ni sur son sérieux, ni sur son attention, ni sur ses
  efforts, ni sur son caractère. Tu écris sur le TRAVAIL, qui est la seule chose que tu as
  sous les yeux.
· Tu ne mets aucune note, aucune appréciation chiffrée, aucun « acquis / non acquis ».
  Ce mot-là est lu par un enfant : une note posée à côté efface les trois phrases.
· Tu ne compares à aucun autre élève, ni à la classe, ni à une moyenne, et tu ne classes
  pas les élèves entre eux.
· Tu n'écris rien pour un élève dont tu n'as pas la copie.
· Tu emploies les numéros d'élève, jamais de prénom.`
  },
  {
    id: 'typologie-dictee', ancrage: 'pile',
    /*
     * `!c?.domaine` et pas `!c` : une pile existe toujours, mais son domaine peut ne pas
     * encore être choisi. Mesuré à l'écran — avec `!c`, les deux gestes qui servent le
     * plus (la dictée, le problème) étaient invisibles tant qu'on n'avait pas rempli un
     * champ facultatif, et rien ne disait pourquoi.
     */
    quand: (c) => !c?.domaine || c.domaine === 'francais',
    nom: 'Les erreurs de la dictée, par nature',
    lit: 'le texte de la dictée et les productions',
    rend: 'accord, homophone, son, lexique, segmentation — par élève et pour la classe',
    jamais: 'ramener une dictée à un nombre d\'erreurs',
    consigne: `Tu tries les erreurs d'une dictée PAR NATURE. C'est tout l'enjeu : deux copies
qui portent le même nombre d'erreurs n'appellent pas du tout le même travail.

LES CATÉGORIES, et tu t'y tiens :
· ACCORD — dans le groupe nominal, ou sujet-verbe. Précise lequel des deux.
· HOMOPHONE — a/à, et/est, son/sont, ces/ses, on/ont…
· SON — ce qui est écrit s'entend juste mais s'écrit autrement (« ozieaux »).
· LEXIQUE — le mot lui-même n'est pas su.
· SEGMENTATION — mots collés ou coupés au mauvais endroit (« lechat », « lami »).
· CONJUGAISON — le temps ou la personne, hors accord sujet-verbe.
· MAJUSCULE ET PONCTUATION.
· OMISSION — un mot ou un morceau de phrase absent.

CE QUE TU RENDS :
1. POUR LA CLASSE : chaque catégorie, combien d'élèves sont concernés, et les mots exacts
   de la dictée sur lesquels ça achoppe. Rangé par fréquence.
2. POUR CHAQUE ÉLÈVE : ses erreurs réparties dans les catégories, avec la forme qu'il a
   écrite et la forme attendue. Puis LA catégorie dominante chez lui — celle qui, seule,
   ferait le plus de différence.
3. LES ERREURS QUI N'EN SONT PEUT-ÊTRE PAS : ce qui peut venir d'un mot mal ENTENDU
   pendant la dictée plutôt que mal su. Signale-le, ne tranche pas à sa place.

CE QUE TU NE FAIS JAMAIS :
· Tu ne ramènes pas une dictée à un nombre d'erreurs, ni à une note, ni à un barème. Le
  nombre est précisément ce qui fait qu'on cesse de regarder la nature.
· Tu ne classes pas les élèves entre eux.
· Tu ne corriges pas les citations : tu écris ce que l'élève a écrit, tel quel.
· Tu ne dis rien d'un élève dont tu n'as pas la copie. Absent le jour de la dictée n'est
  pas en difficulté sur la dictée.`
  },
  {
    id: 'ou-casse-le-probleme', ancrage: 'pile',
    quand: (c) => !c?.domaine || c.domaine === 'mathematiques',
    nom: 'Où le raisonnement casse',
    lit: 'l\'énoncé et les productions',
    rend: 'pour chaque élève : lecture de l\'énoncé, choix de l\'opération, calcul, ou formulation',
    jamais: 'traiter une erreur de calcul comme une incompréhension du problème',
    consigne: `Pour chaque copie, tu dis À QUEL MOMENT le raisonnement casse. Pas s'il est
juste ou faux : OÙ il lâche.

LES QUATRE MOMENTS, et il faut choisir :
1. LA LECTURE DE L'ÉNONCÉ — ce qui est cherché n'a pas été compris, ou une donnée a été
   lue de travers.
2. LE CHOIX DE L'OPÉRATION — la situation est comprise, mais traduite par la mauvaise
   opération.
3. LE CALCUL — la démarche est juste, l'exécution non. Une retenue, une table, un zéro.
4. LA FORMULATION — le résultat est trouvé, mais la réponse ne répond pas à la question :
   pas de phrase, pas d'unité, ou l'unité d'une autre grandeur.

CE QUE TU RENDS :
1. Pour chaque élève : le moment où ça casse, et la citation exacte de sa copie qui le
   montre. Si le raisonnement tient jusqu'au bout, dis-le aussi.
2. Pour la classe : combien à chaque moment. Un problème raté par vingt élèves AU CALCUL
   et le même problème raté par vingt élèves À LA LECTURE DE L'ÉNONCÉ n'appellent pas la
   même séance — dis laquelle des deux situations tu as sous les yeux.
3. LES DÉMARCHES JUSTES MAIS INATTENDUES : un élève qui trouve autrement que prévu a
   raison. Signale-les — ce sont elles qu'on rate en corrigeant vite.

CE QUE TU NE FAIS JAMAIS :
· Tu ne traites pas une erreur de calcul comme une incompréhension du problème. C'est
  l'erreur de correction la plus fréquente et la plus coûteuse : elle fait refaire à un
  enfant une leçon qu'il avait comprise, au lieu de lui faire réviser ses tables.
· Tu ne notes pas, et tu ne classes pas les élèves entre eux.
· Tu ne conclus rien sur un élève dont tu n'as pas la copie.`
  },
  {
    id: 'apres-la-pile', ancrage: 'pile',
    nom: 'Ce que ça change pour la suite',
    lit: 'ce que la pile a montré, et le temps réellement disponible dans la semaine',
    rend: 'ce qu\'il faut reprendre collectivement, avec qui, et ce qu\'on laisse tomber',
    jamais: 'proposer plus de reprises que la semaine n\'a d\'heures',
    consigne: `La pile est corrigée. Reste la seule question qui compte le lundi matin :
QU'EST-CE QUE JE FAIS DE ÇA.

CE QUE TU RENDS :
1. CE QU'ON REPREND AVEC TOUTE LA CLASSE — DEUX choses au maximum, chacune justifiée par
   le nombre d'élèves concernés. Pour chacune : la durée, et l'entrée concrète (quel
   exemple, quelle question de départ).
2. CE QU'ON REPREND EN PETIT GROUPE — avec quels numéros d'élèves, sur quoi exactement, et
   à quel moment ça peut tenir dans la semaine.
3. CE QUI SE RÈGLE SEUL et ne mérite aucune reprise : les erreurs isolées, les étourderies,
   ce qui relève d'une notion pas encore enseignée.
4. CE QU'ON LAISSE TOMBER, et tu l'assumes. Il n'y a pas le temps de tout reprendre : dis
   ce que tu renonces à traiter maintenant, et pourquoi ça peut attendre.

CE QUE TU NE FAIS JAMAIS :
· Tu ne proposes pas plus de reprises que la semaine n'a d'heures. Un plan de remédiation
  infaisable n'est pas un plan : c'est une culpabilité de plus le dimanche soir.
· Tu ne fais pas de groupes de niveau permanents. Un petit groupe se forme sur UNE
  difficulté et se défait quand elle est levée.
· Tu ne mets aucune note et tu ne classes pas les élèves entre eux : ce que tu rends est
  un emploi du temps, pas un bilan.
· Tu ne prévois rien pour les élèves dont tu n'as pas la copie : tu dis qu'il faut
  d'abord voir leur travail.`
  },

  /* ── SUR UN ÉLÈVE ──────────────────────────────────────────────────────── */
  {
    id: 'avant-les-parents', ancrage: 'eleve',
    nom: 'Avant de rencontrer ses parents',
    lit: 'les productions et observations concernant cet élève',
    rend: 'la trame de l\'entretien : ce qui a progressé, ce qui bloque, et ce dont on n\'a pas de trace',
    jamais: 'présenter comme observé ce qui n\'a pas été observé'
  },
  {
    id: 'ppre', ancrage: 'eleve',
    nom: 'Écrire une aide qui se vérifie',
    lit: 'les difficultés constatées et les attendus du niveau',
    rend: 'un objectif précis, des moyens concrets, une échéance, et le critère qui dira si ça a marché',
    jamais: 'poser un diagnostic, évoquer un trouble, ni se substituer au RASED ou au médecin scolaire'
  },

  /* ── SUR LA PÉRIODE ────────────────────────────────────────────────────── */
  {
    id: 'bilan-periode', ancrage: 'periode',
    nom: 'Le bilan de la période',
    lit: 'les observations et évaluations de la période, les attendus du niveau',
    rend: 'un projet de bilan par domaine, à relire et à trancher',
    jamais: 'renseigner le livret directement, ni convertir une absence d\'évaluation en « non atteint »'
  },
  {
    id: 'sans-trace', ancrage: 'periode',
    nom: 'Ce dont on n\'a aucune trace',
    lit: 'les attendus de la période et tout ce qui a été relevé',
    rend: 'les attendus que personne n\'a passés, et les élèves sur lesquels on n\'a presque rien',
    jamais: 'combler un trou par une estimation'
  },
  {
    id: 'franchir-le-cycle', ancrage: 'periode',
    nom: 'Ce que le CE2 doit clore avant juin',
    lit: 'les attendus de fin de cycle 2, la progression réalisée',
    rend: 'ce qui doit être sécurisé avant juin pour les CE2, et ce qui peut s\'installer plus lentement pour les CM1',
    jamais: 'traiter les deux groupes comme deux étapes d\'une même progression — ce sont deux cycles'
  },

  /* ── SUR LA SEMAINE ────────────────────────────────────────────────────── */
  {
    id: 'equilibrer-semaine', ancrage: 'semaine',
    nom: 'Rattraper ce qui manque',
    lit: 'la grille posée et les volumes réglementaires',
    rend: 'où placer ce qui manque, compte tenu des jours courts et du mercredi',
    jamais: 'proposer de sauter un attendu pour faire tenir la grille'
  },
  {
    id: 'cahier-remplacant', ancrage: 'semaine',
    nom: 'Ce qu\'un remplaçant doit savoir',
    lit: 'la grille, la progression, l\'organisation des groupes',
    rend: 'le document à laisser sur le bureau : où on en est, ce qui est prévu, ce qui se passe en autonomie',
    jamais: 'écrire des informations sensibles sur un élève dans un document laissé sur un bureau'
  },

  /* ── SUR LA CLASSE ─────────────────────────────────────────────────────── */
  {
    id: 'groupes-de-besoin', ancrage: 'classe',
    nom: 'Les groupes de la semaine',
    lit: 'les observations et productions de la période',
    rend: 'des groupes provisoires, chacun avec le besoin qui le justifie et son critère de sortie',
    jamais: 'produire des groupes de niveau permanents'
  },
  {
    id: 'mot-familles', ancrage: 'classe',
    nom: 'Un mot aux familles',
    lit: 'l\'information à transmettre et la date',
    rend: 'le mot du cahier de liaison : court, sans jargon, avec ce qu\'il faut faire et pour quand',
    jamais: 'nommer un élève dans un mot collectif'
  }
];

/**
 * Les gestes qui ont un sens ICI — sur cet objet précis, dans son état précis.
 *
 * C'est la fonction qui remplace le catalogue. On ne demande pas « que sais-tu faire »
 * mais « qu'est-ce qui sert sur ceci », et la réponse dépend de l'objet.
 *
 * @param {string} ancrage  où l'on se trouve : `creneau`, `pile`, `eleve`…
 * @param {object} objet    la chose regardée — un créneau, une pile… Peut être absent.
 */
export function ici(ancrage, objet = null) {
  return GESTES.filter((g) => g.ancrage === ancrage)
    .filter((g) => !g.quand || g.quand(objet));
}

/** Un geste par son identifiant, ou `null`. On ne devine pas. */
export const geste = (id) => GESTES.find((g) => g.id === id) || null;

/**
 * Combien de gestes chaque endroit porte — pour vérifier qu'aucun n'est désert.
 *
 * Un ancrage sans aucun geste serait un endroit de l'écran où l'outil ne sert à rien, et
 * personne ne s'en apercevrait avant d'y être.
 */
export function parAncrage() {
  return Object.fromEntries(ANCRAGES.map((a) =>
    [a, GESTES.filter((g) => g.ancrage === a).length]));
}

export default { ANCRAGES, GESTES, ici, geste, parAncrage };
