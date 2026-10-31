// Stride Education availability (brief §6: "Clearly distinguish currently available benefits from
// future planned features"). Items show only with a confirmed status: available or planned.
// Unconfirmed items appear in preview builds with an "availability to confirm" label, never in
// production, so the site never guesses what Stride offers today (Q11).
import { getCollection, type CollectionEntry } from 'astro:content';
import { isPreview } from './env';

type Item = CollectionEntry<'educationTopics'> | CollectionEntry<'educationExperience'>;

export const isShown = (item: Item) => item.data.status !== 'unconfirmed' || isPreview;

export async function getTopics() {
  return (await getCollection('educationTopics', isShown)).sort((a, b) => a.data.order - b.data.order);
}

export async function getExperience() {
  return (await getCollection('educationExperience', isShown)).sort((a, b) => a.data.order - b.data.order);
}
