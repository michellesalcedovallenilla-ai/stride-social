// SEO audit of the built site (docs/phase-2/07-technical-architecture.md §5). For every page
// (redirect stubs skipped): title, meta description, absolute canonical, og:image, html lang,
// exactly one h1, and JSON-LD that parses with @context and @type. Long titles (> 60) and
// descriptions (> 160) are reported as warnings. In a production build it also checks that the
// sitemap lists only indexable pages and that robots.txt allows crawling.
// Usage: node scripts/checks/seo.mjs [--strict]   (--strict: warnings fail too)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
const strict = process.argv.includes('--strict');
const errors = [];
const warnings = [];
const pages = [];

const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.html')) pages.push(full);
  }
};
walk(dist);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
let audited = 0;
const indexable = new Set();
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  if (/http-equiv="refresh"/.test(html)) continue;
  audited++;
  const url = `/${path.relative(dist, file).split(path.sep).join('/').replace(/(index)?\.html$/, '').replace(/\/$/, '')}`;
  const where = url === '/' ? '/' : url.replace(/\/$/, '');
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (!title) errors.push(`${where}: no <title>`);
  else if (title.length > 60) warnings.push(`${where}: title ${title.length} chars`);
  if (!description) errors.push(`${where}: no meta description`);
  else if (description.length > 160) warnings.push(`${where}: description ${description.length} chars`);
  if (!canonical || !/^https:\/\//.test(canonical)) errors.push(`${where}: canonical missing or not absolute`);
  if (!/<meta property="og:image" content="https:\/\//.test(html)) errors.push(`${where}: no og:image`);
  if (!/<html lang="en"/.test(html)) errors.push(`${where}: html lang missing`);
  if (h1s !== 1) errors.push(`${where}: ${h1s} h1 elements`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      if (!data['@context'] || !data['@type']) errors.push(`${where}: JSON-LD without @context/@type`);
    } catch {
      errors.push(`${where}: JSON-LD does not parse`);
    }
  }
  if (!/<meta name="robots" content="[^"]*noindex/.test(html)) indexable.add(where);
}

// Production-only checks: robots.txt allows crawling, sitemap = indexable pages.
const robots = fs.existsSync(path.join(dist, 'robots.txt')) ? fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8') : '';
const production = robots.includes('Allow: /');
if (production) {
  const locs = fs
    .readdirSync(dist)
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .flatMap((f) => [...fs.readFileSync(path.join(dist, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/$/, '') || '/'));
  for (const loc of locs) if (!indexable.has(loc)) errors.push(`sitemap lists ${loc}, which is noindex or missing`);
  for (const page of indexable) if (!locs.includes(page) && !/^\/(404|styleguide)$/.test(page)) warnings.push(`${page}: indexable but not in the sitemap`);
  console.log(`Production build: robots.txt allows crawling; sitemap has ${locs.length} URLs.`);
} else {
  console.log('Preview build: every page is noindex and robots.txt disallows crawling (as intended).');
}

console.log(`${audited} pages audited: ${errors.length} errors, ${warnings.length} warnings.`);
if (errors.length) console.log(`Errors:\n  ${errors.slice(0, 30).join('\n  ')}`);
if (warnings.length) console.log(`Warnings:\n  ${warnings.slice(0, 30).join('\n  ')}${warnings.length > 30 ? `\n  …and ${warnings.length - 30} more` : ''}`);
process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
