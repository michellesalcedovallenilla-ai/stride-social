// Checks every internal href/src/srcset/poster in the built site (dist/) resolves to a file.
// Known issues inherited from the live site are listed in known-broken-links.json with a reason.
// Usage: node scripts/checks/links.mjs   (run after `npm run build`)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}
const known = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'scripts/checks/known-broken-links.json'), 'utf8'))));

const pages = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) pages.push(p);
  }
})(dist);

const resolves = (url) => {
  const clean = decodeURI(url.split('#')[0].split('?')[0]);
  if (clean === '/' || clean === '') return fs.existsSync(path.join(dist, 'index.html'));
  const p = path.join(dist, clean);
  return fs.existsSync(p) || fs.existsSync(p + '.html') || fs.existsSync(path.join(p, 'index.html'));
};

const broken = new Map();
let checked = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const urls = [...html.matchAll(/(?:href|src|poster)="(\/[^"]*)"/g)].map((m) => m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) urls.push(part.trim().split(' ')[0]);
  }
  for (const url of urls) {
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    checked++;
    if (resolves(url) || known.has(url)) continue;
    if (!broken.has(url)) broken.set(url, new Set());
    broken.get(url).add(path.relative(dist, page));
  }
}

console.log(`${pages.length} pages, ${checked} internal references checked, ${broken.size} broken.`);
for (const [url, from] of broken) console.log(`  ${url}  <-  ${[...from].slice(0, 3).join(', ')}${from.size > 3 ? ` (+${from.size - 3})` : ''}`);
process.exit(broken.size ? 1 : 0);
