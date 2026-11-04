// Insights helpers: categories from the brief (PDF §7), visible articles newest first, and asides
// that are real images (the old CMS left a Webflow placeholder graphic in some).
import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'insights'>;

export const categoryLabels = {
  'company-news': 'Company news',
  'creator-economy': 'Creator economy',
  'marketing-insights': 'Marketing insights',
  education: 'Education',
} as const;

export async function getArticles() {
  return (await getCollection('insights', (p) => p.data.visible)).sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0) || a.data.order - b.data.order,
  );
}

export const realAside = (a: Article) => (a.data.aside && !a.data.aside.src.includes('website-files.com/plugins/Basic/assets/placeholder') ? a.data.aside : null);

/** Minutes to read, from the article's own length (about 220 words a minute). */
export const readingMinutes = (a: Article) => {
  const words = (a.body ?? '').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

export const formatDate = (d: Date | null) => (d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

/**
 * Migrated article bodies use whatever heading levels the old editor produced (often h4 right
 * under the page's h1, or h2 straight to h4). Renumber them in reading order so the article
 * starts at h2 and each heading is at most one level deeper than the one before.
 */
export function normaliseHeadings(html: string) {
  const levels = [...new Set([...html.matchAll(/<h([2-6])\b/gi)].map((m) => Number(m[1])))].sort();
  const rank = new Map(levels.map((level, i) => [level, i + 2]));
  let previous = 1;
  let open = 2;
  return html.replace(/<(\/?)h([2-6])\b/gi, (_, slash: string, level: string) => {
    if (slash) return `</h${open}`;
    open = Math.min(rank.get(Number(level)) ?? 2, previous + 1, 6);
    previous = open;
    return `<h${open}`;
  });
}
