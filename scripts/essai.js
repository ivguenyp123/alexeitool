/*
 * Un vrai appel au fournisseur — le seul endroit qui en fait un hors de l'outil.
 *
 * Ce qu'il vérifie ne se vérifie pas autrement : que la clé est valide, que le réseau
 * sortant autorise le fournisseur, et que le modèle déclaré au registre existe encore.
 * Les tests, eux, tournent sans clé — et c'est très bien ainsi.
 *
 * Il n'envoie AUCUNE production d'élève. Une phrase neutre suffit à savoir si le tuyau est
 * ouvert, et un essai de plomberie n'a aucune raison de transporter le travail d'un enfant.
 */
import { createMoteur } from '../runtime/moteur.js';
import { readFileSync } from 'node:fs';

const models = [];
for (const ligne of readFileSync(new URL('../registries/models.yaml', import.meta.url), 'utf8').split('\n')) {
  const debut = /^\s*-\s*tier:\s*(\S+)/.exec(ligne);
  if (debut) { models.push({ tier: debut[1] }); continue; }
  const paire = /^\s+(\w+):\s*(.+?)\s*$/.exec(ligne);
  if (paire && models.length) models[models.length - 1][paire[1]] = paire[2];
}

try {
  const moteur = createMoteur({ models });
  const r = await moteur.generer({
    prompt: 'Réponds exactement : le tuyau est ouvert.',
    tier: 'nano', temperature: 0, maxTokens: 32
  });
  console.log(`✓ ${r.fournisseur} · ${r.modele} · ${r.jetons.entree}+${r.jetons.sortie} jetons`);
  console.log(`  réponse : ${r.texte.trim()}`);
} catch (e) {
  // Le client porté nomme déjà les refus. On relaie son message tel quel : il est plus
  // précis que tout ce qu'on réécrirait ici.
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
