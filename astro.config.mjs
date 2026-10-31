// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import { buildRedirects, redirectsFile } from './scripts/redirects/map.mjs';
import responsiveImages from './integrations/responsive-images.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const production = (process.env.PUBLIC_SITE_ENV ?? env.PUBLIC_SITE_ENV) === 'production';
const redirects = buildRedirects({ production });

/**
 * After the build: write the host redirect file (Netlify / Cloudflare Pages `_redirects`; the
 * same map works for Vercel once Q21 picks a host) and drop noindex pages and redirect stubs
 * from the sitemap, so search engines only see pages meant to be indexed.
 * @returns {import('astro').AstroIntegration}
 */
const launchFiles = () => ({
  name: 'stride-launch-files',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const out = fileURLToPath(dir);
      fs.writeFileSync(path.join(out, '_redirects'), redirectsFile({ production }));
      const excluded = new Set();
      /** @param {string} folder */
      const walk = (folder) => {
        for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
          const full = path.join(folder, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.name.endsWith('.html')) {
            const html = fs.readFileSync(full, 'utf8');
            if (/<meta name="robots" content="[^"]*noindex/.test(html) || /http-equiv="refresh"/.test(html)) {
              const rel = path.relative(out, full).split(path.sep).join('/').replace(/(index)?\.html$/, '').replace(/\/$/, '');
              excluded.add(`/${rel}`.replace(/^\/$/, '/'));
            }
          }
        }
      };
      walk(out);
      let removed = 0;
      for (const file of fs.readdirSync(out).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
        const xml = fs.readFileSync(path.join(out, file), 'utf8');
        const kept = xml.replace(/<url><loc>([^<]+)<\/loc>.*?<\/url>/g, (block, loc) => {
          const p = new URL(loc).pathname.replace(/\/$/, '') || '/';
          if (excluded.has(p)) {
            removed++;
            return '';
          }
          return block;
        });
        fs.writeFileSync(path.join(out, file), kept);
      }
      logger.info(`_redirects written (${redirects.length} rules); ${removed} noindex/redirect URLs left out of the sitemap`);
    },
  },
});

// URLs match the live Webflow site: no trailing slash, pages emitted as `/about.html` etc.
export default defineConfig({
  site: 'https://www.stride-social.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  // Fallback redirect pages for any static host; hosts that read _redirects send real 301/302s.
  redirects: Object.fromEntries(redirects.map((r) => [r.from, { status: r.status, destination: r.to }])),
  integrations: [sitemap({ filter: (page) => !/\/(styleguide|404)$/.test(new URL(page).pathname) }), launchFiles(), responsiveImages()],
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
