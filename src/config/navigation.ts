// Navigation for the Stride group site (spec: docs/phase-2/03-sitemap.md §2).
// Header, mega menus, mobile menu, division bars and footer all read from here.

export type DivisionKey = 'group' | 'social' | 'talent' | 'education';

export type NavLink = { label: string; href: string; description?: string };

export type MegaMenu = {
  columns: { title?: string; links: NavLink[] }[];
  /** Which feature tile the header renders on the right of the panel. */
  feature: 'latest-article' | 'featured-case-study' | 'roster-portrait' | 'education';
};

export type PrimaryItem = {
  label: string;
  href: string;
  division?: DivisionKey;
  menu?: MegaMenu;
};

export const services: NavLink[] = [
  { label: 'Influencer Activations', href: '/social/services/influencer-activations' },
  { label: 'Influencer Seeding', href: '/social/services/influencer-seeding' },
  { label: 'UGC Production', href: '/social/services/ugc-production' },
  { label: 'TikTok Shop', href: '/social/services/tiktok-shop' },
  { label: 'TikTok Shop Livestreams', href: '/social/services/tiktok-shop-livestreams' },
  { label: 'Influencer Events', href: '/social/services/influencer-events' },
  { label: 'Podcast Activations', href: '/social/services/podcast-activations' },
];

export const talentDivisions: NavLink[] = [
  { label: 'Stride Sport', href: '/talent/sport' },
  { label: 'Stride Travel', href: '/talent/travel' },
  { label: 'Stride Podcasts', href: '/talent/podcasts' },
  { label: 'Stride Music', href: '/talent/music' },
  { label: 'Stride Speakers', href: '/talent/speakers' },
];

export const primaryNav: PrimaryItem[] = [
  {
    label: 'Our Group',
    href: '/about',
    menu: {
      columns: [
        {
          links: [
            { label: 'About Stride', href: '/about' },
            { label: 'Our History', href: '/history' },
            { label: 'Our Team', href: '/team' },
            { label: 'Our Sponsorships', href: '/sponsorships' },
            { label: 'Careers', href: '/careers' },
            { label: 'Insights', href: '/insights' },
          ],
        },
      ],
      feature: 'latest-article',
    },
  },
  {
    label: 'Stride Social',
    href: '/social',
    division: 'social',
    menu: {
      columns: [
        {
          links: [
            { label: 'Overview', href: '/social', description: 'Influencer marketing, content, campaigns and commerce.' },
            { label: 'Our Work', href: '/work' },
            { label: 'Start a campaign', href: '/social/enquire' },
          ],
        },
        { title: 'Services', links: services },
      ],
      feature: 'featured-case-study',
    },
  },
  {
    label: 'Stride Talent',
    href: '/talent',
    division: 'talent',
    menu: {
      columns: [
        {
          links: [
            { label: 'Overview', href: '/talent', description: 'Representation, opportunities and long-term career management.' },
            { label: 'Creator roster', href: '/talent/roster' },
            { label: 'Apply for management', href: '/talent/apply' },
          ],
        },
        { title: 'Divisions', links: talentDivisions },
      ],
      feature: 'roster-portrait',
    },
  },
  {
    label: 'Stride Education',
    href: '/education',
    division: 'education',
    menu: {
      columns: [
        {
          links: [
            { label: 'Overview', href: '/education', description: 'Learn the industry, develop your content, build your creator career.' },
            { label: "What you'll learn", href: '/education#learn' },
            { label: 'The experience', href: '/education#experience' },
            { label: 'Enquire', href: '/education/enquire' },
          ],
        },
      ],
      feature: 'education',
    },
  },
  { label: 'Our Work', href: '/work' },
  { label: 'About', href: '/about' },
];

export const contactLink: NavLink = { label: 'Contact', href: '/contact' };

/**
 * The camera mode dial (global/ModeDial.astro): the six modes it turns between, in dial order.
 * `links` are the pages the menu shows for the selected mode (reusing the lists above).
 */
export type ModeKey = 'group' | 'social' | 'talent' | 'education' | 'work' | 'about';
export type Mode = { key: ModeKey; label: string; href: string; links: NavLink[] };

const menuLinks = (label: string) => primaryNav.find((i) => i.label === label)?.menu?.columns.flatMap((c) => c.links) ?? [];

export const modes: Mode[] = [
  { key: 'group', label: 'Group', href: '/', links: [{ label: 'Home', href: '/' }, { label: 'Insights', href: '/insights' }, contactLink] },
  { key: 'social', label: 'Social', href: '/social', links: menuLinks('Stride Social') },
  { key: 'talent', label: 'Talent', href: '/talent', links: menuLinks('Stride Talent') },
  { key: 'education', label: 'Education', href: '/education', links: menuLinks('Stride Education') },
  { key: 'work', label: 'Work', href: '/work', links: [{ label: 'Our Work', href: '/work' }, { label: 'Start a campaign', href: '/social/enquire' }] },
  { key: 'about', label: 'About', href: '/about', links: menuLinks('Our Group') },
];

/** Which mode a page belongs to, from its path (the home page and anything unlisted is Group). */
export function modeOf(path: string): ModeKey {
  const p = path.replace(/\/$/, '') || '/';
  if (p.startsWith('/work')) return 'work';
  if (p.startsWith('/social')) return 'social';
  if (p.startsWith('/talent')) return 'talent';
  if (p.startsWith('/education')) return 'education';
  if (['/about', '/history', '/team', '/sponsorships', '/careers'].some((s) => p.startsWith(s))) return 'about';
  return 'group';
}

/** Second row shown inside a division: where you are, its key pages and its main action. */
export const divisionBars: Record<Exclude<DivisionKey, 'group'>, { name: string; links: NavLink[]; cta: NavLink }> = {
  social: {
    name: 'Stride Social',
    links: [
      { label: 'Services', href: '/social/services' },
      { label: 'Our Work', href: '/work' },
      { label: 'Approach', href: '/social#approach' },
    ],
    cta: { label: 'Start a campaign', href: '/social/enquire' },
  },
  talent: {
    name: 'Stride Talent',
    links: [
      { label: 'Roster', href: '/talent/roster' },
      { label: 'Divisions', href: '/talent#divisions' },
      { label: 'Creator stories', href: '/talent#stories' },
    ],
    cta: { label: 'Apply for management', href: '/talent/apply' },
  },
  education: {
    name: 'Stride Education',
    links: [
      { label: "What you'll learn", href: '/education#learn' },
      { label: 'The experience', href: '/education#experience' },
      { label: 'Stories', href: '/education#stories' },
    ],
    cta: { label: 'Enquire', href: '/education/enquire' },
  },
};

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: 'Group',
    links: [
      { label: 'About', href: '/about' },
      { label: 'History', href: '/history' },
      { label: 'Team', href: '/team' },
      { label: 'Sponsorships', href: '/sponsorships' },
      { label: 'Careers', href: '/careers' },
      { label: 'Insights', href: '/insights' },
    ],
  },
  {
    title: 'Stride Social',
    links: [
      { label: 'Overview', href: '/social' },
      { label: 'Services', href: '/social/services' },
      { label: 'Our Work', href: '/work' },
      { label: 'Start a campaign', href: '/social/enquire' },
    ],
  },
  {
    title: 'Stride Talent',
    links: [
      { label: 'Overview', href: '/talent' },
      { label: 'Roster', href: '/talent/roster' },
      { label: 'Divisions', href: '/talent#divisions' },
      { label: 'Apply', href: '/talent/apply' },
    ],
  },
  {
    title: 'Stride Education',
    links: [
      { label: 'Overview', href: '/education' },
      { label: 'Enquire', href: '/education/enquire' },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Terms', href: '/terms' },
];

/**
 * Pages that are in the approved sitemap but not built yet. Each renders a clearly labelled,
 * noindex placeholder (src/pages/[...planned].astro) so no link is a dead end. `current` links to
 * the Phase 1 page with the same content until the new one replaces it.
 * Remove an entry when its real page ships.
 */
export const plannedPages: { path: string; title: string; stage: string; summary: string; current?: string }[] = [
];
