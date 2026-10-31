// Checks the built site against the previous site's sitemap (docs/inventory/old-sitemap.txt):
// every old URL must resolve to a page, directly or through exactly one redirect, and the host
// redirect file (dist/_redirects) must agree with the redirect pages. Run after `npm run build`.
// Usage: node scripts/checks/redirects.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { oldSitemap } from '../redirects/map.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
const fileFor = (p) => path.join(dist, p === '/' ? 'index.html' : `${p.replace(/^\//, '')}.html`);
const read = (p) => (fs.existsSync(fileFor(p)) ? fs.readFileSync(fileFor(p), 'utf8') : null);
// Astro's fallback pages refresh after 0s for permanent and 2s for temporary (302) redirects.
const redirectTarget = (html) => html?.match(/http-equiv="refresh" content="\d+;url=([^"]+)"/)?.[1] ?? null;

const rules = new Map(
  fs
    .readFileSync(path.join(dist, '_redirects'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && !l.includes('*'))
    .map((l) => l.split(' '))
    .map(([from, to, status]) => [from, { to, status: Number.parseInt(status, 10) }]),
);

const counts = { page: 0, redirect: 0 };
const problems = [];
for (const url of oldSitemap()) {
  const html = read(url);
  if (!html) {
    problems.push(`${url}: nothing at this URL`);
    continue;
  }
  const target = redirectTarget(html);
  if (!target) {
    counts.page++;
    continue;
  }
  counts.redirect++;
  const landing = read(target);
  if (!landing) problems.push(`${url} → ${target}: target missing`);
  else if (redirectTarget(landing)) problems.push(`${url} → ${target}: redirect chain`);
  const rule = rules.get(url);
  if (!rule || rule.to !== target) problems.push(`${url}: _redirects says ${rule ? rule.to : 'nothing'}, page says ${target}`);
}

console.log(`${oldSitemap().length} old URLs: ${counts.page} unchanged pages, ${counts.redirect} redirects, ${problems.length} problems.`);
if (problems.length) {
  console.log(problems.slice(0, 40).join('\n'));
  process.exit(1);
}
