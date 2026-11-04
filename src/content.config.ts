import fs from 'node:fs';
import path from 'node:path';
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/* ==========================================================================
 * Content model (docs/phase-2/06-content-architecture.md). The Phase 1 collections were retired
 * in Stage 8 with the last Phase 1 pages (they remain at git tag phase-1-recreation).
 *
 * Status fields make "no invented content" checkable (npm run check:content):
 *   verified/confirmed: approved by Stride, publishable
 *   legacy: was public on the old stride-social.com; needs re-confirmation before launch
 *   unverified/none/proposed/draft/needed: not publishable as-is
 * ========================================================================== */

const assetPath = z
  .string()
  .refine((p) => /^https?:/.test(p) || fs.existsSync(path.join('public', p)), (p) => ({ message: `File not found in public/: ${p}` }));
const media = z.object({ src: assetPath, alt: z.string().min(1, 'Alt text is required') });
const verification = z.enum(['verified', 'legacy', 'unverified']);
const consent = z.object({
  status: z.enum(['confirmed', 'legacy', 'none']),
  confirmedBy: z.string().optional(),
  date: z.coerce.date().optional(),
});
const copyStatus = z.enum(['approved', 'draft', 'needed']).default('needed');
const pageSeo = z.object({ title: z.string(), description: z.string().nullable() }).optional();

// Taxonomies (small YAML lists)
const categories = defineCollection({
  loader: file('./src/content/taxonomies/categories.yaml'),
  schema: z.object({ label: z.string(), order: z.number() }),
});

const industries = defineCollection({
  loader: file('./src/content/taxonomies/industries.yaml'),
  schema: z.object({ label: z.string(), order: z.number() }),
});

const markets = defineCollection({
  loader: file('./src/content/taxonomies/markets.yaml'),
  schema: z.object({
    label: z.string(),
    roles: z.array(z.enum(['talent-market', 'team-location', 'operating-market', 'office'])),
    status: verification,
    source: z.string(),
  }),
});

// Stride Social services
const services = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: z.object({
    name: z.string(),
    number: z.number(),
    descriptor: z.string(),
    copyStatus,
    deliverables: z.array(z.string()).default([]),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    hero: media.optional(),
    seo: pageSeo,
  }),
});

// Stride Talent specialist divisions
const talentDivisions = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/talent-divisions' }),
  schema: z.object({
    name: z.string(),
    status: z.enum(['active', 'coming-soon']),
    tagline: z.string().nullable().default(null),
    hero: media.optional(),
    order: z.number(),
    copyStatus,
  }),
});

// Stride Education
const educationItem = z.object({
  title: z.string(),
  /** One line on what the creator gets from it. */
  summary: z.string().nullable().default(null),
  status: z.enum(['available', 'planned', 'unconfirmed']),
  copyStatus,
  order: z.number(),
});
const educationTopics = defineCollection({ loader: file('./src/content/education/topics.yaml'), schema: educationItem });
const educationExperience = defineCollection({ loader: file('./src/content/education/experience.yaml'), schema: educationItem });

// Brands (logo strip, case study clients)
const brands = defineCollection({
  loader: file('./src/content/brands/brands.yaml'),
  schema: z.object({
    name: z.string(),
    logo: assetPath.nullable(),
    approval: z.object({ status: z.enum(['confirmed', 'legacy', 'none']) }),
  }),
});

// Team
const team = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    department: z.enum(['leadership', 'talent', 'campaigns', 'social', 'sales', 'operations']),
    photo: media,
    photoAlt: media.optional(),
    /** Full-body character render for the homepage lineup (transparent PNG/WebP, feet at the bottom). Headshot used until supplied. */
    character: media.optional(),
    bio: z.string().optional(),
    linkedin: z.string().url().optional(),
    order: z.number(),
    visible: z.boolean().default(true),
  }),
});

// Testimonials (brand, creator and student quotes)
const testimonials = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    type: z.enum(['brand', 'creator', 'student']),
    division: z.enum(['social', 'talent', 'education']),
    image: media.nullable(),
    consent,
    featured: z.boolean().default(false),
  }),
});

// Creator roster (Stride Talent)
const roster = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/roster' }),
  schema: z.object({
    name: z.string(),
    portrait: media.nullable(),
    mainCategory: reference('categories').nullable(),
    categories: z.array(reference('categories')).default([]),
    categoryStatus: z.enum(['proposed', 'approved']),
    legacyCategory: z.string().nullable(),
    divisions: z.array(reference('talentDivisions')).default([]),
    country: z.string().length(2).nullable(),
    platforms: z
      .object({
        tiktok: z.string().url(),
        instagram: z.string().url(),
        youtube: z.string().url(),
        twitch: z.string().url(),
        podcast: z.string().url(),
        x: z.string().url(),
        website: z.string().url(),
      })
      .partial()
      .default({}),
    relationship: z.enum(['managed', 'partner']),
    audience: z.object({ figure: z.string(), platform: z.string().nullable(), source: z.string(), status: verification }).nullable(),
    featured: z.boolean().default(false),
    order: z.number(),
    visible: z.boolean().default(true),
    consent,
    seo: pageSeo,
    locale: z.string().default('en'),
  }),
});

// Our Work (case studies)
const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: reference('brands'),
    summary: z.string(),
    services: z.array(reference('services')).default([]),
    industries: z.array(reference('industries')).default([]),
    tagStatus: z.enum(['proposed', 'approved']),
    markets: z.array(z.string()).default([]),
    year: z.number().nullable().default(null),
    hero: media.nullable(),
    card: media,
    homeTile: z.object({ front: media, back: media, blurb: z.string() }).nullable().default(null),
    videos: z.array(z.object({ src: assetPath, caption: z.string().optional() })).default([]),
    brief: z.string().nullable().default(null),
    strategy: z.string().nullable().default(null),
    execution: z.string().nullable().default(null),
    resultsSummary: z.string().nullable().default(null),
    results: z.array(z.object({ label: z.string(), value: z.string(), source: z.string(), status: verification })).default([]),
    creators: z.array(reference('roster')).default([]),
    quote: z.object({ text: z.string(), status: verification }).nullable().default(null),
    featuredOn: z.array(z.enum(['home', 'social'])).default([]),
    featuredOrder: z.number().nullable().default(null),
    contentStatus: z.enum(['complete', 'needs-rewrite', 'needs-input']),
    order: z.number(),
    visible: z.boolean().default(true),
    seo: pageSeo,
    locale: z.string().default('en'),
  }),
});

// Insights (articles)
const insights = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['company-news', 'creator-economy', 'marketing-insights', 'education']),
    categoryStatus: z.enum(['proposed', 'approved']),
    date: z.coerce.date().nullable(),
    author: reference('team').nullable(),
    authorName: z.string().nullable(),
    standfirst: z.string(),
    cover: media,
    aside: media.nullable(),
    cardTitle: z.string().optional(),
    listDate: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
    visible: z.boolean().default(true),
    seo: pageSeo,
    locale: z.string().default('en'),
  }),
});

// Sponsorships (homepage "Beyond business" + Sponsorships page). Empty until Stride supplies them.
const sponsorships = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/sponsorships' }),
  schema: z.object({
    title: z.string(),
    partner: z.string(),
    type: z.enum(['creator', 'sports-team', 'event', 'community']),
    year: z.number(),
    location: z.string().optional(),
    images: z.array(media).min(1),
    summary: z.string(),
    link: z.string().url().optional(),
    featured: z.boolean().default(false),
    approval: z.object({ status: z.enum(['confirmed', 'none']) }),
  }),
});

// Our History milestones. Only verified milestones render in production; legacy ones (from the
// previous site's timeline) show in preview, labelled, until Stride confirms them (Q1).
const milestones = defineCollection({
  loader: file('./src/content/history/milestones.yaml'),
  schema: z.object({
    year: z.number(),
    title: z.string(),
    body: z.string(),
    image: media.nullable().default(null),
    status: verification,
    source: z.string(),
    order: z.number(),
  }),
});

// Careers: open roles. Production lists only roles Stride has confirmed as open.
const roles = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/careers' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    location: z.string().nullable(),
    salary: z.string().nullable(),
    /** open = confirmed by Stride · legacy = posted on the previous site, to confirm · closed */
    status: z.enum(['open', 'legacy', 'closed']),
    /** The placement scheme gets its own highlight on the Careers page. */
    scheme: z.boolean().default(false),
    order: z.number(),
    seo: pageSeo,
  }),
});

// Legal pages. Text must come from Stride (Q15); until then the template shows a labelled notice.
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['awaiting', 'approved']),
    updated: z.coerce.date().nullable().default(null),
    summary: z.string(),
  }),
});

// Editable copy for hand-composed pages (one YAML file per page, sections keyed by name).
// status: approved (from the client brief or signed off) · draft (written by us, needs sign-off).
const sectionCopy = z.object({
  status: z.enum(['approved', 'draft']),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  lines: z.array(z.string()).optional(),
  body: z.string().optional(),
  cta: z.object({ label: z.string(), href: z.string() }).optional(),
  items: z
    .array(z.object({ key: z.string().optional(), label: z.string(), copy: z.string().optional(), cta: z.string().optional(), href: z.string().optional(), audience: z.string().optional(), image: assetPath.optional() }))
    .optional(),
  awaiting: z.array(z.string()).optional(),
  /** Collection entry ids hand-picked for this section (e.g. hero portraits from the roster). */
  featured: z.array(z.string()).optional(),
});
const pages = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/pages' }),
  schema: z.object({ sections: z.record(sectionCopy) }),
});

export const collections = {
  categories,
  industries,
  markets,
  services,
  talentDivisions,
  educationTopics,
  educationExperience,
  brands,
  team,
  testimonials,
  roster,
  work,
  insights,
  sponsorships,
  milestones,
  roles,
  legal,
  pages,
};
