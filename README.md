# alexeitool

Un outil pour **une classe de CE2-CM1**. Pas une plateforme, pas un catalogue,
pas un compte à créer.

> Le programme au code, l'explication à l'agent.
> Non évalué n'est pas non atteint.
> L'agent propose, l'enseignant tranche.

---

## Ce que ce dépôt n'est pas

Cet outil reprend une **discipline** venue d'ailleurs — un registre technique
gouverné, écrit pour des équipes qui vivent dans une forge. Il n'en reprend
**aucun écran**, **aucun mot**, et **aucune brique d'infrastructure**.

La personne en face n'est pas technicienne. Elle a vingt-six enfants, deux
niveaux, vingt-quatre heures par semaine et une pile de copies. Elle n'a pas de
dépôt git, ne veut pas de jeton d'accès, et n'a aucune raison de savoir ce
qu'est un artefact.

**Ce qui change tout, et qu'il ne faut jamais perdre de vue :**

| L'outil technique | Ici |
|---|---|
| On ouvre un catalogue de capacités | On ouvre **sa semaine** |
| L'unité est l'agent | L'unité est **le geste** — corriger cette pile, préparer demain |
| La donnée vit dans une forge | La donnée vit **sur la machine de la classe** |
| On se connecte avec un jeton | **On ouvre, et ça marche** |
| L'écran est fait pour un bureau | L'écran est fait pour **un téléphone, debout, à côté des copies** |
| Il n'y a pas de notion de temps | **Tout** est daté : cette semaine, cette période, avant juin |

### Le vocabulaire est interdit de retour

Ces mots ne doivent apparaître **nulle part** dans une interface :

`agent` · `capacité` · `artefact` · `registre` · `lint` · `porte` · `pré-vol` ·
`empreinte` · `dépôt` · `forge` · `commit`

Et un piège particulier : **« matière »**. Dans l'outil technique, c'est la
donnée d'entrée. À l'école, c'est le français et les mathématiques. Le mot est
donc banni de ce côté-ci ; ce qu'un traitement lit s'appelle **ce qu'il lit**.

On dit : la semaine, la classe, la pile, la séance, le cahier, le mot aux
familles, le bilan.

---

## Pourquoi un CE2-CM1 et pas « un double niveau »

Toutes les classes à deux niveaux ne se ressemblent pas. Un CE1-CE2 reste dans
le cycle 2 ; un CM1-CM2 reste dans le cycle 3. **Le CE2-CM1 est à cheval sur la
frontière**, et c'est ce qui fait sa difficulté :

- **Les échéances diffèrent.** Les attendus de fin de cycle 2 doivent être
  atteints **en juin** par les CE2. Ceux de cycle 3 s'évaluent en fin de CM2,
  deux ans plus tard. Ce qui est urgent pour un groupe ne l'est pas pour l'autre.
- **Les listes d'enseignements diffèrent.** Le CE2 a « Questionner le monde » ;
  le CM1 a « Sciences et technologie » **et** « Histoire-géographie et EMC ».
  Ce ne sont pas deux versions du même cours.
- **Le français n'a pas le même volume** : 10 h contre 8 h. Un temps commun mal
  placé se paie sur le CE2, celui qui a une échéance.

L'outil est donc écrit pour **cette** classe. Le rendre générique lui ferait
perdre la seule chose qui le rend utile.

---

## Ce qui existe aujourd'hui

### L'écran : sa semaine

```bash
npm start          # puis http://localhost:8080
```

On ouvre, **on voit son jour** — celui d'aujourd'hui, pas lundi. Pas d'accueil,
pas de menu, pas de connexion. Le reste de l'outil viendra se greffer autour de
cet écran, jamais devant.

Ce qu'il montre et qu'aucun emploi du temps ne montre : pour chaque moment, si
les deux groupes travaillent **ensemble**, **en alternance** (l'un en autonomie
pendant que l'autre est avec l'enseignant) ou **séparément**. Et en bas, en
permanence, le bilan des 24 heures réglementaires — avec le nom des écarts.

Passer un créneau en « séparément » divise le temps de chaque groupe par deux :
la carte le dit, et le bilan se met à signaler ce qui manque. C'est
l'information qui fait renoncer à dédoubler quand on peut faire autrement, et
elle n'existe nulle part ailleurs.

Tout est **sur la machine**. Si le navigateur refuse d'enregistrer, l'écran le
dit au lieu de laisser croire que le travail est gardé.

### Où sont les agents ? Nulle part — et partout

**Il n'y a aucun écran qui liste ce que l'outil sait faire.** C'est la leçon la
plus chère payée ailleurs : une grille de cartes qu'on fait défiler est une
machine à ne pas trouver. Un enseignant ne cherchera jamais « un outil de
correction » ; il a une pile de copies devant lui.

La règle tient en une ligne :

> **Un geste se range là où vit ce qu'il lit.**

| Il lit… | Il est… |
|---|---|
| une séance | **sur le créneau**, dans la journée |
| une pile de copies | **sur la pile**, quand elle existe |
| un élève | **sur la fiche de l'élève** |
| la période | **sur la période** |
| toute la semaine | **sur la semaine** |

On ne navigue donc jamais vers un outil : on est déjà devant la chose, et ce
qu'on peut en faire est là. C'est le même principe que le routage par capacité
de l'outil technique — trouver par ce qu'on a sous la main, pas par le nom —
mais rendu **spatial**, parce qu'un enseignant navigue dans le temps et dans les
objets, pas dans une barre de recherche.

**Et ce qui est proposé dépend de l'objet réel.** Le travail en autonomie
n'apparaît pas quand les deux groupes sont ensemble : personne n'est seul. La
dictée ne se propose pas sur un créneau de sport. C'est la différence entre
« voilà tout ce que je sais faire » et « voilà ce qui sert ici ».

Sur chaque geste, avant qu'on clique : **ce qu'il lit**, et **ce qu'il ne fera
jamais**. Pas dans une aide que personne n'ouvre — sur le bouton. Et un bouton
qui ne fait rien est pire que pas de bouton : ceux qui ne peuvent pas encore
travailler sont désactivés, et ils disent pourquoi.

### La pile à corriger

C'est la seule porte qui n'appartient à aucun jour, et elle est dans l'en-tête :
corriger n'est pas un moment de la semaine, c'est ce qu'on fait le soir, après.

On dépose des copies (fichiers texte, ou collées), l'outil essaie de reconnaître
l'élève, et **cinq gestes** deviennent possibles : ce qui bloque et pour qui, le
mot à écrire sur chaque copie, les erreurs de dictée par nature, où le
raisonnement casse, et ce que ça change pour la suite.

Trois décisions valent d'être dites :

**Pas de photos.** Deux raisons, et chacune suffirait : le modèle branché ici lit
du texte, et surtout le prénom écrit en haut d'une copie photographiée ne peut
pas être masqué. Le caviardage travaille sur du texte ; accepter les images
ouvrirait une fenêtre à côté d'une porte fermée. C'est plus de travail de
recopier, et c'est le seul chemin honnête.

**On ne devine jamais l'auteur d'une copie.** Le prénom est cherché dans le nom
du fichier puis dans la première ligne. Quand deux enfants portent ce prénom, ou
que deux prénoms apparaissent, la copie reste **non rattachée** et l'écran dit
laquelle des deux raisons s'applique. Se tromper d'élève est la faute la plus
coûteuse que cet outil puisse commettre : une remarque au mauvais enfant, une
observation dans le mauvais dossier.

**Il faut d'abord saisir sa classe.** C'est le seul écran obligatoire, et il s'ouvre
tout seul au premier lancement : on colle sa liste, une ligne par élève. Sans
elle, aucun prénom ne peut être masqué avant l'envoi. L'outil ne charge **aucune
classe d'exemple** — une liste de prénoms plausibles cesse de se distinguer d'une
vraie dès qu'on dépose de vraies copies, et les copies se rattachent alors à des
enfants qui n'existent pas.

**Le texte attendu se donne.** La dictée, l'énoncé, le corrigé. Sans lui l'outil
corrige quand même, mais il ne compte **aucune** erreur et il le dit : un
décompte sans référence est un chiffre inventé, et il a l'aplomb d'un chiffre
exact.

**Ce qui sort, ce sont les copies corrigées.** Pas une liste d'erreurs à côté
d'une copie qu'on n'a pas sous les yeux : le texte de chaque élève **en entier**,
les fautes barrées en rouge avec le bon mot à côté, ce qui revient chez lui, et
le mot à recopier — encadré, prêt à découper. Deux boutons sous la réponse :
**Word** et **Image**.

Deux refus tiennent tout le reste. Une faute annoncée sur un mot **absent** de la
copie n'est pas posée au hasard : elle est listée comme introuvable. Une faute
sur un mot qui apparaît **plusieurs fois** n'est pas posée non plus — mesuré,
« et → est » s'était posé sur le premier « et », celui qui était juste : le
document inventait une faute et laissait la vraie intacte.

L'ancien export gardait  Le `.docx` est écrit à la main — une centaine de lignes, aucune
dépendance : un `.docx` n'est qu'une archive ZIP contenant du XML. Le raccourci
habituel (du HTML renommé `.doc`) déclenche une alerte de sécurité à
l'ouverture, et un enseignant qui voit ça en ouvrant la correction de sa classe
ne recommence pas.

Il ne porte **aucun avertissement en tête**. La première version ouvrait chaque
export sur un bloc de réserves — « proposition d'un modèle », « rien ici n'est un
bilan ». L'intention était bonne, la place ne l'était pas : quand on imprime une
correction pour la poser à côté des copies, on n'imprime pas la notice de l'outil
qui l'a produite. Il reste une ligne, en bas, en petit. Les réserves qui comptent
restent à l'écran, où elles servent **avant** d'imprimer.

**Qui n'a pas rendu est nommé.** Vingt-deux copies pour vingt-six élèves : les
quatre absents ne se manifestent pas tout seuls, et on ne s'en aperçoit qu'en
rendant la pile. Avec la règle qui va avec, répétée au modèle à chaque envoi :

> **Ne pas avoir rendu n'est pas ne pas savoir.**

Aucune de ces cinq consignes ne peut produire une note, un rang, ni un groupe de
niveau — et c'est vérifié par les tests, pas seulement écrit dans le texte.

### Les modules

Des modules purs, testés, sans aucune dépendance. Ce sont les fondations qui
ne dépendent **pas** de ce que l'enseignant nous dira — le reste attend de lui
avoir parlé.

### `lib/eleves.js` — les prénoms ne sortent pas d'ici

Chaque élève reçoit un pseudonyme **stable** (`Élève 07`). La table de
correspondance reste sur la machine ; ce qui part porte les numéros, ce qui
revient est retraduit avant affichage. Le modèle ne voit jamais un prénom,
l'enseignant n'en lit jamais un autre.

Le module **dit ce qu'il a remplacé**, et **signale les mots suspects** qu'il
n'a pas pu couvrir — un enfant qui écrit le prénom de son frère ne peut pas
l'être par une liste de classe. Il ne se déclare jamais complet.

Écrit **avant** le premier agent, pas après.

### `lib/evaluation.js` — non évalué n'est pas non atteint

`NON_EVALUE` n'est pas une valeur du vocabulaire : c'est l'absence de relevé, et
elle se propage jusqu'à l'écran sans jamais devenir un résultat. Un élève absent
le jour de l'évaluation n'a pas échoué.

Aucune moyenne, aucun pourcentage, aucun rang. Le module rend des **comptes** et
la liste de **ce qui n'a jamais été observé** — y compris l'élève sur lequel on
n'a presque rien, qui est souvent le discret, celui qui ne gêne pas.

### `lib/semaine.js` — la grille qui dit quand elle ne boucle pas

Les horaires réglementaires des deux cycles, en dur, parce que ce sont des
chiffres. **Cinq jours** — Paris a gardé la semaine de quatre jours et demi :
mercredi matin travaillé, mardi et vendredi jusqu'à 15 h. Trois régimes de créneau — **ensemble**, **en alternance**,
**séparément** — parce qu'aucun outil d'emploi du temps ne modélise ce qu'un
double niveau fait réellement.

Et `verdict()`, qui compare ce qui est posé à ce qui est dû et **nomme les
écarts**. Une heure qui manque se voit en août, pas en juin.

---

## Faire tourner

```bash
npm test          # 74 vérifications, zéro dépendance
npm start         # l'écran, sur http://localhost:8080
```

Node 20.12 ou plus. Rien à installer.

## La clé DeepSeek

```bash
cp .env.exemple .env
$EDITOR .env          # DEEPSEEK_API_KEY=…
npm start
```

Au démarrage, le serveur dit s'il l'a trouvée.

**C'est exactement le mécanisme de la plateforme technique** : même nom de
variable, même `.env` ignoré, même `.env.exemple` versionné et vide. Le client
`runtime/deepseek.js` est d'ailleurs le même fichier — porté, pas réécrit. Ses
codes de refus nommés un par un, le `reasoning_content` qu'il ne faut pas lire,
la réponse vide qui doit lever : rien de tout ça ne se redécouvre en une soirée.

**Où elle ne va pas.** L'outil est une page statique : tout ce que la page
connaît est lisible dans les outils de développement. La clé est lue par
`serve.js`, dans le processus, et ne traverse jamais une réponse. La page appelle
`/api/modele` sans jamais la voir.

**Un secret GitHub ne convient pas ici.** Il n'existe qu'à l'intérieur d'un run
GitHub Actions — il ne peut pas atteindre le portable de l'enseignant. Il servira
le jour où on voudra faire tourner des vérifications au dépôt, pas avant.

**Rien ne part sans caviardage.** `lib/garde.js` refuse tout envoi que la page
n'a pas marqué caviardé. C'est une déclaration, pas une preuve — le serveur ne
connaît pas la classe. Mais le jour où un nouvel écran oublie l'étape, l'envoi
est refusé au lieu de partir.

**Et une clé ne peut pas entrer au dépôt.** `test/secrets.test.js`, porté lui
aussi, regarde le contenu de ce qui est *indexé* — pas le `.gitignore`, qui n'est
qu'une intention et se contourne d'un `git add -f`.

---

## Ce qui n'est pas décidé

Ce dépôt est ouvert **sans avoir parlé à l'enseignant**. Trois questions
changent la suite, et aucune ne se devine :

1. **Quel moment de la semaine redoute-t-il le plus ?** C'est par là qu'on
   commence, quel que soit le plan.
2. **Quels outils l'école impose-t-elle déjà ?** Un document produit dans un
   format que personne n'utilise ne sert à rien.
3. **Que dit sa circonscription sur l'usage de l'IA avec des productions
   d'élèves ?** La réponse peut réécrire entièrement la façon dont les copies
   sont traitées.

En attendant, rien de ce qui touche un enfant ne sort de la machine.
