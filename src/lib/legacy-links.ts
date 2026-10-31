// Migrated copy (articles) still links to the previous site's URLs. Rewrite them to the new
// addresses at build time so readers skip the redirect. Uses the same section and collection
// moves as the redirect map (scripts/redirects/map.mjs). Creator links keep their old path: the
// redirect decides whether a profile is published.
import { collectionRedirects, sectionRedirects } from '../../scripts/redirects/map.mjs';

const prefixes = Object.entries(collectionRedirects as Record<string, string[]>).filter(([from]) => from !== '/creators/');
const sections = sectionRedirects as Record<string, string>;

export function rewriteLegacyLinks(html: string) {
  return html.replace(/href="(\/[^"#?]*)([^"]*)"/g, (match, href: string, rest: string) => {
    const p = href.replace(/\/$/, '') || '/';
    if (sections[p]) return `href="${sections[p]}${rest}"`;
    for (const [from, [to]] of prefixes) if (p.startsWith(from)) return `href="${to}${p.slice(from.length)}${rest}"`;
    return match;
  });
}
