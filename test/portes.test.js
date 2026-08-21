import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GESTES, ici } from '../lib/gestes.js';
import { contexteSemaine, texteSemaine, contexteClasse, texteClasse } from '../lib/contexte.js';
import { SEMAINE, CLASSE } from '../lib/exemple.js';
import { verdict } from '../lib/semaine.js';

describe('toutes les consignes existent, partout', () => {
  test('aucun geste déclaré n\'est un bouton vide', () => {
    const sans = GESTES.filter((g) => !g.consigne).map((g) => g.id);
    assert.deepEqual(sans, [],
      `ces gestes s'affichent mais ne feraient rien : ${sans.join(', ')}`);
  });

  test('chaque consigne dit au modèle ce qu\'il ne doit pas faire', () => {
    for (const g of GESTES) {
      assert.match(g.consigne, /CE QUE TU NE FAIS JAMAIS|Tu ne /,
        `${g.id} n'interdit rien — le champ « jamais » de l'écran ne suffit pas, le `
        + 'modèle ne lit que la consigne');
    }
  });

  test('aucune consigne n\'autorise à citer un attendu qu\'on n\'a pas', () => {
    // Les gestes de la pile reçoivent l'attendu visé dans leur contexte ; les autres, non.
    for (const g of GESTES.filter((x) => x.ancrage !== 'pile')) {
      // « Un mot aux familles » l'interdit d'une autre façon, plus forte : le vocabulaire
      // du métier y est banni en entier, attendus compris. On accepte cette forme-là.
      assert.match(g.consigne, /aucun attendu officiel|n'inventes? aucun attendu|ni « attendus »/i,
        `${g.id} laisse le modèle libre de réciter une référence de programme`);
    }
  });
});

describe('la semaine', () => {
  test('les volumes partent CALCULÉS, avec l\'ordre de ne pas les refaire', () => {
    const t = contexteSemaine(SEMAINE, { classe: CLASSE });
    assert.match(t, /tu ne les recalcules pas/);
    assert.match(t, /Les volumes réglementaires des deux niveaux sont atteints/);
  });

  test('la grille entière y est, jour par jour, avec les régimes', () => {
    const t = contexteSemaine(SEMAINE, { classe: CLASSE });
    for (const j of ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']) {
      assert.match(t, new RegExp(`\\s${j} \\(`), `${j} manque dans la grille envoyée`);
    }
    assert.match(t, /mercredi matin est travaillé/);
  });

  test('ce qui n\'est pas dans la grille est annoncé comme absent', () => {
    // Récréations, cantine, décloisonnements : un modèle qui les suppose libres propose
    // des déplacements impossibles, et rien ne le signale.
    assert.match(contexteSemaine(SEMAINE), /Les récréations, la cantine/);
  });

  test('une grille cassée dit ce qui manque', () => {
    const courte = SEMAINE.slice(0, 3);
    const t = contexteSemaine(courte);
    assert.ok(!verdict(courte).tient);
    assert.doesNotMatch(t, /Les volumes réglementaires des deux niveaux sont atteints/);
  });

  test('« rattraper » n\'apparaît que s\'il y a quelque chose à rattraper', () => {
    const noms = (tient) => ici('semaine', { creneaux: SEMAINE, tient }).map((g) => g.id);
    assert.ok(!noms(true).includes('equilibrer-semaine'),
      'proposer de rattraper une semaine qui tient, c\'est « voilà tout ce que je sais faire »');
    assert.ok(noms(false).includes('equilibrer-semaine'));
    // Le cahier du remplaçant, lui, sert dans les deux cas.
    assert.ok(noms(true).includes('cahier-remplacant'));
  });

  test('le cahier du remplaçant a l\'interdiction d\'écrire sur un élève', () => {
    const g = GESTES.find((x) => x.id === 'cahier-remplacant');
    assert.match(g.consigne, /RIEN sur un élève en particulier/);
    assert.match(g.consigne, /traîne sur un bureau/);
  });

  test('la précision de l\'enseignant vient en dernier et est nommée', () => {
    const t = texteSemaine(GESTES.find((g) => g.id === 'cahier-remplacant'), SEMAINE,
                           { precision: 'Je suis absent jeudi.' });
    assert.match(t, /CE QUE L'ENSEIGNANT PRÉCISE[\s\S]*Je suis absent jeudi\./);
  });
});

describe('la classe', () => {
  test('sans aucune observation, l\'interdiction de décrire quiconque part', () => {
    const t = contexteClasse({ classe: CLASSE });
    assert.match(t, /AUCUNE OBSERVATION N'A ÉTÉ RELEVÉE/);
    assert.match(t, /tu ne décris personne/);
  });

  test('avec des observations, on dit sur COMBIEN d\'élèves — donc pas sur les autres', () => {
    const releves = [
      { eleve: 'Élève 03', attendu: 'accord sujet-verbe', niveau: 'partiellement', date: '2026-09-20' },
      { eleve: 'Élève 07', attendu: 'accord sujet-verbe', niveau: 'atteint', date: '2026-09-20' }
    ];
    const t = contexteClasse({ classe: CLASSE, releves });
    assert.match(t, /2 observation\(s\) sur 2 élève\(s\) — donc pas sur les autres/);
    assert.match(t, /n'est pas « non atteint »/);
  });

  test('aucun prénom ne peut sortir : le contexte n\'en contient aucun', () => {
    const t = contexteClasse({ classe: CLASSE, semaine: SEMAINE });
    for (const e of CLASSE) {
      assert.ok(!t.includes(e.prenom), `« ${e.prenom} » ne doit pas être dans le contexte`);
    }
    assert.match(t, /jamais un prénom/);
  });

  test('le mot aux familles exige de savoir ce qu\'il annonce', () => {
    const g = GESTES.find((x) => x.id === 'mot-familles');
    // Sans information, ce geste n'a rien à écrire — et ce qu'il écrirait partirait
    // dans vingt-six cahiers.
    assert.ok(g.exige, 'l\'écran doit pouvoir désactiver ce bouton tant qu\'il est vide');
    assert.match(g.consigne, /Tu ne nommes AUCUN élève/);
    assert.match(g.consigne, /Tu n'inventes ni date/);
  });

  test('les groupes de besoin refusent de se former sur rien', () => {
    const g = GESTES.find((x) => x.id === 'groupes-de-besoin');
    assert.match(g.consigne, /tu ne constitues AUCUN groupe/);
    assert.match(g.consigne, /critère de sortie/);
    assert.match(g.consigne, /pas de groupes permanents|ne fais pas de groupes permanents/);
  });

  test('la précision de l\'enseignant est nommée là aussi', () => {
    const t = texteClasse(GESTES.find((g) => g.id === 'mot-familles'),
                          { classe: CLASSE, precision: 'Sortie au musée le 12 mars.' });
    assert.match(t, /CE QUE L'ENSEIGNANT PRÉCISE[\s\S]*Sortie au musée le 12 mars\./);
  });
});
