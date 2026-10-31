// Which creators may appear on the site (CLAUDE.md: roster profiles only with recorded consent).
// Preview builds show confirmed and legacy-consent profiles (legacy = public on the previous
// site, to be re-confirmed); production shows confirmed consent only. Every roster listing,
// profile page and link goes through here, so a creator can never be linked but not built.
import { getCollection, type CollectionEntry } from 'astro:content';
import { isProduction } from './env';

export type Creator = CollectionEntry<'roster'>;

export const isPublished = (c: Creator) =>
  c.data.visible !== false && (c.data.consent.status === 'confirmed' || (!isProduction && c.data.consent.status === 'legacy'));

/** Published creators in roster order. */
export async function getRoster() {
  return (await getCollection('roster', isPublished)).sort((a, b) => a.data.order - b.data.order);
}

/** Two-letter platform labels for cards; full names for profile links. */
export const platformNames = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitch: 'Twitch',
  podcast: 'Podcast',
  x: 'X',
  website: 'Website',
} as const;
export const platformShort = { tiktok: 'TT', instagram: 'IG', youtube: 'YT', twitch: 'TW', podcast: 'POD', x: 'X', website: 'WEB' } as const;
export type Platform = keyof typeof platformNames;

/** Platform links in a fixed order, skipping empty ones. */
export const platformsOf = (c: Creator) =>
  (Object.keys(platformNames) as Platform[]).filter((p) => c.data.platforms[p]).map((p) => ({ key: p, href: c.data.platforms[p] as string }));

/** Old-site bios carry empty spacer paragraphs and editor comments; drop them. */
export const cleanBio = (html: string | undefined) =>
  (html ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<p>(\s|&nbsp;|‍|<br\s*\/?>)*<\/p>/g, '')
    .trim();
