// Single place that decides where collection items live. During Phase 3 some items still
// render on their Phase 1 routes; switch these when the new templates ship (see 03-sitemap §5).
// If Stride keeps the old URLs (Q16), the new templates mount there and only this file changes.

export const routes = {
  caseStudy: (slug: string) => `/work/${slug}`,
  service: (slug: string) => `/social/services/${slug}`,
  workFiltered: (filter: { industry?: string; service?: string }) => `/work?${new URLSearchParams(filter)}`,
  article: (slug: string) => `/blog/${slug}`, // → /insights/[slug] in Stage 7
  creator: (slug: string) => `/creators/${slug}`, // → /talent/roster/[slug] in Stage 5
};
