// Finds unfinished placeholders in the built site: elements marked data-placeholder
// (rendered by the PlaceholderNotice component) and literal "PLACEHOLDER" markers.
// Default: report only. With --strict (production builds): exit 1 if any are found.
// Usage: node scripts/checks/placeholders.mjs [--strict]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
const strict = process.argv.includes('--strict');
if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const hits = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8');
      const count = (html.match(/data-placeholder|PLACEHOLDER/g) || []).length;
      if (count) hits.push(`${path.relative(dist, p)} (${count})`);
    }
  }
})(dist);

console.log(`${hits.length} page(s) with placeholders${hits.length ? ':' : '.'}`);
hits.forEach((h) => console.log(`  ${h}`));
process.exit(strict && hits.length ? 1 : 0);
