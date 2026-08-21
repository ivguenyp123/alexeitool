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
jamais**. Pas dans une aide que personne n'ouvre — sur le bouton.

Rien n'est branché sur un modèle, et l'écran le dit. Un bouton qui ne fait rien
est pire que pas de bouton.

### Les modules

Trois modules purs, testés, sans aucune dépendance. Ce sont les fondations qui
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
# ouvre .env, remplace la valeur par ta clé
npm start
```

Au démarrage, le serveur dit s'il l'a trouvée.

**Où elle vit, et pourquoi.** L'outil est une page statique : tout ce que la page
connaît est lisible dans les outils de développement du navigateur. Il n'y a pas
de « caché » côté client, seulement du « pas encore regardé ». Une clé posée là
serait une clé publiée.

Elle est donc lue par `serve.js`, **dans le processus**, et ne traverse jamais
une réponse HTTP. La page appelle `/api/modele` sans jamais la voir —
`/api/etat` répond `{ pret: true }`, rien de plus.

`.env` est ignoré par git (`.env`, `.env.*`, `*.key`, `*.pem`). Seul
`.env.exemple` est versionné : il ne porte que le **nom** de la variable.

**Rien ne part sans caviardage.** La route refuse tout envoi que la page n'a pas
marqué comme caviardé. C'est une déclaration, pas une preuve — le serveur ne
connaît pas la classe, elle vit dans le navigateur. Mais le jour où un nouvel
écran oublie l'étape, l'envoi est refusé au lieu de partir : l'oubli devient une
erreur visible plutôt qu'une fuite silencieuse.

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
