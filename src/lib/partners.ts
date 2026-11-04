// The brand partners' logos, in the order asked for, under the brand approval rule: confirmed ones
// always, the previous site's (legacy) in preview only. Anything else asked for is reported as awaiting
// a logo, never drawn.
import { getCollection } from 'astro:content';
import { isPreview } from '@/lib/env';

export async function getPartners(ids: string[]) {
  const byId = new Map((await getCollection('brands')).map((b) => [b.id, b]));
  const shown = ids.flatMap((id) => {
    const b = byId.get(id);
    if (!b?.data.logo) return [];
    const { status } = b.data.approval;
    return status === 'confirmed' || (isPreview && status === 'legacy') ? [{ id, name: b.data.name, logo: b.data.logo, status }] : [];
  });
  return {
    shown,
    awaiting: ids.filter((id) => !shown.some((b) => b.id === id)).map((id) => byId.get(id)?.data.name ?? id),
    interim: shown.some((b) => b.status !== 'confirmed'),
  };
}
