// Maps original Webflow CDN URLs to the locally saved copies in public/assets.
// Content already stores local paths; this exists for one-off references copied from the
// live site and for the migration scripts.
import manifest from '../../public/assets/manifest.json';

const map = manifest as Record<string, string>;

export function asset(url: string): string {
  if (!url.startsWith('http')) return url;
  const key = decodeURI(url.replace(/%2F/g, '/')).replace(/-p-\d+(\.\w+)$/, '$1');
  const local = map[key];
  if (!local) throw new Error(`Asset not migrated: ${url}`);
  return `/assets/${local}`;
}
