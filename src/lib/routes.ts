// Single place that decides where collection items live. During Phase 3 some items still
// render on their Phase 1 routes; switch these when the new templates ship (see 03-sitemap §5).
// If Stride keeps the old URLs (Q16), the new templates mount there and only this file changes.

export const routes = {
  caseStudy: (slug: string) => `/work/${slug}`,
  service: (slug: string) => `/social/services/${slug}`,
  workFiltered: (filter: { industry?: string; service?: string }) => `/work?${new URLSearchParams(filter)}`,
  article: (slug: string) => `/insights/${slug}`,
  insightsFiltered: (category: string) => `/insights?category=${category}`,
  role: (slug: string) => `/careers/${slug}`,
  creator: (slug: string) => `/talent/roster/${slug}`,
  rosterFiltered: (category: string) => `/talent/roster?category=${category}`,
  creatorEnquiry: (slug: string) => `/social/enquire?creator=${slug}`,
  talentDivision: (slug: string) => `/talent/${slug}`,
};
