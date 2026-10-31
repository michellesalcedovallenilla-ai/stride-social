# Stride website

An independent rebuild of [stride-social.com](https://www.stride-social.com) (currently on Webflow) as a static Astro site. It matches the live site page for page on desktop and mobile. It is also structured for the planned split into **Stride Social**, **Stride Talent** and **Stride Education**.

Nothing here is deployed. The Webflow project was never accessed: everything was rebuilt from the public pages.

## Quick start

Requires Node 20.3+ (developed on Node 26), Git and [Git LFS](https://git-lfs.com) (videos are stored with LFS). On Windows, run `git config --global core.longpaths true` once before cloning, because some asset filenames are long.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serve the built site
```

## What's where

| Path | Purpose |
|---|---|
| `src/pages/` | One file per live URL pattern (`about.astro`, `case-studies/[slug].astro`, …) |
| `src/layouts/BaseLayout.astro` | HTML shell: SEO head, navbar, sticky reveal footer CTA, footer, global scripts |
| `src/components/layout/` | Navbar + expanding menu, locale switcher, footer CTA, footer |
| `src/components/ui/` | Small building blocks: Button, MonoLabel, Marquee, RichText, InfoRows, Seo, … |
| `src/components/sections/` | Reusable page sections (MarqueeHero, DetailHero, LogoTicker, Testimonials, ServicesAccordion, home sections) |
| `src/components/cards/` | TalentCard (creators, case studies, blog) |
| `src/components/{company,offering,portfolio,editorial}/` | Page-specific sections grouped by area |
| `src/content/` | Content collections: `case-studies/`, `blog/`, `creators/`, `jobs/` (Markdown with HTML bodies) and `data/*.json` |
| `src/content.config.ts` | Collection schemas |
| `src/config/site.ts` | Brand, nav, footer links, socials, locales, footer CTA variants |
| `src/config/divisions.ts` | Stride Social / Talent / Education registry |
| `src/styles/` | `tokens.css` (design tokens + division themes), `global.css` (reset, fonts, helpers) |
| `src/scripts/` | Client behaviour: navbar, smooth scroll, split-text reveals, scroll-linked motion, drag scrolling |
| `public/assets/` | Media saved from the public site (`site/`, `cms/`, `video/`) + `manifest.json` (original URL → local file) |
| `scripts/migrate/` | Reproducible migration tools (content extraction, asset download) |
| `docs/` | [Inventory](docs/INVENTORY.md), [implementation plan](docs/IMPLEMENTATION_PLAN.md), [architecture](docs/ARCHITECTURE.md) |

## Editing content

- **Case studies, blog posts, creators, jobs**: edit or add Markdown files in `src/content/<collection>/`. The frontmatter is validated by `src/content.config.ts`. The body can be Markdown or HTML. `order` controls list order; `featured: true` puts an item in the large two-up row on index pages.
- **Testimonials, client logos, services**: `src/content/data/*.json`.
- **Navigation, footer, CTAs, phone, socials**: `src/config/site.ts`.

## Re-running the migration

The content and assets were generated from a crawl of the public site. To refresh them:

1. Crawl the public pages into a folder of HTML files named like `case-studies__meta.html`. Creators pagination pages are `creators__page2.html` and `creators__page3.html`. See `docs/INVENTORY.md` for the URL list.
2. `node scripts/migrate/download-assets.mjs`: downloads originals listed in `docs/inventory/assets.json`.
3. `node scripts/migrate/extract-content.mjs <crawlDir>`: rewrites `src/content/*`.
4. `node scripts/migrate/download-flowdrive.mjs`: downloads case-study campaign videos.

Hand edits in `src/content` are overwritten by step 3, so treat the migration as a one-off once editing starts.

## Environment

| Variable | Purpose |
|---|---|
| `PUBLIC_CONTACT_FORM_ACTION` | URL the contact form POSTs to. Without it, the form opens the visitor's mail app instead (the live site used Webflow's form backend). |

## Notes

- `public/assets` is about 440 MB, mostly case-study campaign videos copied unchanged from the live CDN. Some are over 30 MB each. Before going live, re-encode them or move them to a video host or CDN.
- The project lives in a OneDrive folder. Consider excluding `node_modules/` and `dist/` from sync, or moving the repo out of OneDrive, to avoid slow syncs.
- `/zh` (Chinese) is not migrated yet. The locale switcher links to the live Chinese pages until it is.
- Analytics (GA4, GTM, Google Ads), Jetboost and the Tidio chat widget are deliberately not embedded. Add them in `BaseLayout.astro` when going live.
