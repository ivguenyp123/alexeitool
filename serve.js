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
import { readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createMoteur } from './runtime/moteur.js';
import { AppelError } from './runtime/erreur.js';
import { peutEnvoyer } from './lib/garde.js';

const RACINE = import.meta.dirname;
const PORT = Number(process.env.PORT) || 8080;

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
                '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
                '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

const CLE = process.env.DEEPSEEK_API_KEY || '';
const MODELS = lireModeles();

function lireModeles() {
  // Un analyseur minimal : ce fichier n'a que des listes de paires. Tirer une dépendance
  // YAML pour ça serait payer cher un format qu'on écrit soi-même.
  try {
    const brut = readFileSync(join(RACINE, 'registries/models.yaml'), 'utf8');
    const out = [];
    for (const ligne of brut.split('\n')) {
      const debut = /^\s*-\s*tier:\s*(\S+)/.exec(ligne);
      if (debut) { out.push({ tier: debut[1] }); continue; }
      const paire = /^\s+(\w+):\s*(.+?)\s*$/.exec(ligne);
      if (paire && out.length) out[out.length - 1][paire[1]] = paire[2];
    }
    return out;
  } catch { return []; }
}

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
    const moteur = createMoteur({ models: MODELS });
    const r = await moteur.generer({
      prompt: corps.texte,
      tier: corps.palier || 'mid',
      // Bas : on demande des reformulations et des classements, pas de l'invention. Un
      // modèle bavard produit ici des séances plausibles et fausses.
      temperature: 0.3
    });
    /*
     * Le fournisseur et le modèle remontent avec le texte. Ce n'est pas décoratif : ce
     * qui est produit ici finit dans un bilan d'enfant, et « quel modèle a répondu » est
     * la première question qu'on posera le jour où quelque chose cloche.
     */
    return json(res, 200, { ok: true, texte: r.texte, modele: r.modele,
                            fournisseur: r.fournisseur, jetons: r.jetons });
  } catch (e) {
    // Le client porté nomme déjà les refus un par un — clé invalide, solde épuisé, proxy
    // sortant. On relaie SON message, on ne le réécrit pas moins bien.
    if (e instanceof AppelError) return json(res, 502, { dit: e.message });
    return json(res, 502, { dit: 'Le fournisseur est injoignable. Vérifie la connexion.' });
  }
}

createServer(async (req, res) => {
  if (req.url === '/api/modele' && req.method === 'POST') return appelerLeModele(req, res);
  // L'état, pour que l'écran sache s'il peut proposer quoi que ce soit — SANS la clé.
  if (req.url === '/api/etat') {
    return json(res, 200, { pret: Boolean(CLE), fournisseur: 'deepseek' });
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
    ? 'Clé DeepSeek chargée depuis l\'environnement.'
    : 'Aucune clé DeepSeek : mets-la dans .env sous DEEPSEEK_API_KEY.');
});
