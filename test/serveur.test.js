/*
 * ══════════════════════════════════════════════════════════════════════════════
 *  CE QUE DIT LE SERVEUR QUAND IL NE PEUT PAS DÉMARRER
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Un message d'erreur est une partie de l'outil, pas un accident. Node répond au port
 * déjà pris par une trace d'appels de quinze lignes commençant par `EADDRINUSE` : devant
 * elle, on ne sait pas si l'outil est cassé, si l'installation a raté, ou s'il faut tout
 * reprendre. Or neuf fois sur dix il n'y a rien à réparer — l'outil tourne déjà.
 *
 * C'est le même principe que partout ailleurs ici : ne pas dire est le pire des états.
 */
import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { join } from 'node:path';

const RACINE = join(import.meta.dirname, '..');

/** Un port libre, demandé au système : deux tests en parallèle ne se marchent pas dessus. */
const portLibre = () => new Promise((ok) => {
  const s = createServer();
  s.listen(0, () => { const { port } = s.address(); s.close(() => ok(port)); });
});

/** Lancer `serve.js` sur un port et rendre tout ce qu'il a écrit avant de s'arrêter. */
const lancer = (port) => new Promise((ok) => {
  const p = spawn(process.execPath, ['serve.js'],
                  { cwd: RACINE, env: { ...process.env, PORT: String(port) } });
  let sorti = '';
  p.stdout.on('data', (d) => { sorti += d; });
  p.stderr.on('data', (d) => { sorti += d; });
  const minuteur = setTimeout(() => p.kill(), 8000);
  p.on('close', (code) => { clearTimeout(minuteur); ok({ code, sorti }); });
});

describe('le port déjà pris ne rend pas une trace d\'appels', () => {
  test('quand c\'est l\'outil qui tourne déjà, il le dit et donne l\'adresse', async () => {
    const port = await portLibre();
    const premier = spawn(process.execPath, ['serve.js'],
                          { cwd: RACINE, env: { ...process.env, PORT: String(port) } });
    after(() => premier.kill());
    // On attend qu'il réponde vraiment : sinon le second démarre avant lui et gagne.
    await new Promise((ok) => premier.stdout.once('data', ok));

    const { code, sorti } = await lancer(port);
    assert.equal(code, 1, 'le second doit s\'arrêter, pas rester bloqué');
    assert.doesNotMatch(sorti, /EADDRINUSE|at Server\./,
      'la trace d\'appels de Node ne doit pas ressortir');
    assert.match(sorti, /TOURNE DÉJÀ/);
    assert.match(sorti, new RegExp(`http://localhost:${port}`),
      'il faut donner l\'adresse à ouvrir, pas seulement le diagnostic');
    assert.match(sorti, new RegExp(`PORT=${port + 1}`), 'il faut donner la porte de sortie');
  });

  test('quand c\'est un autre programme, il ne prétend pas que c\'est lui', async () => {
    /*
     * La distinction n'est pas cosmétique : « ouvre http://localhost:8080 » envoyé à
     * quelqu'un dont le port est pris par autre chose ouvre la page de cet autre chose,
     * et la confusion dure un quart d'heure.
     */
    const port = await portLibre();
    const intrus = createServer((q, r) => r.end('ce n\'est pas l\'outil'));
    await new Promise((ok) => intrus.listen(port, ok));
    after(() => intrus.close());

    const { code, sorti } = await lancer(port);
    assert.equal(code, 1);
    assert.doesNotMatch(sorti, /TOURNE DÉJÀ/);
    assert.match(sorti, /pris par un autre programme/);
    assert.match(sorti, new RegExp(`PORT=${port + 1}`));
  });
});
