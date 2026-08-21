/*
 * La bascule des programmes.
 *
 * Une classe de CE2-CM1 en 2026-2027 est à cheval sur deux transitions à la fois : deux
 * cycles, ET deux générations de programmes. C'est une DATE et une RÈGLE — donc ça se
 * calcule. Un modèle interrogé là-dessus répondrait de mémoire et se tromperait d'un an.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SOURCES, BASCULE, programme, ecartDeProgramme, direLEcart } from '../lib/programmes.js';

describe('qui bascule, et quand', () => {
  test('le CM1 passe au nouveau programme dès 2026, le CE2 seulement en 2027', () => {
    assert.equal(programme('sciences', 'CM1', 2026).generation, 'nouveau');
    assert.equal(programme('eps', 'CM1', 2026).generation, 'nouveau');
    assert.equal(programme('eps', 'CE2', 2026).generation, 'ancien');
    assert.equal(programme('eps', 'CE2', 2027).generation, 'nouveau');
  });

  test('un domaine qui ne bascule pas rend `null`, pas « ancien »', () => {
    /*
     * Dire « ancien » pour le français inventerait une distinction qui n'existe pas — et
     * l'écran afficherait un avertissement là où il n'y a rien à signaler. Un
     * avertissement de trop est ce qui fait qu'on cesse de les lire.
     */
    assert.equal(programme('francais', 'CE2', 2026), null);
    assert.equal(programme('mathematiques', 'CM1', 2026), null);
    assert.ok(!('francais' in BASCULE) && !('mathematiques' in BASCULE));
  });

  test('chaque bascule porte sa source', () => {
    assert.match(programme('sciences', 'CM1', 2026).source, /MENE2611650A/);
    assert.match(programme('eps', 'CM1', 2026).source, /MENE2608631A/);
    assert.equal(SOURCES.releve, '2026-08-21');
  });
});

describe('l\'écart entre les deux groupes', () => {
  test('sur un créneau en alternance QLM / histoire-géo, l\'écart EXISTE en 2026', () => {
    /*
     * Le cas réel de cette classe : le CE2 fait « Questionner le monde » sur l'ancien
     * programme pendant que le CM1 fait de l'histoire-géo sur le nouveau. Donner le même
     * texte aux deux se tromperait pour l'un des deux, systématiquement.
     */
    const c = { regime: 'decale', CE2: { domaine: 'questionner_le_monde' },
                CM1: { domaine: 'histoire_geo_emc' } };
    const e = ecartDeProgramme(c, 2026);
    assert.ok(e, 'l\'écart doit être détecté');
    assert.equal(e.CE2.generation, 'ancien');
    assert.equal(e.CM1.generation, 'nouveau');
  });

  test('en 2027 les deux sont sur le nouveau : plus d\'écart, plus d\'avertissement', () => {
    const c = { regime: 'commun', domaine: 'eps' };
    assert.equal(ecartDeProgramme(c, 2027), null);
    assert.ok(ecartDeProgramme(c, 2026), 'mais en 2026 il y en a un');
  });

  test('un créneau de français ne déclenche aucun avertissement', () => {
    assert.equal(ecartDeProgramme({ regime: 'commun', domaine: 'francais' }, 2026), null);
    assert.equal(ecartDeProgramme({ regime: 'decale', CE2: { domaine: 'francais' },
                                    CM1: { domaine: 'francais' } }, 2026), null);
  });

  test('la phrase NOMME les deux textes et interdit de les mélanger', () => {
    const e = ecartDeProgramme({ regime: 'commun', domaine: 'eps' }, 2026);
    const p = direLEcart(e);
    assert.match(p, /CE2 : programme ANCIEN/);
    assert.match(p, /CM1 : programme NOUVEAU/);
    assert.match(p, /rentrée 2026/);
    assert.match(p, /Ne mélange pas les deux/);
    assert.match(p, /DIS que tu n'as pas fait l'autre/);
  });

  test('sans écart, la phrase est VIDE — on ne meuble pas', () => {
    assert.equal(direLEcart(null), '');
  });
});
