// robots.txt: the live build invites crawling and points at the sitemap; every other build
// (local, preview deploys) asks crawlers to stay away, alongside the noindex meta on each page.
import type { APIRoute } from 'astro';
import { isProduction } from '@/lib/env';

export const GET: APIRoute = ({ site }) =>
  new Response(
    isProduction
      ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
