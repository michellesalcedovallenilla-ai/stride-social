// Form definitions shared by the page markup (src/components/social/EnquiryForm.astro,
// src/components/talent/ApplicationForm.astro) and the server-side validation
// (src/lib/forms/*.ts), so both enforce the same rules (docs/phase-2/07-technical-architecture.md §6).
import { services } from './navigation';

/** Public inbox used as the fallback when a form can't be sent (from the current contact page). */
export const enquiryEmail = 'team@stride-social.com';

/** Public careers inbox (the application route on the previous site). */
export const careersEmail = 'Careers@stride-social.com';

/** Where the general contact form posts (/contact). Empty until Stride confirms (Q13). */
export const contactAction = import.meta.env.PUBLIC_CONTACT_FORM_ACTION ?? '';

export const contactTopics = [
  { value: 'general', label: 'General question' },
  { value: 'press', label: 'Press and media' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'careers', label: 'Careers' },
  { value: 'other', label: 'Something else' },
];

export const contactLimits = { name: 120, email: 254, message: 2000, minFillMs: 3000 } as const;

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

/** Where the talent application form posts. Empty until Stride confirms the destination (Q13). */
export const talentApplicationAction = import.meta.env.PUBLIC_TALENT_APPLICATION_ACTION ?? '';

// Primary platforms (docs/phase-2/05-wireframes.md C7).
export const platformOptions = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'other', label: 'Other' },
];

/** Where the Stride Education enquiry form posts. Empty until Stride confirms the route (Q11, Q13). */
export const educationEnquiryAction = import.meta.env.PUBLIC_EDUCATION_ENQUIRY_ACTION ?? '';

export const educationEnquiryLimits = {
  name: 120,
  email: 254,
  country: 80,
  message: 1000,
  minFillMs: 3000,
} as const;

export const talentApplicationLimits = {
  name: 120,
  email: 254,
  country: 80,
  link: 300,
  /** Social link rows: the first is required, the rest optional. */
  links: 5,
  intro: 500,
  minFillMs: 3000,
} as const;
