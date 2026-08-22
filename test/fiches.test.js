import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { semeur, GENERATEURS, pourLeNiveau } from '../lib/calculs.js';
import { comprendre, fabriquer, lireLesExercices } from '../lib/exercices.js';
import { blocsDeFiche, blocsDeCorrige, aucuneReponse } from '../lib/fiche.js';
import { nu } from '../lib/miseenforme.js';
import { laListe, lAnnee, etat, SEMAINES, PAR_JOUR } from '../lib/mots.js';
import { lAnneeDouble, protegees, libre, laPoesie } from '../lib/poesies.js';
import { FABRIQUES, parFamille, planche, FORMATS, lireLesItems,
         enLettres, cellule } from '../lib/materiel.js';
import { FAMILLES, MONTESSORI, GRAMMAIRE, CRAYONS, PASTELS, contraste, lisible, ENCRE,
         PAPIER } from '../lib/couleurs.js';
import { MOTIFS, grille, pointsARelier } from '../lib/dessins.js';
import { docx } from '../lib/docx.js';

/*
 * Une cellule de tableau est soit un tableau de lignes, soit un objet qui porte en plus
 * sa couleur. Les tests lisent son texte par ici, une fois pour toutes.
 */
const txt = (c) => cellule(c).lignes[0];

describe('les réponses se calculent, elles ne se demandent pas', () => {
  test('chaque générateur rend des réponses JUSTES', () => {
    /*
     * Le test qui justifie tout le module. Un modèle qui rate une multiplication produit
     * un corrigé impeccable et faux — que personne ne relit, parce qu'on ne relit pas un
     * corrigé de tables. Ici, on vérifie.
     */
    const r = semeur(12345);
    const verifs = {
      tables: (e) => {
        const [a, , b] = e.enonce.replace(' =', '').split(' ');
        return String(Number(a) * Number(b)) === e.reponse;
      },
      'addition-posee': (e) => {
        const [a, , b] = e.enonce.split(' ');
        return String(Number(a) + Number(b)) === e.reponse;
      },
      'soustraction-posee': (e) => {
        const [a, , b] = e.enonce.split(' ');
        return String(Number(a) - Number(b)) === e.reponse && Number(e.reponse) > 0;
      },
      'multiplication-posee': (e) => {
        const [a, , b] = e.enonce.split(' ');
        return String(Number(a) * Number(b)) === e.reponse;
      },
      division: (e) => {
        const [a, , b] = e.enonce.split(' ');
        const [q, , reste] = e.reponse.split(' ');
        return Number(q) * Number(b) + Number(reste) === Number(a) && Number(reste) < Number(b);
      },
      'multiplier-10': (e) => {
        const [a, , f] = e.enonce.replace(' =', '').split(' ');
        return String(Number(a) * Number(f)) === e.reponse;
      }
    };
    for (const g of GENERATEURS) {
      const items = g.faire(semeur(99), { niveau: g.niveaux[0] });
      assert.ok(items.length > 0, `${g.id} ne produit rien`);
      const verif = verifs[g.id];
      if (!verif) continue;
      for (const e of items) {
        assert.ok(verif(e), `${g.id} : « ${e.enonce} » → « ${e.reponse} » est FAUX`);
      }
    }
  });

  test('« avec retenue » et « sans retenue » sont vérifiés, pas espérés', () => {
    const g = GENERATEURS.find((x) => x.id === 'addition-posee');
    for (const retenue of [true, false]) {
      for (const e of g.faire(semeur(7), { retenue, combien: 8, niveau: 'CE2' })) {
        const [a, , b] = e.enonce.split(' ');
        const chiffres = String(a).split('').reverse();
        const autres = String(b).split('').reverse();
        const aRetenue = chiffres.some((c, i) => Number(c) + Number(autres[i] || 0) >= 10);
        assert.equal(aRetenue, retenue, `« ${e.enonce} » ne respecte pas la demande`);
      }
    }
  });

  test('la moitié n\'est demandée que sur un nombre pair', () => {
    const g = GENERATEURS.find((x) => x.id === 'doubles');
    for (const e of g.faire(semeur(5), { combien: 40 })) {
      const m = /la moitié de (\d+)/.exec(e.enonce);
      if (m) assert.equal(Number(m[1]) % 2, 0, `« ${e.enonce} » n'est pas au programme`);
    }
  });

  test('la même graine rend la même fiche — on réimprime celle qu\'on a perdue', () => {
    const a = fabriquer('table de 7', { graine: 42 });
    const b = fabriquer('table de 7', { graine: 42 });
    const c = fabriquer('table de 7', { graine: 43 });
    assert.deepEqual(a.items, b.items);
    assert.notDeepEqual(a.items, c.items);
  });

  test('le CE2 ne voit pas ce qui n\'est pas à son programme', () => {
    const ids = pourLeNiveau('CE2').map((g) => g.id);
    assert.ok(!ids.includes('fractions'));
    assert.ok(!ids.includes('division'));
    assert.ok(ids.includes('tables'));
  });
});

describe('comprendre une demande écrite en français', () => {
  test('la table demandée est lue dans la phrase', () => {
    const r = comprendre('je veux une evaluation des multiplications de table de 5');
    assert.equal(r.genre, 'calcul');
    assert.equal(r.generateur.id, 'tables');
    assert.deepEqual(r.options.tables, [5]);
  });

  test('plusieurs tables, et une quantité', () => {
    const r = comprendre('les tables de 6 et 7, 24 questions');
    assert.deepEqual(r.options.tables, [6, 7]);
    assert.equal(r.options.combien, 24);
  });

  test('le niveau écrit dans la phrase prime sur celui de l\'écran', () => {
    assert.equal(comprendre('des divisions CM1', { niveau: 'CE2' }).niveau, 'CM1');
  });

  test('le plus précis gagne', () => {
    // « multiplication posée » ne doit pas rendre des tables.
    assert.equal(comprendre('des multiplications posées').generateur.id,
                 'multiplication-posee');
  });

  test('ce qui n\'est pas calculable part au modèle, et on le dit', () => {
    const r = comprendre('une évaluation sur le passé composé');
    assert.equal(r.genre, 'modele');
  });

  test('les mots qui ont SERVI ne sont pas listés comme incompris', () => {
    // Du bruit dans une alerte, c'est ce qui fait qu'on cesse de la lire.
    for (const d of ['conversions de longueurs CE2', 'les tables de 6 et 7, 24 questions',
                     'des additions posées avec retenue pour les CM1']) {
      assert.deepEqual(comprendre(d).ignores, [], `« ${d} » signale des mots à tort`);
    }
  });

  test('on dit quand on ne peut pas donner la quantité demandée', () => {
    // Il n'existe que vingt faits sur deux tables. Silencieusement, ça ressemble à une panne.
    const r = fabriquer('les tables de 6 et 7, 24 questions');
    assert.deepEqual(r.manque, { demande: 24, obtenu: 20 });
    assert.equal(fabriquer('table de 5').manque, null);
  });
});

describe('LA FICHE DE L\'ÉLÈVE EST VIDE', () => {
  test('elle ne porte aucune réponse, quelle que soit la demande', () => {
    for (const d of ['table de 5', 'additions posées CM1', 'conversions CE2',
                     'décomposer CE2', 'durées CE2', 'périmètre CM1', 'fractions CM1',
                     'divisions CM1', 'comparer les nombres CE2', 'doubles CE2']) {
      const r = fabriquer(d, { niveau: 'CM1' });
      if (!r.fiche) continue;
      assert.equal(aucuneReponse(r.fiche).propre, true, `« ${d} » : la fiche n'est pas vide`);
      // Aucun item de la fiche ne porte de champ de réponse, sous quelque nom que ce soit.
      for (const it of r.fiche.items) {
        assert.deepEqual(Object.keys(it).sort(), ['enonce', 'numero', 'place']);
      }
    }
  });

  test('une fiche trafiquée est REFUSÉE, pas nettoyée', () => {
    const truquee = { sansReponses: true, titre: 'x',
                      items: [{ numero: 1, enonce: 'a', reponse: 'b', place: 'case' }] };
    const c = aucuneReponse(truquee);
    assert.equal(c.propre, false);
    assert.match(c.pourquoi, /portent encore une réponse/);
  });

  test('une fiche non marquée ne s\'imprime pas du tout', () => {
    assert.throws(() => blocsDeFiche({ items: [] }), /refus d'imprimer/);
  });

  test('le corrigé est un document SÉPARÉ qui dit son nom', () => {
    const r = fabriquer('table de 5');
    const b = blocsDeCorrige(r.corrige);
    const t = b.map(nu).join('\n');
    assert.match(t, /^CORRIGÉ —/);
    assert.match(t, /à ne pas distribuer/);
    // Et il porte bien les réponses, lui.
    assert.match(t, /→ \d+/);
  });

  test('les opérations posées ont la place d\'être posées', () => {
    const r = fabriquer('additions posées CM1');
    const b = blocsDeFiche(r.fiche);
    const grille = b.find((x) => x.hautesCases);
    assert.ok(grille, 'sans cases hautes, l\'élève ne peut pas poser ses colonnes');
  });
});

describe('les listes de mots', () => {
  test('trente-six semaines pleines, dans les deux niveaux', () => {
    for (const e of etat()) {
      assert.equal(e.complet, true, `${e.niveau} n'a que ${e.semaines} semaines`);
      assert.equal(e.semaines, SEMAINES);
    }
  });

  test('chaque semaine porte une règle, pas un tas de mots', () => {
    // Une liste tirée au sort n'apprend rien : l'enfant mémorise un par un et oublie.
    for (const niveau of ['CE2', 'CM1']) {
      for (const l of lAnnee(niveau)) {
        assert.ok(l.regle && l.regle.length > 5, `${niveau} s${l.semaine} : pas de règle`);
        assert.ok(l.mots.length >= 15, `${niveau} s${l.semaine} : trop peu de mots`);
      }
    }
  });

  test('le découpage est de cinq mots par jour', () => {
    const l = laListe('CE2', 3);
    assert.equal(l.jours.length, Math.ceil(l.mots.length / PAR_JOUR));
    for (const j of l.jours.slice(0, -1)) assert.equal(j.length, PAR_JOUR);
  });

  test('aucun doublon dans une même liste', () => {
    for (const niveau of ['CE2', 'CM1']) {
      for (const l of lAnnee(niveau)) {
        assert.equal(new Set(l.mots).size, l.mots.length,
          `${niveau} s${l.semaine} : deux fois le même mot dans une dictée`);
      }
    }
  });

  test('aucun caractère parasite', () => {
    // Un caractère hors alphabet latin s'était glissé dans une liste : imprimé, il aurait
    // été dicté à des enfants.
    const mauvais = /[^\p{Script=Latin}\p{M}\s'’/-]/u;
    for (const niveau of ['CE2', 'CM1']) {
      for (const l of lAnnee(niveau)) {
        for (const m of l.mots) {
          assert.ok(!mauvais.test(m), `${niveau} s${l.semaine} : « ${m} »`);
        }
      }
    }
  });
});

describe('le programme de poésies', () => {
  test('trente-six semaines pour CHAQUE niveau — aucun trou', () => {
    /*
     * Première version : les poésies difficiles étaient réservées au CM1, et le CE2 se
     * retrouvait avec onze semaines vides. Un programme troué ne s'utilise pas.
     */
    const a = lAnneeDouble();
    assert.equal(a.length, 36);
    for (const s of a) {
      assert.ok(s.CE2?.titre, `semaine ${s.semaine} : rien pour le CE2`);
      assert.ok(s.CM1?.titre, `semaine ${s.semaine} : rien pour le CM1`);
    }
  });

  test('aucun texte de poème n\'est reproduit', () => {
    // La raison est juridique autant que technique : un poème reste protégé soixante-dix
    // ans après la mort de son auteur, et un texte récité de mémoire revient faux.
    for (const s of lAnneeDouble()) {
      for (const niveau of ['CE2', 'CM1']) {
        const p = s[niveau];
        assert.ok(!('texte' in p), `semaine ${s.semaine} : un texte est reproduit`);
        assert.ok(p.titre.length < 60, 'un titre, pas un vers');
      }
    }
  });

  test('le domaine public est CALCULÉ, pas recopié', () => {
    assert.equal(libre(1896, 2026), true);   // Verlaine
    assert.equal(libre(1977, 2026), false);  // Prévert
    assert.equal(libre(1955, 2026), true);
    assert.equal(libre(1956, 2026), false);
    assert.equal(libre(0, 2026), false);
  });

  test('les auteurs encore protégés sont nommés, avec l\'année de libération', () => {
    const p = protegees(2026);
    assert.ok(p.length > 0);
    const prevert = p.find((x) => x.auteur === 'Jacques Prévert');
    assert.ok(prevert, 'Prévert est le plus récité de l\'école : il doit être signalé');
    assert.equal(prevert.libreEn, 2048);
  });

  test('chaque entrée dit où trouver le texte', () => {
    const p = laPoesie(2, { niveau: 'CM1' });
    assert.match(p.ou, /Chanson d'automne Paul Verlaine/);
    assert.match(p.ou, /deux sources/);
  });
});

describe('le matériel imprimable', () => {
  test('chaque fabrique produit quelque chose, sans réglage', () => {
    for (const f of FABRIQUES) {
      const r = f.faire({});
      assert.ok(r.titre, `${f.id} n'a pas de titre`);
      assert.ok(r.blocs.length, `${f.id} ne produit aucun bloc`);
    }
  });

  test('les dominos BOUCLENT — sinon le jeu est cassé', () => {
    /*
     * Un jeu de dominos qui ne boucle pas est un jeu cassé : les enfants arrivent au bout
     * et il reste des pièces. C'est vérifiable, donc c'est vérifié.
     */
    const d = FABRIQUES.find((f) => f.id === 'dominos-calcul').faire({ combien: 16 });
    const rangs = d.blocs.find((b) => b.type === 'tableau').rangs;
    for (let i = 0; i < rangs.length; i++) {
      const calcul = txt(rangs[i][1]);
      const [a, , b] = calcul.split(' ');
      const suivant = txt(rangs[(i + 1) % rangs.length][0]);
      assert.equal(String(Number(a) * Number(b)), suivant,
        `le domino ${i + 1} ne se raccorde pas au suivant`);
    }
  });

  test('le verso d\'une planche est en MIROIR', () => {
    // Sans l'inversion, chaque résultat tombe derrière la mauvaise carte et la planche
    // est bonne à jeter.
    const recto = planche(['a', 'b', 'c'], FORMATS.cartes);
    const verso = planche(['1', '2', '3'], FORMATS.cartes, { miroir: true });
    assert.deepEqual(recto.rangs[0].map(txt), ['a', 'b', 'c']);
    assert.deepEqual(verso.rangs[0].map(txt), ['3', '2', '1']);
  });

  test('une planche incomplète est complétée par des cases vides', () => {
    const p = planche(['a', 'b'], FORMATS.cartes);
    assert.equal(p.rangs[0].length, FORMATS.cartes.colonnes);
  });

  test('la bande numérique ne saute aucun nombre', () => {
    const b = FABRIQUES.find((f) => f.id === 'bande-numerique').faire({ de: 0, a: 100 });
    const tous = b.blocs[0].rangs.flat().map((c) => Number(txt(c)));
    assert.equal(tous.length, 101);
    for (let i = 0; i <= 100; i++) assert.equal(tous[i], i, `il manque ${i}`);
  });

  test('ce qui n\'est pas un item est écarté, et compté', () => {
    const { items, ecartees } = lireLesItems(
      'Voici la liste des mots demandés :\n- chat || le chat\n2. chien || le chien\nfleur');
    assert.equal(items.length, 3);
    assert.deepEqual(items[0], { gauche: 'chat', droite: 'le chat' });
    assert.deepEqual(items[2], { gauche: 'fleur', droite: '' });
    assert.equal(ecartees.length, 1);
  });
});

describe('ce que le modèle doit rendre pour une fiche', () => {
  test('énoncé et réponse se séparent — sans ça, pas de fiche vide possible', () => {
    const { items, consigne } = lireLesExercices(
      'CONSIGNE : Conjugue au présent.\n1. chanter, 3e pers. pluriel || ils chantent\n'
      + '2. Contraire de rapide ? || lent');
    assert.equal(consigne, 'Conjugue au présent.');
    assert.equal(items.length, 2);
    assert.equal(items[0].reponse, 'ils chantent');
  });

  test('une ligne sans réponse n\'entre pas dans la fiche', () => {
    // Un exercice dont on ne sait pas isoler la réponse ne peut pas être donné aux enfants.
    const { items } = lireLesExercices('Voici quelques exercices pour la classe.');
    assert.equal(items.length, 0);
  });
});

describe('l\'inventaire tient dans une année', () => {
  test('chaque semaine fait un multiple de cinq mots', () => {
    /*
     * Cinq mots par jour, quatre jours. Une semaine de dix-neuf mots donne un jour à
     * quatre — ça ne se voit pas dans le code, ça se voit dans le cahier de l'enfant.
     * C'est arrivé : en retirant un caractère parasite, j'ai laissé la liste à 19.
     */
    for (const niveau of ['CE2', 'CM1']) {
      for (const l of lAnnee(niveau)) {
        assert.equal(l.mots.length % PAR_JOUR, 0,
          `${niveau} semaine ${l.semaine} : ${l.mots.length} mots`);
      }
    }
  });

  test('le compte annoncé est le compte réel', () => {
    // 36 semaines × 20 mots × 2 niveaux.
    assert.deepEqual(etat().map((e) => e.mots), [720, 720]);
  });
});

describe('le catalogue entier tient debout', () => {
  test('chaque fiche produit quelque chose, dans les deux niveaux', () => {
    for (const f of FABRIQUES) {
      for (const niveau of ['CE2', 'CM1']) {
        const r = f.faire({ niveau, classe: [{ prenom: 'Ambre' }, { prenom: 'Tom' }] });
        assert.ok(r.titre, `${f.id} : pas de titre`);
        assert.ok(r.blocs.length, `${f.id} (${niveau}) : aucun bloc`);
      }
    }
  });

  test('chaque fiche est rangée dans une famille et sait se faire trouver', () => {
    // Trente fiches en vrac, c'est le catalogue qu'on s'interdit.
    for (const f of FABRIQUES) {
      assert.ok(f.famille, `${f.id} n'a pas de famille`);
      assert.ok(f.mots?.length >= 2, `${f.id} : trop peu de mots pour être cherchée`);
      assert.ok(f.pour?.length > 10, `${f.id} : on ne sait pas à quoi elle sert`);
    }
    assert.ok(parFamille().length >= 5);
  });

  test('la table de Pythagore est juste, et ses trous sont vraiment vides', () => {
    const pleine = FABRIQUES.find((f) => f.id === 'pythagore').faire({});
    const rangs = pleine.blocs[0].rangs;
    for (let l = 1; l <= 10; l++) {
      for (let c = 1; c <= 10; c++) {
        assert.equal(txt(rangs[l][c]), String(l * c), `${l} × ${c} est faux`);
      }
    }
    const trouee = FABRIQUES.find((f) => f.id === 'pythagore').faire({ aTrous: true });
    const vides = trouee.blocs[0].rangs.flat().filter((c) => txt(c) === '').length;
    assert.ok(vides > 5 && vides < 60, `${vides} trous : trop, ou pas assez`);
  });

  test('« le compte est bon » a toujours une solution', () => {
    /*
     * Un but inatteignable, c'est une classe entière qui cherche pendant dix minutes ce
     * qui n'existe pas. Le but est CONSTRUIT à partir des plaques, jamais tiré au hasard.
     */
    const j = FABRIQUES.find((f) => f.id === 'compte-est-bon').faire({ combien: 20 });
    for (const rang of j.blocs[0].rangs.slice(1)) {
      const plaques = txt(rang[0]).split(/\s+/).map(Number);
      const but = Number(txt(rang[1]));
      assert.equal(plaques.length, 6);
      assert.ok(but > 0 && but < 10000, `but invraisemblable : ${but}`);
    }
  });

  test('les nombres en lettres suivent les règles françaises', () => {
    // « quatre-vingts » prend un s, « quatre-vingt-un » non. Une règle ne se trompe pas
    // une fois sur cinquante ; un modèle, si.
    assert.equal(enLettres(21), 'vingt et un');
    assert.equal(enLettres(71), 'soixante et onze');
    assert.equal(enLettres(80), 'quatre-vingts');
    assert.equal(enLettres(81), 'quatre-vingt-un');
    assert.equal(enLettres(100), 'cent');
    assert.equal(enLettres(200), 'deux cents');
    assert.equal(enLettres(201), 'deux cent un');
    assert.equal(enLettres(1000), 'mille');
    assert.equal(enLettres(3562), 'trois mille cinq cent soixante-deux');
  });

  test('l\'alphabet mobile a assez de lettres pour écrire un mot long', () => {
    const a = FABRIQUES.find((f) => f.id === 'alphabet-mobile').faire({});
    const lettres = a.blocs.find((b) => b.cartes).rangs.flat().map(txt).filter(Boolean);
    for (const c of 'maitresse') {
      const dispo = lettres.filter((x) => x === c).length;
      const besoin = 'maitresse'.split('').filter((x) => x === c).length;
      assert.ok(dispo >= besoin, `pas assez de « ${c} » pour écrire « maitresse »`);
    }
  });

  test('les étiquettes au nom des élèves refusent de deviner une classe', () => {
    const f = FABRIQUES.find((x) => x.id === 'etiquettes-classe');
    const vide = f.faire({ classe: [] });
    assert.match(nu(vide.blocs[0]), /liste de classe n'est pas saisie/);
    const pleine = f.faire({ classe: [{ prenom: 'Ambre' }], exemplaires: 4 });
    const noms = pleine.blocs[0].rangs.flat().map(txt).filter(Boolean);
    assert.equal(noms.filter((n) => n === 'Ambre').length, 4);
  });

  test('la bande numérique et le quadrillage n\'ont aucun trou', () => {
    const q = FABRIQUES.find((f) => f.id === 'quadrillage').faire({ colonnes: 16, lignes: 22 });
    const rangs = q.blocs[0].rangs;
    assert.equal(rangs.length, 22);
    for (const r of rangs) assert.equal(r.length, 16);
  });
});

describe('la couleur, parce que ce sont des enfants', () => {
  test('tout fond déclaré se lit en noir, tout trait se lit sur du blanc', () => {
    /*
     * Un fond trop sombre sous du texte noir donne une page qu'on ne lit pas — et on ne
     * s'en aperçoit qu'après l'impression, cartouche vidée. Le seuil est celui de la
     * WCAG : ce n'est pas une question de goût, c'est une question de lisibilité.
     */
    const couples = [];
    for (const [nom, f] of Object.entries(FAMILLES)) couples.push([`famille ${nom}`, f]);
    for (const [nom, m] of Object.entries(MONTESSORI)) couples.push([`montessori ${nom}`, m]);
    for (const g of GRAMMAIRE) couples.push([`grammaire ${g.nature}`, g]);
    for (const c of CRAYONS) couples.push([`crayon ${c.nom}`, c]);
    for (const [nom, c] of couples) {
      assert.ok(lisible(c.fond), `${nom} : fond illisible sous l'encre noire`);
      assert.ok(contraste(c.trait, PAPIER) >= 4.5, `${nom} : trait illisible sur blanc`);
    }
    for (const p of PASTELS) assert.ok(lisible(p), `pastel ${p} illisible`);
  });

  test('aucune fiche d\'élève ne prend sa première ligne pour un en-tête', () => {
    /*
     * La première rangée d'un tableau est un en-tête — sauf quand ce n'en est pas un.
     * Sur la fiche des élèves, l'exercice n° 1 ressortait en gras et en bleu, comme un
     * titre : trois exercices sur dix avaient l'air de compter plus que les autres.
     */
    const f = fabriquer('une évaluation des multiplications de la table de 5',
                        { niveau: 'CE2' });
    for (const b of [...blocsDeFiche(f.fiche), ...blocsDeCorrige(f.corrige)]) {
      if (b.type === 'tableau') assert.equal(b.entete, false, 'un tableau garde un en-tête');
    }
    for (const fab of FABRIQUES) {
      const r = fab.faire({ classe: [{ prenom: 'Ambre' }] });
      for (const b of r.blocs) {
        if (b.type !== 'tableau' || b.cartes || b.entete === false) continue;
        // Un vrai en-tête nomme ses colonnes : sa première rangée ne doit pas être une
        // rangée de données comme les suivantes.
        assert.ok(b.rangs.length > 1, `${fab.id} : un tableau d'une seule rangée en en-tête`);
      }
    }
  });

  test('chaque fiche porte une icône et une famille connue', () => {
    for (const f of FABRIQUES) {
      assert.ok(f.emoji, `${f.id} : pas d'icône`);
      assert.ok(FAMILLES[f.famille], `${f.id} : famille « ${f.famille} » sans couleur`);
    }
  });

  test('les couleurs Montessori sont celles du matériel, et pas d\'autres', () => {
    /*
     * Un enfant qui a manipulé le matériel reconnaît la centaine à son rouge avant de
     * lire le nombre. En changer ne casse rien de visible ici — mais casse l'accord avec
     * le matériel déjà présent dans la classe. C'est donc figé, et le test le dit.
     */
    assert.equal(MONTESSORI.unites.teinte, 'vert');
    assert.equal(MONTESSORI.dizaines.teinte, 'bleu');
    assert.equal(MONTESSORI.centaines.teinte, 'rouge');
    assert.equal(MONTESSORI.voyelle.teinte, 'rouge');
    assert.equal(MONTESSORI.consonne.teinte, 'bleu');
    assert.equal(GRAMMAIRE.find((g) => g.nature === 'verbe').teinte, 'rouge');
    assert.equal(GRAMMAIRE.find((g) => g.nature === 'nom').teinte, 'noir');
  });

  test('le Word porte vraiment la couleur, pas seulement l\'écran', () => {
    // Le ZIP est écrit sans compression : le XML se lit tel quel dans les octets.
    const c = FABRIQUES.find((f) => f.id === 'cartes-numeration').faire({});
    const xml = new TextDecoder().decode(docx(c.blocs));
    assert.match(xml, /w:shd w:val="clear" w:color="auto" w:fill="FBDEDE"/,
      'le fond rouge des centaines ne ressort pas dans le document');
    assert.match(xml, /w:color w:val="1F6B4F"/, 'le vert des unités ne ressort pas');
  });

  test('la diagonale de Pythagore est teintée, et elle seule', () => {
    const p = FABRIQUES.find((f) => f.id === 'pythagore').faire({});
    const rangs = p.blocs[0].rangs;
    for (let l = 1; l <= 10; l++) {
      for (let c = 1; c <= 10; c++) {
        const teinte = Boolean(cellule(rangs[l][c]).fond);
        assert.equal(teinte, l === c, `la case ${l} × ${c} est teintée de travers`);
      }
    }
  });
});

describe('les dessins qui se calculent', () => {
  const CALCUL = /^(\d+)\s*([×+−:])\s*(\d+)$/;
  const evaluer = (t) => {
    const m = CALCUL.exec(String(t).trim());
    assert.ok(m, `« ${t} » n'est pas un calcul lisible`);
    const [, a, signe, b] = m;
    return { '×': Number(a) * Number(b), '+': Number(a) + Number(b),
             '−': Number(a) - Number(b), ':': Number(a) / Number(b) }[signe];
  };

  test('chaque motif remplit une partie de la grille, sans la remplir toute', () => {
    // Un motif entièrement d'une couleur donne une page unie : ce n'est pas un dessin.
    for (const m of MOTIFS) {
      const g = grille(m, { colonnes: 14, lignes: 14 }).flat();
      const teintes = new Set(g);
      assert.ok(teintes.size >= 2, `${m.id} : une seule couleur, il n'y a pas de dessin`);
      const dessin = g.filter((k) => k !== m.fond).length;
      assert.ok(dessin > 20 && dessin < g.length - 20,
        `${m.id} : ${dessin} cases dessinées sur ${g.length}, le dessin ne se voit pas`);
    }
  });

  test('LE COLORIAGE DONNE BIEN LE DESSIN — case par case', () => {
    /*
     * ── LE SEUL TEST QUI COMPTE VRAIMENT ICI ──────────────────────────────
     *
     * On refait ce que fait l'enfant : on calcule chaque case, on cherche sa tranche dans
     * la légende, on en tire une couleur. Et on compare au dessin. Une seule case fausse
     * et l'enfant colorie de travers sans jamais savoir pourquoi — il croira s'être
     * trompé. C'est exactement le genre d'erreur qu'on ne voit pas en relisant la fiche.
     */
    for (const m of MOTIFS) {
      for (const niveau of ['CE2', 'CM1']) {
        const f = FABRIQUES.find((x) => x.id === 'coloriage-magique')
          .faire({ motif: m.id, niveau, graine: 7 });
        const [legende, cases] = f.blocs.filter((b) => b.type === 'tableau');

        const bandes = legende.rangs.slice(1).map((rang) => {
          const t = /de (\d+) à (\d+)/.exec(txt(rang[0]));
          assert.ok(t, 'la légende ne se lit pas');
          return { bas: Number(t[1]), haut: Number(t[2]), couleur: txt(rang[1]) };
        });
        // Deux tranches qui se chevauchent, et la case n'a plus de couleur unique.
        for (let i = 1; i < bandes.length; i++) {
          assert.ok(bandes[i].bas > bandes[i - 1].haut,
            `${m.id} ${niveau} : deux tranches de la légende se chevauchent`);
        }

        const attendu = grille(m, { colonnes: 14, lignes: 14 });
        cases.rangs.forEach((rang, l) => rang.forEach((c, col) => {
          const resultat = evaluer(txt(c));
          assert.ok(Number.isInteger(resultat) && resultat > 0,
            `${m.id} : « ${txt(c)} » ne tombe pas sur un entier positif`);
          const bande = bandes.filter((b) => resultat >= b.bas && resultat <= b.haut);
          assert.equal(bande.length, 1,
            `${m.id} : le résultat ${resultat} ne tombe dans aucune couleur`);
          assert.equal(bande[0].couleur, CRAYONS[attendu[l][col]].nom,
            `${m.id} ${niveau} : la case ligne ${l + 1}, colonne ${col + 1} sort en `
            + `${bande[0].couleur} au lieu de ${CRAYONS[attendu[l][col]].nom}`);
        }));
      }
    }
  });

  test('la fiche à colorier est BLANCHE, le corrigé est peint', () => {
    // Donner à l'enfant une fiche déjà coloriée, c'est la même faute que donner une
    // évaluation déjà remplie.
    const nue = FABRIQUES.find((f) => f.id === 'coloriage-magique').faire({ motif: 'coeur' });
    const peinte = FABRIQUES.find((f) => f.id === 'coloriage-magique')
      .faire({ motif: 'coeur', corrige: true });
    const fonds = (fiche) => fiche.blocs.filter((b) => b.type === 'tableau')[1]
      .rangs.flat().filter((c) => cellule(c).fond).length;
    assert.equal(fonds(nue), 0, 'la fiche des élèves sort déjà coloriée');
    assert.equal(fonds(peinte), 14 * 14, 'le corrigé n\'est pas peint');
    assert.match(peinte.titre, /corrigé/, 'le corrigé ne se nomme pas comme tel');
  });

  test('les points à relier se suivent, et deux points ne se superposent jamais', () => {
    /*
     * Arrondis à la case, deux points voisins tombent parfois au même endroit : l'enfant
     * voit « 7 » et « 8 » l'un sur l'autre et ne sait plus où aller.
     */
    for (const m of MOTIFS) {
      const p = pointsARelier(m, { colonnes: 18, lignes: 20, combien: 28 });
      assert.ok(p.length >= 14, `${m.id} : seulement ${p.length} points, le dessin est perdu`);
      assert.deepEqual(p.map((x) => x.numero), p.map((_, i) => i + 1),
        `${m.id} : la numérotation saute`);
      const places = new Set(p.map((x) => `${x.colonne}:${x.ligne}`));
      assert.equal(places.size, p.length, `${m.id} : deux points dans la même case`);
    }
  });

  test('la fiche de points à relier n\'écrit que ses points', () => {
    const f = FABRIQUES.find((x) => x.id === 'points-a-relier').faire({ motif: 'maison' });
    const cases = f.blocs.find((b) => b.type === 'tableau').rangs.flat();
    const marques = cases.filter((c) => txt(c) === '•');
    assert.ok(marques.length >= 14);
    /*
     * Les points suivent le CONTOUR du dessin, pas l'ordre de lecture de la page : le
     * numéro 8 est souvent plus haut que le 7. Ce qui doit être vrai, c'est qu'aucun
     * numéro ne manque et qu'aucun n'apparaît deux fois — sinon le tracé s'interrompt.
     */
    const numeros = marques.map((c) => Number(cellule(c).lignes[1]));
    assert.deepEqual([...numeros].sort((a, b) => a - b),
                     numeros.map((_, i) => i + 1),
                     'un numéro manque, ou apparaît deux fois');
    const vides = cases.filter((c) => txt(c) === '').length;
    assert.equal(vides + marques.length, cases.length,
      'une case porte autre chose qu\'un point ou du vide');
  });
});
