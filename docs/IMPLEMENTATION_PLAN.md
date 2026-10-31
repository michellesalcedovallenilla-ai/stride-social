# Implementation Plan — Stride website rebuild

## Goal

Recreate the public stride-social.com (currently Webflow) as an independent, maintainable codebase that matches the live site visually on desktop and mobile, keeps every URL and SEO tag, and is structured so the next redesign can split the brand into three divisions: **Stride Social**, **Stride Talent** and **Stride Education**.

Constraints: read-only use of the live site (no Webflow project access, no private data), nothing published or deployed, assets saved only when publicly served.

## Findings that shape the plan

- 16 page templates: 11 static pages, 4 CMS collections (case studies 25, blog 42, creators 230, jobs 2) and a 404. Full list in [INVENTORY.md](INVENTORY.md).
- One visual system: navy `#06142b`, ice blue `#c3f2fb`, greys `#f0f0f0 / #ebebeb / #dbdbdb`; Inter (200–900) for nearly everything, IBM Plex Mono for labels, Mona Sans for a few small text runs.
- Webflow breakpoints: 992px (tablet), 768px (mobile landscape), 480px (mobile portrait). Some type sizes use `vh` / `dvh` / `vw` units.
- Motion is part of the brand: Lenis smooth scroll, split-text reveals, infinite marquees, a scroll-driven horizontal case-study track with 3D flip cards, sticky "reveal" footer, an expanding square menu.
- Chinese (`/zh`) mirrors every page with largely translated copy.
- SEO: unique titles and descriptions everywhere, self canonical, hreflang, JSON-LD on home; no OG images on static pages and several pages with multiple `<h1>` (kept visually, corrected semantically).

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 5 (static output) | Zero-JS-by-default HTML, file-based routing that mirrors the Webflow URLs, content collections for CMS data, easy to host anywhere |
| Styling | Plain CSS: design tokens in `src/styles/tokens.css`, component-scoped `<style>` blocks | No framework lock-in; tokens become the theming layer for the three divisions |
| Behaviour | Small vanilla TypeScript modules in `src/scripts/` | Replaces jQuery + GSAP + SplitType + Swiper + Webflow IX2 with ~10 KB of readable code |
| Smooth scroll | Lenis | Same library and settings as the live site |
| Fonts | @fontsource (Inter variable, IBM Plex Mono, Mona Sans variable) | Self-hosted, open licences, no Google Fonts request |
| Content | Content collections (`src/content/`) generated once from the public HTML by `scripts/migrate/` | CMS items become versioned Markdown/JSON that a headless CMS can replace later |
| SEO | `Seo.astro` component + `@astrojs/sitemap` | Titles, descriptions, canonical, hreflang, OG/Twitter and JSON-LD preserved per page |

## Architecture

```
src/
  config/
    site.ts          brand, navigation, footer links, socials, locales, external CTAs
    divisions.ts     Stride Social / Talent / Education registry (theme, base path, nav)
  styles/            tokens.css · global.css (reset, type scale, utilities)
  layouts/
    BaseLayout.astro html shell, SEO head, navbar, reveal footer, page scripts
  components/
    layout/          Navbar, MenuPanel, LocaleSwitcher, Footer, FooterCta
    ui/              Button, MonoLabel, Marquee, SplitText, Accordion, SocialLinks, Seo
    sections/        reusable page sections (HeroVideo, MarqueeHero, LogoTicker, Statement,
                     RecentWorks, StrategiesTicker, Stats, ServicesAccordion, Testimonials, …)
    cards/           CaseStudyCard, CreatorCard, BlogCard, TeamCard, JobRow
  content/           case-studies/ blog/ creators/ jobs/ + data JSON (testimonials, clients, team)
  pages/             one file per live URL pattern (index, about, case-studies/[slug], …)
  scripts/           menu, smooth-scroll, split-reveal, marquee, horizontal-track, accordion, slider
public/assets/       downloaded public media + manifest.json (original URL → local file)
scripts/migrate/     reproducible crawl → content + asset download tools
docs/                inventory, this plan, architecture notes
```

### Ready for three divisions

- `divisions.ts` declares each division's name, base path, accent tokens and navigation. Today only `social` is active and mounted at `/` so every existing URL is unchanged.
- `BaseLayout` takes a `division` prop and sets `data-division` on `<html>`; tokens are overridden per division in `tokens.css`, so Talent and Education can reuse every component with their own palette.
- Sections and cards take data through props, not hard-coded copy, so a Talent page can compose `MarqueeHero + CreatorGrid + Testimonials` without new components.
- Content collections carry an optional `division` field (default `social`); creators are the natural seed for Stride Talent, careers/blog for Education.
- Planned URL scheme: `/` (Social, unchanged), `/talent/*`, `/education/*`, or subdomains via the same config.

## Delivery steps

All steps below are complete for the English site (312 static pages build). Remaining work is listed under "Out of scope".

1. **Inventory** — crawl, SEO and asset inventory (`docs/INVENTORY.md`). ✔
2. **Asset migration** — download every original image and video referenced by public pages into `public/assets/`, record a manifest, skip responsive variants (originals are re-served at their natural size).
3. **Content migration** — parse the crawled HTML into collection entries (case studies, blog posts with rich text, creators with stats, jobs) and page data (testimonials, client logos, team).
4. **Foundation** — tokens, global CSS, fonts, `BaseLayout`, SEO component, navbar + menu, reveal footer, shared UI.
5. **Pages** — home first (sets the patterns), then marketing pages, then collection index + detail templates, then contact / sign-up / 404.
6. **Motion** — marquees, split-text reveals, horizontal case-study track, flip cards, accordions, testimonial slider, smooth scroll; all disabled under `prefers-reduced-motion`.
7. **Visual QA** — full-page screenshots of original vs rebuild at 1440px and 390px for every template, side by side; fix differences until layouts match.
8. **Docs** — README (run/build), architecture notes for the division split, known gaps.

## Out of scope for this pass

- `/zh` content (architecture and switcher are in place; Chinese copy migration is a follow-up).
- Analytics, Google Ads, Jetboost and the Tidio chat widget (slots documented, not embedded).
- The external `join.stride-social.com` funnels (linked, not rebuilt).
- Deployment or any change to the Webflow project.
