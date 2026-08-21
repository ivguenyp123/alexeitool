/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  ALLER CHERCHER LES ATTENDUS OFFICIELS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *     npm run programme
 *
 * Télécharge les documents « attendus de fin d'année » d'éduscol pour le CE2 et le CM1,
 * en extrait le texte, et écrit `registres/attendus.json` — que l'enseignant corrigera
 * ensuite à la main. Rien n'est inventé : ce qui est dans le fichier vient du document
 * officiel, et chaque attendu porte son URL de provenance et la date du relevé.
 *
 * ── POURQUOI UN TÉLÉCHARGEMENT ET PAS UN FICHIER ÉCRIT À LA MAIN ────────────
 *
 * On aurait pu les taper. Un modèle les « connaît », et ça aurait eu l'air juste. Mais
 * chaque consigne de cet outil interdit précisément ça — citer un attendu qu'on n'a pas
 * sous les yeux. Les écrire de mémoire aurait été commettre en dur, une fois pour toutes,
 * la faute qu'on interdit trente-deux fois par ailleurs.
 *
 * ── CE QUE ÉDUSCOL PUBLIE, ET CE QU'IL NE PUBLIE PAS ────────────────────────
 *
 * Les « attendus de fin d'année » n'existent qu'en FRANÇAIS et en MATHÉMATIQUES. Pour
 * « Questionner le monde », les sciences, l'histoire-géographie, les arts et l'EPS, il n'y
 * a que les programmes de CYCLE — pas d'attendus par niveau.
 *
 * Ces domaines resteront donc vides, et l'outil le dira. Un domaine sans attendus n'est
 * pas un domaine sans exigences : c'est un domaine dont on n'a pas le texte.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { lireAttendus } from '../lib/attendus.js';

const RACINE = new URL('..', import.meta.url).pathname;

/**
 * Les quatre documents. Les identifiants sont ceux d'éduscol au 21 août 2026.
 *
 * Ils sont écrits ici plutôt que devinés : les identifiants voisins ne se déduisent pas
 * (13954 est le français CE2, 13960 les maths CE2, mais 13996 est autre chose). Une URL
 * fabriquée par incrémentation téléchargerait le mauvais niveau sans que rien ne le dise.
 */
const DOCUMENTS = [
  { cycle: 2, niveau: 'CE2', domaine: 'francais',
    url: 'https://eduscol.education.fr/document/13954/download' },
  { cycle: 2, niveau: 'CE2', domaine: 'mathematiques',
    url: 'https://eduscol.education.fr/document/13960/download' },
  { cycle: 3, niveau: 'CM1', domaine: 'francais',
    url: 'https://eduscol.education.fr/document/13984/download' },
  { cycle: 3, niveau: 'CM1', domaine: 'mathematiques',
    url: 'https://eduscol.education.fr/document/13990/download' }
];

function extraireLeTexte(pdf) {
  try {
    return execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8', maxBuffer: 8e6 });
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('\n✗ `pdftotext` n\'est pas installé. Une ligne suffit :\n');
      console.error('    sudo apt-get update && sudo apt-get install -y poppler-utils\n');
      console.error('  (c\'est le seul outil externe de tout le projet, et il ne sert qu\'ici)');
      process.exit(1);
    }
    throw e;
  }
}

const releve = new Date().toISOString().slice(0, 10);
const tout = [];
let ecarteesTotal = 0;

for (const d of DOCUMENTS) {
  process.stdout.write(`${d.niveau} ${d.domaine} … `);
  let pdf;
  try {
    const r = await fetch(d.url);
    if (!r.ok) { console.log(`✗ éduscol a répondu ${r.status}`); continue; }
    pdf = join(tmpdir(), `attendus-${d.niveau}-${d.domaine}.pdf`);
    writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    console.log(`✗ téléchargement impossible : ${e.message}`);
    continue;
  }

  const texte = extraireLeTexte(pdf);
  const { attendus, ecartees } = lireAttendus(texte, {
    cycle: d.cycle, domaine: d.domaine,
    source: `éduscol, attendus de fin d'année ${d.niveau} — relevé le ${releve} · ${d.url}`
  });
  tout.push(...attendus);
  ecarteesTotal += ecartees.length;
  console.log(`${attendus.length} attendus retenus, ${ecartees.length} lignes écartées`);
}

if (!tout.length) {
  console.error('\n✗ Rien n\'a été récupéré. Rien n\'est écrit — mieux vaut pas de fichier');
  console.error('  qu\'un fichier vide qu\'on croirait à jour.');
  process.exit(1);
}

mkdirSync(join(RACINE, 'registres'), { recursive: true });
writeFileSync(join(RACINE, 'registres/attendus.json'),
              JSON.stringify({ releve, attendus: tout }, null, 1) + '\n');

console.log(`\n✓ ${tout.length} attendus dans registres/attendus.json`);
console.log(`  ${ecarteesTotal} lignes écartées — titres, numéros de page, fragments.`);
console.log('\nCE QU\'IL RESTE À FAIRE, ET SEUL UN ENSEIGNANT PEUT LE FAIRE :');
console.log('  · relire le fichier et retirer ce qui n\'est pas un attendu ;');
console.log('  · les autres domaines sont VIDES — éduscol ne publie d\'attendus par niveau');
console.log('    qu\'en français et en mathématiques. Pour « Questionner le monde », les');
console.log('    sciences, l\'histoire-géo, les arts et l\'EPS, il n\'existe que les');
console.log('    programmes de cycle. L\'outil le dira au lieu de faire semblant.');
