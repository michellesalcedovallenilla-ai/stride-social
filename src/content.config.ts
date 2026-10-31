import fs from 'node:fs';
import path from 'node:path';
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Every collection entry can be assigned to a division; the Stride Social site is the default.
const division = z.enum(['social', 'talent', 'education']).default('social');

const seo = z
  .object({
    title: z.string(),
    description: z.string().nullable(),
    ogImage: z.string().nullable().optional(),
  })
  .optional();

const stat = z.object({ label: z.string(), value: z.string() });

const caseStudies = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    category: z.string().nullable(),
    summary: z.string(),
    order: z.number(),
    featured: z.boolean(),
    cardImage: z.string(),
    cardMetric: z.string().nullable(),
    heroImage: z.string().nullable(),
    stats: z.array(stat),
    quote: z.string().nullable(),
    videos: z.array(z.string()),
    /** Present when the case study appears in the home page "recent works" track. */
    home: z.object({ order: z.number(), front: z.string(), back: z.string(), blurb: z.string() }).nullable(),
    division,
    seo,
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    category: z.string().nullable(),
    summary: z.string(),
    date: z.string().nullable(),
    dateLabel: z.string().nullable(),
    /** Short name shown on index cards when it differs from the post title. */
    cardTitle: z.string().optional(),
    /** Month label on small index cards when it differs from `date` (legacy posts). */
    listDate: z.string().optional(),
    author: z.string().nullable(),
    order: z.number(),
    featured: z.boolean(),
    cardImage: z.string(),
    asideImage: z.string().nullable(),
    division,
    seo,
  }),
});

const creators = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/creators' }),
  schema: z.object({
    name: z.string(),
    type: z.string().nullable(),
    category: z.string().nullable(),
    followers: z.string().nullable(),
    biggestChannel: z.string().nullable().optional(),
    relationship: z.enum(['managed', 'ugc-partner']).optional(),
    socials: z.record(z.string()).optional(),
    order: z.number(),
    /** null when the creator has no photo (the card renders blank, as on the live site). */
    image: z.string().nullable(),
    /** false for roster entries whose profile page does not exist on the live site. */
    profile: z.boolean(),
    division: division.default('talent'),
    seo,
  }),
});

const jobs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/jobs' }),
  schema: z.object({
    title: z.string(),
    tag: z.string().nullable(),
    summary: z.string(),
    location: z.string().nullable(),
    salary: z.string().nullable(),
    order: z.number(),
    division,
    seo,
  }),
});

const legacyTestimonials = defineCollection({
  loader: file('./src/content/data/testimonials.json'),
  schema: z.object({ quote: z.string(), name: z.string(), role: z.string(), avatar: z.string() }),
});

const clientLogos = defineCollection({
  loader: file('./src/content/data/client-logos.json'),
  schema: z.object({ src: z.string(), alt: z.string() }),
});

const legacyServices = defineCollection({
  loader: file('./src/content/data/services.json'),
  schema: z.object({ title: z.string(), description: z.string(), bullets: z.array(z.string()) }),
});

/* ==========================================================================
 * Phase 3 content model (docs/phase-2/06-content-architecture.md).
 * The collections above are legacy: they feed Phase 1 pages until each stage replaces them.
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
    .array(z.object({ key: z.string().optional(), label: z.string(), copy: z.string().optional(), cta: z.string().optional(), href: z.string().optional(), audience: z.string().optional() }))
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
  // Legacy (Phase 1 pages)
  caseStudies,
  blog,
  creators,
  jobs,
  legacyTestimonials,
  clientLogos,
  legacyServices,
  // Phase 3
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
  pages,
};
