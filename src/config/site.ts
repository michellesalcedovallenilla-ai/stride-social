// Global brand + navigation config. Pages and layout components read from here so
// copy and links live in one place.

export const site = {
  name: 'Stride Social',
  legalName: 'Stride Global Holdings Pte. Ltd',
  companyNumber: '202527987G',
  url: 'https://www.stride-social.com',
  phone: { label: 'Office - 020 3633 9553', href: 'tel:02036339553' },
  logo: { src: '/assets/site/202a2630-stride-social-logo-b.webp', alt: 'Stride Social company logo in black text.' },
  favicon: '/assets/site/b5e9e5f9-group-15066.png',
  appleTouchIcon: '/assets/site/223c1594-stride-social.jpg',
} as const;

export const cta = {
  brandBrief: { label: 'Send us a brief (For brands)', href: 'https://join.stride-social.com/join/brand?via=wb' },
  joinTalent: { label: 'JOIN STRIDE TALENT', href: 'https://join.stride-social.com/join/creator?via=wc' },
} as const;

/** Footer call-to-action variants used across the live site (pass one to BaseLayout). */
export const footerCtas = {
  home: { heading: ['Let’s Work Together.'], links: [cta.brandBrief, cta.joinTalent] },
  standard: {
    heading: ['Stride Ahead with Influencer Marketing.', 'Let’s Work Together.'],
    links: [{ label: 'Start a campaign', href: '/contact' }, cta.joinTalent],
  },
  strategies: {
    heading: ['Stride Ahead with Influencer Marketing.', 'Let’s Work Together.'],
    links: [{ label: 'Start a campaign', href: cta.brandBrief.href }],
  },
  about: { heading: ['Let’s Work Together.'], links: [{ label: 'enquiry (For brands)', href: '/contact' }, cta.joinTalent] },
  seeding: { heading: ['Ready to start scaling your influencer seeding?'], links: [{ label: 'get quote in minutes', href: '/contact' }] },
} as const;

export type NavLink = { label: string; href: string };

/** Large links in the expanding menu panel. */
export const primaryNav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Strategies', href: '/influencer-strategies' },
  { label: 'Case studies', href: '/case-studies' },
  { label: 'Creators', href: '/creators' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/** Small links under the primary menu. */
export const secondaryNav: NavLink[] = [
  { label: 'Influencer Seeding', href: '/influencer-seeding' },
  { label: 'Our services', href: '/our-services' },
  { label: 'Our Team', href: '/meet-the-team' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
];

export const footerLinks: NavLink[] = [
  { label: 'Get Quotes for Influencers', href: '/contact' },
  { label: site.phone.label, href: site.phone.href },
  { label: 'Our blog', href: '/blog' },
];

export const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/stridetalent/', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/stridesocialagency/', icon: 'linkedin' },
] as const;

export type Locale = { code: string; label: string; flag: string; href: (path: string) => string; migrated: boolean };

/**
 * Locales mirrored from Webflow Localization. `zh` copy has not been migrated yet, so its
 * switcher entry points at the live Chinese page until `migrated` flips to true.
 */
export const locales: Locale[] = [
  { code: 'en', label: 'English', flag: '/assets/site/10f2cd4b-united-kingdom_flag_icon_round.svg', href: (p) => p, migrated: true },
  { code: 'zh', label: 'Chinese', flag: '/assets/site/251fed6f-circle_flag_of_the_people-s_republic_of_china.svg', href: (p) => `${site.url}/zh${p === '/' ? '' : p}`, migrated: false },
];
