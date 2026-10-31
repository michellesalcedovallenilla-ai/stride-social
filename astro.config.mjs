// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URLs match the live Webflow site: no trailing slash, pages emitted as `/about.html` etc.
export default defineConfig({
  site: 'https://www.stride-social.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
