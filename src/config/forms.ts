// Form definitions shared by the page markup (src/components/social/EnquiryForm.astro) and the
// server-side validation (src/lib/forms/brand-enquiry.ts), so both enforce the same rules
// (docs/phase-2/07-technical-architecture.md §6).
import { services } from './navigation';

/** Public inbox used as the fallback when a form can't be sent (from the current contact page). */
export const enquiryEmail = 'team@stride-social.com';

/** Where the brand enquiry form posts. Empty until Stride confirms the destination (Q13). */
export const brandEnquiryAction = import.meta.env.PUBLIC_BRAND_ENQUIRY_ACTION ?? '';

// Talent markets from the brief; "Other" covers everything else until Q13 confirms the list.
export const marketOptions = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'other', label: 'Other' },
];

export const serviceOptions = [
  ...services.map((s) => ({ value: s.href.split('/').pop() as string, label: s.label })),
  { value: 'not-sure', label: 'Not sure yet' },
];

export const brandEnquiryLimits = {
  name: 120,
  company: 160,
  email: 254,
  budget: 80,
  brief: 4000,
  /** Submissions faster than this after page load are treated as bots. */
  minFillMs: 3000,
} as const;
