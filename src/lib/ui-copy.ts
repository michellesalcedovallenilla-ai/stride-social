// The words on the site's interactions, all in one draft file for the owner to review
// (src/content/pages/interactions.yaml). A component asks for them by key.
import { getEntry } from 'astro:content';

export async function interfaceCopy() {
  const items = (await getEntry('pages', 'interactions'))?.data.sections.ui?.items ?? [];
  const words = new Map(items.map((i) => [i.key, i.label]));
  return (key: string) => words.get(key) ?? key;
}
