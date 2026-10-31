import { defineCollection, z } from 'astro:content';
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

const testimonials = defineCollection({
  loader: file('./src/content/data/testimonials.json'),
  schema: z.object({ quote: z.string(), name: z.string(), role: z.string(), avatar: z.string() }),
});

const clientLogos = defineCollection({
  loader: file('./src/content/data/client-logos.json'),
  schema: z.object({ src: z.string(), alt: z.string() }),
});

const services = defineCollection({
  loader: file('./src/content/data/services.json'),
  schema: z.object({ title: z.string(), description: z.string(), bullets: z.array(z.string()) }),
});

export const collections = { caseStudies, blog, creators, jobs, testimonials, clientLogos, services };
