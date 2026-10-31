# Stride website

The new Stride group website: the parent site plus **Stride Social** (brands), **Stride Talent** (creators) and **Stride Education** (emerging creators). It is a static [Astro](https://astro.build) site, built to replace the current Webflow site at stride-social.com.

Nothing here is deployed. The Webflow project was never accessed: the first version was rebuilt from the public pages (Phase 1, git tag `phase-1-recreation`), and the redesign was built stage by stage from the approved plan in `docs/phase-2/`.

## Quick start

Requires Node 20.3+ (developed on Node 26), Git and [Git LFS](https://git-lfs.com) (videos are stored with LFS). On Windows, run `git config --global core.longpaths true` once before cloning.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/ (the first build generates image sizes and takes a few minutes)
npm run preview    # serve the built site
npm run ci         # every check CI runs
```

Set `PUBLIC_SITE_ENV=production` for the live build. Anything else is a preview build: every page is noindex, robots.txt blocks crawlers, and content waiting on Stride shows labelled placeholders.

## What's where

| Path | Purpose |
|---|---|
| `src/pages/` | One file per route: landings (`index`, `social/`, `talent/`, `education/`), `work/`, `insights/`, `careers/`, group pages, legal, 404, robots.txt |
| `src/layouts/SiteLayout.astro` | HTML shell: SEO head, header with mega menus and division bar, footer, consent banner, motion scripts |
| `src/components/core/` | Primitives: Button, Field, CheckboxGroup, FormShell, Media, Prose, PlaceholderNotice, DraftTag, Chip, Badge, Eyebrow |
| `src/components/global/` | Header, footer, breadcrumbs, page intro, SEO tags, consent banner |
| `src/components/{home,social,talent,education,group}/` | Sections for each area |
| `src/content/` | Content collections (Markdown/YAML): work, insights, roster, team, services, brands, testimonials, milestones, roles, legal, sponsorships, taxonomies, and `pages/*.yaml` page copy |
| `src/content.config.ts` | Schemas, including the status fields that keep unconfirmed content off the live site |
| `src/config/` | `navigation.ts`, `forms.ts`, `analytics.ts`, `site.ts` |
| `src/lib/` | Helpers: routes, roster consent rule, education availability, insights, legacy link rewriting |
| `src/scripts/system/` | Small vanilla TypeScript modules (forms, filters, rails, motion, consent) |
| `src/styles/system/` | Design tokens, base styles, fonts |
| `integrations/` | Build step that adds responsive WebP images |
| `scripts/checks/` | Links, placeholders, content status, redirects, SEO |
| `scripts/redirects/map.mjs` | Old URL → new URL map (Netlify/Cloudflare `_redirects` + fallback redirect pages) |
| `public/assets/` | Media (`site/`, `cms/`, `video/`) |
| `docs/` | Plan (`phase-2/`), stage notes (`phase-3/`), [editor guide](docs/EDITING.md), [launch checklist](docs/LAUNCH.md) |

## Editing content

See **[docs/EDITING.md](docs/EDITING.md)**: page copy, case studies, creators, articles, roles, statuses, images, and the review workflow.

## Environment

| Variable | Purpose |
|---|---|
| `PUBLIC_SITE_ENV` | `production` for the live build; anything else is a preview |
| `PUBLIC_BRAND_ENQUIRY_ACTION` | Brand enquiry form endpoint (Q13) |
| `PUBLIC_TALENT_APPLICATION_ACTION` | Talent application form endpoint (Q13) |
| `PUBLIC_EDUCATION_ENQUIRY_ACTION` | Education enquiry form endpoint (Q11, Q13) |
| `PUBLIC_CONTACT_FORM_ACTION` | General contact form endpoint (Q13) |
| `PUBLIC_GA4_ID` / `PUBLIC_PLAUSIBLE_DOMAIN` | Analytics, off unless set (Q14). GA4 waits for cookie consent. |

Forms without an endpoint show a clear "email us" state instead of failing. See `.env.example`.
