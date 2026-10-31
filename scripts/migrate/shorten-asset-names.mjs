// Shortens long migrated asset filenames (Windows MAX_PATH issue on deep clones) and rewrites
// every reference under src/ plus public/assets/manifest.json. Keeps the 8-character Webflow id
// prefix so names stay unique and traceable. Safe to re-run (only touches names > MAX chars).
// Usage: node scripts/migrate/shorten-asset-names.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX = 60;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const assets = path.join(root, 'public/assets');
const dry = process.argv.includes('--dry');

const renames = new Map(); // "/assets/dir/old" -> "/assets/dir/new"
for (const dir of fs.readdirSync(assets)) {
  const full = path.join(assets, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  const taken = new Set(fs.readdirSync(full));
  for (const name of fs.readdirSync(full)) {
    if (name.length <= MAX) continue;
    const ext = path.extname(name);
    const [, prefix, rest] = name.match(/^([0-9a-f]{8})-(.*)$/) ?? [null, '', name];
    let slug = rest.slice(0, rest.length - ext.length).replace(/[^a-z0-9]+/g, '-');
    slug = slug.slice(0, MAX - ext.length - (prefix ? prefix.length + 1 : 0) - 4).replace(/-+$/, '');
    let next = `${prefix ? prefix + '-' : ''}${slug}${ext}`;
    for (let n = 2; taken.has(next); n++) next = `${prefix ? prefix + '-' : ''}${slug}-${n}${ext}`;
    taken.add(next);
    renames.set(`/assets/${dir}/${name}`, `/assets/${dir}/${next}`);
  }
}

const files = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(md|mdx|json|astro|ts|mjs|css|yaml|yml)$/.test(name)) files.push(p);
  }
})(path.join(root, 'src'));
files.push(path.join(assets, 'manifest.json'));

let edited = 0;
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  for (const [from, to] of renames) {
    s = s.split(from).join(to);
    // manifest values are stored without the leading /assets/
    if (f.endsWith('manifest.json')) s = s.split(`"${from.slice(8)}"`).join(`"${to.slice(8)}"`);
  }
  if (s !== before) {
    edited++;
    if (!dry) fs.writeFileSync(f, s);
  }
}
if (!dry) for (const [from, to] of renames) fs.renameSync(path.join(root, 'public', from), path.join(root, 'public', to));
console.log(`${dry ? '[dry] ' : ''}${renames.size} files renamed, ${edited} files with updated references`);
