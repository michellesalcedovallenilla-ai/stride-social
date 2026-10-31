// Blog helpers shared by the index, the post template and the "more..." list.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { BlogCard } from './BlogCardGrid.astro';

export type Post = CollectionEntry<'blog'>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Posts in the CMS list order. */
export async function getPosts(): Promise<Post[]> {
  return (await getCollection('blog')).sort((a, b) => a.data.order - b.data.order);
}

/** "Apr 2026": the month label used by the small cards. */
export function shortDate(post: Post): string | null {
  if (post.data.listDate) return post.data.listDate;
  const m = post.data.date?.match(/^(\d{4})-(\d{2})/);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : null;
}

/** Card props; `date` picks the long ("April 16, 2026") or short ("Apr 2026") label, or none. */
export function toCard(post: Post, date: 'long' | 'short' | null = null): BlogCard {
  return {
    href: `/blog/${post.id}`,
    image: post.data.cardImage,
    name: post.data.cardTitle ?? post.data.title,
    tag: post.data.category,
    date: date === 'long' ? post.data.dateLabel : date === 'short' ? shortDate(post) : null,
  };
}
