// Server-side validation for the Stride Education enquiry form. The host's form function (Q21)
// imports this, then notifies the education team (Q13). Client-side checks in
// src/scripts/system/form.ts are for usability only. Never log the submitted values.
import { z } from 'astro/zod';
import { educationEnquiryLimits as max, platformOptions } from '@/config/forms';

const values = (options: { value: string }[]) => options.map((o) => o.value) as [string, ...string[]];
const text = (limit: number) => z.string().trim().min(1, 'Required').max(limit, `Keep it under ${limit} characters`);

export const educationEnquirySchema = z.object({
  name: text(max.name),
  email: z.string().trim().email('Enter a valid email address').max(max.email),
  country: text(max.country),
  platforms: z.array(z.enum(values(platformOptions))).default([]),
  // Topic ids from src/content/education/topics.yaml.
  topics: z.array(z.string().regex(/^[a-z-]{2,40}$/)).max(10).default([]),
  message: z.string().trim().max(max.message).optional().default(''),
});

export type EducationEnquiry = z.infer<typeof educationEnquirySchema>;

export type EducationEnquiryResult =
  | { ok: true; data: EducationEnquiry }
  | { ok: false; reason: 'spam' }
  | { ok: false; reason: 'invalid'; errors: Partial<Record<keyof EducationEnquiry, string>> };

/** Validates a submission. `website` is the honeypot; `started` is the page-load timestamp (ms). */
export function validateEducationEnquiry(form: FormData, now = Date.now()): EducationEnquiryResult {
  const started = Number(form.get('started'));
  if (form.get('website') || !started || now - started < max.minFillMs) return { ok: false, reason: 'spam' };

  const parsed = educationEnquirySchema.safeParse({
    name: form.get('name'),
    email: form.get('email'),
    country: form.get('country'),
    platforms: form.getAll('platforms'),
    topics: form.getAll('topics'),
    message: form.get('message') ?? '',
  });
  if (parsed.success) return { ok: true, data: parsed.data };

  const errors: Partial<Record<keyof EducationEnquiry, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof EducationEnquiry;
    errors[key] ??= issue.message;
  }
  return { ok: false, reason: 'invalid', errors };
}
