// The Stride group is splitting into three divisions. Each one gets a base path, a theme
// (token overrides keyed by `data-division` in src/styles/tokens.css) and its own nav.
// Only `social` is live today and it is mounted at `/`, so every existing URL is unchanged.
// To launch a division: set `enabled: true`, add pages under `src/pages/<basePath>/`, and
// pass `division="talent"` (etc.) to BaseLayout.

export type DivisionId = 'social' | 'talent' | 'education';

export type Division = {
  id: DivisionId;
  name: string;
  tagline: string;
  basePath: string;
  enabled: boolean;
  /** Content collections whose entries belong to this division by default. */
  collections: string[];
};

export const divisions: Record<DivisionId, Division> = {
  social: {
    id: 'social',
    name: 'Stride Social',
    tagline: 'Influencer advertising done right.',
    basePath: '/',
    enabled: true,
    collections: ['caseStudies', 'blog', 'jobs'],
  },
  talent: {
    id: 'talent',
    name: 'Stride Talent',
    tagline: 'Creator management.',
    basePath: '/talent',
    enabled: false,
    collections: ['creators'],
  },
  education: {
    id: 'education',
    name: 'Stride Education',
    tagline: 'Learn the creator economy.',
    basePath: '/education',
    enabled: false,
    collections: [],
  },
};

export const defaultDivision: DivisionId = 'social';
