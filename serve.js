/*
 * Un serveur de fichiers, et rien d'autre.
 *
 * Il existe parce qu'un navigateur refuse de charger des modules depuis `file://`. Il ne
 * stocke rien, ne reçoit rien, et n'a aucune route : tout ce que l'outil garde vit dans le
 * navigateur, sur la machine de la classe.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const RACINE = import.meta.dirname;
const PORT = Number(process.env.PORT) || 8080;

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
                '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
                '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

createServer(async (req, res) => {
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
}).listen(PORT, () => console.log(`Ouvre http://localhost:${PORT}`));
