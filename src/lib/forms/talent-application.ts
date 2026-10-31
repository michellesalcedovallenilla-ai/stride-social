// Server-side validation for the Stride Talent application form. The host's form function
// (Q21) imports this, then notifies the talent team (Q13). Client-side checks in
// src/scripts/system/form.ts are for usability only. Never log the submitted values.
import { z } from 'astro/zod';
import { platformOptions, talentApplicationLimits as max } from '@/config/forms';

const values = (options: { value: string }[]) => options.map((o) => o.value) as [string, ...string[]];
const text = (limit: number) => z.string().trim().min(1, 'Required').max(limit, `Keep it under ${limit} characters`);
const link = z
  .string()
  .trim()
  .max(max.link)
  .url('Enter a full link, starting with https://')
  .refine((u) => /^https?:\/\//.test(u), 'Enter a full link, starting with https://');

export const talentApplicationSchema = z.object({
  name: text(max.name),
  email: z.string().trim().email('Enter a valid email address').max(max.email),
  country: text(max.country),
  platforms: z.array(z.enum(values(platformOptions))).min(1, 'Choose at least one platform'),
  links: z.array(link).min(1, 'Add at least one link').max(max.links),
  // A category id from src/content/taxonomies/categories.yaml.
  category: z.string().regex(/^[a-z-]{2,40}$/, 'Choose a category'),
  intro: text(max.intro),
});

export type TalentApplication = z.infer<typeof talentApplicationSchema>;

export type TalentApplicationResult =
  | { ok: true; data: TalentApplication }
  | { ok: false; reason: 'spam' }
  | { ok: false; reason: 'invalid'; errors: Partial<Record<keyof TalentApplication, string>> };

/** Validates a submission. `website` is the honeypot; `started` is the page-load timestamp (ms). */
export function validateTalentApplication(form: FormData, now = Date.now()): TalentApplicationResult {
  const started = Number(form.get('started'));
  if (form.get('website') || !started || now - started < max.minFillMs) return { ok: false, reason: 'spam' };

  const parsed = talentApplicationSchema.safeParse({
    name: form.get('name'),
    email: form.get('email'),
    country: form.get('country'),
    platforms: form.getAll('platforms'),
    // Empty optional link rows are dropped before validation.
    links: form.getAll('links').map(String).filter((l) => l.trim() !== ''),
    category: form.get('category'),
    intro: form.get('intro'),
  });
  if (parsed.success) return { ok: true, data: parsed.data };

  const errors: Partial<Record<keyof TalentApplication, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof TalentApplication;
    errors[key] ??= issue.message;
  }
  return { ok: false, reason: 'invalid', errors };
}
