// Structured data for the case study and creator pages, built from the content collections.
// Follows the shapes the live Webflow templates emit, with absolute URLs and without the
// live site's broken values (icon URL as sameAs, empty sameAs entries, detail pages
// pointing their url at the listing).
import type { CollectionEntry } from 'astro:content';
import { site } from '@/config/site';

const abs = (path: string) => new URL(path, site.url).href;

const caseName = (c: CollectionEntry<'caseStudies'>) => [c.data.title, c.data.category].filter(Boolean).join(' ');

const caseHeadline = (c: CollectionEntry<'caseStudies'>) =>
  [c.data.category, c.data.cardMetric && `${c.data.cardMetric} views`].filter(Boolean).join(' - ') || undefined;

export function caseStudiesListLd(items: CollectionEntry<'caseStudies'>[], description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Case Studies',
    url: abs('/case-studies'),
    description,
    inLanguage: 'en',
    about: { '@type': 'Organization', name: site.name, url: site.url, logo: { '@type': 'ImageObject', url: abs(site.logo.src) } },
    hasPart: items.map((c) => ({
      '@type': 'Article',
      name: caseName(c),
      url: abs(`/case-studies/${c.id}`),
      headline: caseHeadline(c),
      image: abs(c.data.cardImage),
      about: { '@type': 'Brand', name: c.data.title },
    })),
  };
}

export function caseStudyLd(c: CollectionEntry<'caseStudies'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${c.data.title} Case Study`,
    url: abs(`/case-studies/${c.id}`),
    description: c.data.summary,
    inLanguage: 'en',
    about: {
      '@type': 'CreativeWork',
      name: `${c.data.title} Marketing Campaign`,
      description: c.data.summary,
      creator: { '@type': 'Organization', name: site.name, url: site.url },
      image: abs(c.data.heroImage ?? c.data.cardImage),
      ...(c.data.quote ? { review: { '@type': 'Review', reviewBody: c.data.quote } } : {}),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
        { '@type': 'ListItem', position: 2, name: 'Case Studies', item: abs('/case-studies') },
        { '@type': 'ListItem', position: 3, name: c.data.title, item: abs(`/case-studies/${c.id}`) },
      ],
    },
  };
}

export function creatorLd(c: CollectionEntry<'creators'>, photo: string | null) {
  const sameAs = Object.values(c.data.socials ?? {}).filter((u) => /^https?:/.test(u));
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.data.name,
    description: 'Influencer and Content Creator',
    ...(photo ? { image: abs(photo) } : {}),
    url: abs(`/creators/${c.id}`),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: { '@type': 'Organization', name: site.name, url: site.url },
  };
}
