// Responsive images at build time (docs/phase-2/07-technical-architecture.md §4).
// After `astro build`, every <img> pointing at a raster file in public/assets gets a WebP srcset
// (480/800/1200/1800px, never wider than the original, plus the original width). The resized
// files are written into dist/_img/<width>/... only, so the repository keeps one original per
// image, and they are cached in node_modules/.cache so repeat builds are fast. Components can set
// `sizes` on an <img> to tell the browser how wide it renders; without it, 100vw is assumed.
// Development serves the originals untouched.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WIDTHS = [480, 800, 1200, 1800];
const RASTER = /^\/assets\/[^"?#]+\.(?:jpe?g|png|webp|avif)$/i;

/** @returns {import('astro').AstroIntegration} */
export default function responsiveImages() {
  return {
    name: 'stride-responsive-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const root = process.cwd();
        const cacheDir = path.join(root, 'node_modules/.cache/stride-img');
        fs.mkdirSync(cacheDir, { recursive: true });
        /** @type {Map<string, number | null>} */
        const widthOf = new Map();
        /** @type {Map<string, Set<number>>} */
        const wanted = new Map();

        /** @param {string} src */
        const originalWidth = async (src) => {
          if (widthOf.has(src)) return widthOf.get(src) ?? null;
          const file = path.join(root, 'public', decodeURI(src));
          let width = null;
          try {
            width = fs.existsSync(file) ? ((await sharp(file).metadata()).width ?? null) : null;
          } catch {
            width = null;
          }
          widthOf.set(src, width);
          return width;
        };
        /** @param {string} src @param {number} w */
        const variantUrl = (src, w) => `/_img/${w}${src.replace(/\.[a-z]+$/i, '.webp')}`;

        // 1. Rewrite <img> tags in every page.
        /** @param {string} folder @returns {string[]} */
        const pages = (folder) =>
          fs.readdirSync(folder, { withFileTypes: true }).flatMap((e) => {
            const full = path.join(folder, e.name);
            return e.isDirectory() ? (e.name === '_img' ? [] : pages(full)) : e.name.endsWith('.html') ? [full] : [];
          });
        let tags = 0;
        for (const file of pages(out)) {
          const html = fs.readFileSync(file, 'utf8');
          const matches = [...html.matchAll(/<img\b[^>]*>/g)];
          if (!matches.length) continue;
          /** @type {Map<string, string>} */
          const replacements = new Map();
          for (const [tag] of matches) {
            if (/\ssrcset=/.test(tag) || replacements.has(tag)) continue;
            const src = tag.match(/\ssrc="([^"]+)"/)?.[1];
            if (!src || !RASTER.test(src)) continue;
            const width = await originalWidth(src);
            if (!width || width <= 480) continue;
            const widths = [...WIDTHS.filter((w) => w < width), width];
            const set = wanted.get(src) ?? new Set();
            widths.forEach((w) => set.add(w));
            wanted.set(src, set);
            const srcset = widths.map((w) => `${variantUrl(src, w)} ${w}w`).join(', ');
            const sizes = /\ssizes=/.test(tag) ? '' : ' sizes="100vw"';
            replacements.set(tag, tag.replace(/<img\b/, `<img srcset="${srcset}"${sizes}`));
          }
          if (!replacements.size) continue;
          let next = html;
          for (const [from, to] of replacements) next = next.split(from).join(to);
          fs.writeFileSync(file, next);
          tags += replacements.size;
        }

        // 2. Generate the variants (from cache when the original hasn't changed).
        let made = 0;
        let cached = 0;
        for (const [src, widths] of wanted) {
          const original = path.join(root, 'public', decodeURI(src));
          const stamp = fs.statSync(original).mtimeMs;
          for (const w of widths) {
            const target = path.join(out, variantUrl(src, w));
            const key = crypto.createHash('sha1').update(`${src}|${stamp}|${w}|q72`).digest('hex');
            const cacheFile = path.join(cacheDir, `${key}.webp`);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            if (fs.existsSync(cacheFile)) {
              cached++;
            } else {
              await sharp(original).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(cacheFile);
              made++;
            }
            fs.copyFileSync(cacheFile, target);
          }
        }
        logger.info(`srcset added to ${tags} image tags; ${made} variants generated, ${cached} from cache`);
      },
    },
  };
}
