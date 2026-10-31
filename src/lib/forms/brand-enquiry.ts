// Server-side validation for the Stride Social brand enquiry form. The host's form function
// (Q21: Vercel, Netlify or Cloudflare) imports this, then sends the email/CRM notification
// (Q13). Client-side checks in src/scripts/system/form.ts are for usability only; this
// is the source of truth. Never log the submitted values (docs/phase-2/07 §6, privacy).
import { z } from 'astro/zod';
import { brandEnquiryLimits as max, marketOptions, serviceOptions } from '@/config/forms';

const values = (options: { value: string }[]) => options.map((o) => o.value) as [string, ...string[]];
const text = (limit: number) => z.string().trim().min(1, 'Required').max(limit, `Keep it under ${limit} characters`);

export const brandEnquirySchema = z.object({
  name: text(max.name),
  company: text(max.company),
  email: z.string().trim().email('Enter a valid email address').max(max.email),
  market: z.enum(values(marketOptions), { message: 'Choose a market' }),
  service: z.enum(values(serviceOptions), { message: 'Choose a service' }),
  budget: z.string().trim().max(max.budget).optional().default(''),
  brief: text(max.brief),
  /** Set when the enquiry starts from a creator profile (/social/enquire?creator=slug). */
  creator: z.string().trim().max(120).optional().default(''),
});

export type BrandEnquiry = z.infer<typeof brandEnquirySchema>;

export type BrandEnquiryResult =
  | { ok: true; data: BrandEnquiry }
  | { ok: false; reason: 'spam' }
  | { ok: false; reason: 'invalid'; errors: Partial<Record<keyof BrandEnquiry, string>> };

/** Validates a submission. `website` is the honeypot; `started` is the page-load timestamp (ms). */
export function validateBrandEnquiry(form: FormData, now = Date.now()): BrandEnquiryResult {
  const started = Number(form.get('started'));
  if (form.get('website') || !started || now - started < max.minFillMs) return { ok: false, reason: 'spam' };

  const parsed = brandEnquirySchema.safeParse(Object.fromEntries(form));
  if (parsed.success) return { ok: true, data: parsed.data };

  const errors: Partial<Record<keyof BrandEnquiry, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof BrandEnquiry;
    errors[key] ??= issue.message;
  }
  return { ok: false, reason: 'invalid', errors };
}
