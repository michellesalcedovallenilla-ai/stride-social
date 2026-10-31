// Downloads every original public image/video listed in docs/inventory/assets.json
// into public/assets/, and writes public/assets/manifest.json (original URL -> local path).
// Webflow's responsive variants (-p-500, -p-800, …) and fonts are skipped: originals are
// served locally and fonts come from @fontsource.
//
// Usage: node scripts/migrate/download-assets.mjs [--concurrency=4]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const assets = JSON.parse(fs.readFileSync(path.join(root, 'docs/inventory/assets.json'), 'utf8'));
const outDir = path.join(root, 'public/assets');
const manifestPath = path.join(outDir, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const concurrency = Number(process.argv.find((a) => a.startsWith('--concurrency='))?.split('=')[1] || 4);

const SITE_ASSETS = '65e74a029f5d3f85822896b9';

function localPath(url) {
  const u = new URL(url);
  const [, siteId, ...rest] = u.pathname.split('/');
  let file = decodeURIComponent(rest.join('/'));
  // Webflow prefixes files with a 24-char hex id; keep it short but unique.
  file = file.replace(/^([0-9a-f]{24})_/, (_, id) => id.slice(-8) + '-');
  file = file.replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-').toLowerCase();
  const ext = path.extname(file).toLowerCase();
  const kind = ['.mp4', '.webm'].includes(ext) ? 'video' : siteId === SITE_ASSETS ? 'site' : 'cms';
  return `${kind}/${file}`;
}

const todo = assets.filter((a) => {
  if (!/cdn\.prod\.website-files\.com\/65e74a029f5d3f858228/.test(a.url)) return false;
  if (/-p-\d+\.\w+$/.test(a.url)) return false;
  if (a.type === 'font') return false;
  return true;
});

let done = 0, failed = 0, bytes = 0;
async function fetchOne(a) {
  const rel = localPath(a.url);
  const dest = path.join(outDir, rel);
  if (manifest[a.url] === rel && fs.existsSync(dest)) { done++; return; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(encodeURI(a.url).replace(/%25/g, '%'), { headers: { 'User-Agent': 'Mozilla/5.0 (site-migration)' } });
  if (!res.ok) { failed++; console.warn('FAIL', res.status, a.url); return; }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  bytes += buf.length;
  manifest[a.url] = rel;
  done++;
  if (done % 50 === 0) console.log(`${done}/${todo.length}`);
}

const queue = [...todo];
await Promise.all(Array.from({ length: concurrency }, async () => {
  while (queue.length) {
    const a = queue.shift();
    try { await fetchOne(a); } catch (e) { failed++; console.warn('ERR', a.url, e.message); }
    await new Promise((r) => setTimeout(r, 100));
  }
}));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`done ${done}, failed ${failed}, downloaded ${(bytes / 1e6).toFixed(1)} MB`);
