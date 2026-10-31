// Single place that decides where collection items live. During Phase 3 some items still
// render on their Phase 1 routes; switch these when the new templates ship (see 03-sitemap §5).

export const routes = {
  caseStudy: (slug: string) => `/case-studies/${slug}`, // → /work/[slug] in Stage 4
  article: (slug: string) => `/blog/${slug}`, // → /insights/[slug] in Stage 7
  creator: (slug: string) => `/creators/${slug}`, // → /talent/roster/[slug] in Stage 5
};
