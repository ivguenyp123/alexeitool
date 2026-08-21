/*
 * Le serveur local : des fichiers, et UNE route.
 *
 * Il ne stocke rien. Tout ce que l'outil garde vit dans le navigateur, sur la machine de
 * la classe. Sa seule raison d'exister au-delà des fichiers, c'est de TENIR LA CLÉ.
 *
 * ── POURQUOI LA CLÉ NE PEUT PAS ÊTRE DANS LA PAGE ───────────────────────────
 *
 * L'outil est une page statique. Tout ce que la page connaît est lisible dans les outils
 * de développement du navigateur : il n'y a pas de « caché » côté client, seulement du
 * « pas encore regardé ». Une clé posée là est une clé publiée.
 *
 * Elle est donc lue dans l'environnement de CE processus, elle ne traverse jamais une
 * réponse, et la page appelle `/api/modele` sans jamais la voir.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { FOURNISSEUR, peutEnvoyer, requete, reponse } from './lib/appel.js';

const RACINE = import.meta.dirname;
const PORT = Number(process.env.PORT) || 8080;

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
                '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
                '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

const CLE = process.env[FOURNISSEUR.variable] || '';

const json = (res, code, o) => {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(o));
};

/**
 * L'unique route. Elle relaie, elle ne garde rien, et elle ne rend JAMAIS la clé.
 *
 * `peutEnvoyer` décide avant tout appel réseau — y compris le refus qui compte le plus,
 * celui d'un envoi que la page n'a pas déclaré caviardé.
 */
async function appelerLeModele(req, res) {
  let corps = {};
  try {
    const morceaux = [];
    for await (const m of req) {
      morceaux.push(m);
      // Une borne dure : un corps qui enfle sans fin remplirait la mémoire du processus.
      if (morceaux.reduce((s, x) => s + x.length, 0) > 2_000_000) {
        return json(res, 413, { dit: 'Envoi trop gros.' });
      }
    }
    corps = JSON.parse(Buffer.concat(morceaux).toString('utf8') || '{}');
  } catch {
    return json(res, 400, { dit: 'Requête illisible.' });
  }

  const verdict = peutEnvoyer({ cle: CLE, corps });
  if (!verdict.ok) return json(res, verdict.code, { dit: verdict.dit });

  try {
    const r = await fetch(FOURNISSEUR.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json',
                 authorization: `Bearer ${CLE}` },
      body: JSON.stringify(requete(corps))
    });
    if (!r.ok) {
      /*
       * On rend le CODE et rien du corps d'erreur du fournisseur : un message d'erreur
       * distant peut réémettre ce qu'on lui a envoyé, et on ne veut pas qu'un fragment de
       * copie d'élève revienne par ce chemin-là dans une console.
       */
      return json(res, 502, { dit: `Le fournisseur a refusé (code ${r.status}). `
        + (r.status === 401 ? 'La clé est invalide ou expirée.' : 'Réessaie dans un moment.') });
    }
    return json(res, 200, reponse(await r.json()));
  } catch (e) {
    return json(res, 502, { dit: 'Le fournisseur est injoignable. Vérifie la connexion.' });
  }
}

createServer(async (req, res) => {
  if (req.url === '/api/modele' && req.method === 'POST') return appelerLeModele(req, res);
  // L'état, pour que l'écran sache s'il peut proposer quoi que ce soit — SANS la clé.
  if (req.url === '/api/etat') {
    return json(res, 200, { pret: Boolean(CLE), fournisseur: FOURNISSEUR.nom });
  }

  // `normalize` puis vérification du préfixe : sans ça, `../../` sortirait du dossier.
  const brut = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const chemin = join(RACINE, normalize(brut === '/' ? '/index.html' : brut));
  if (!chemin.startsWith(RACINE)) { res.writeHead(403).end('non'); return; }
  try {
    const contenu = await readFile(chemin);
    res.writeHead(200, { 'content-type': TYPES[extname(chemin)] || 'application/octet-stream',
                         'cache-control': 'no-cache' });
    res.end(contenu);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Fichier introuvable.');
  }
}).listen(PORT, () => {
  console.log(`Ouvre http://localhost:${PORT}`);
  console.log(CLE
    ? `Clé ${FOURNISSEUR.nom} chargée depuis l'environnement.`
    : `Aucune clé ${FOURNISSEUR.nom} : mets-la dans .env sous ${FOURNISSEUR.variable}.`);
});
