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
chiffres. Trois régimes de créneau — **ensemble**, **en alternance**,
**séparément** — parce qu'aucun outil d'emploi du temps ne modélise ce qu'un
double niveau fait réellement.

Et `verdict()`, qui compare ce qui est posé à ce qui est dû et **nomme les
écarts**. Une heure qui manque se voit en août, pas en juin.

---

## Faire tourner

```bash
npm test          # 42 vérifications, zéro dépendance
```

Node 20.12 ou plus. Rien à installer.

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
