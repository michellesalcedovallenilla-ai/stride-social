# Architecture

## Principles

1. **One page file per URL pattern.** `src/pages` mirrors the live Webflow URLs exactly (`build.format: 'file'`, no trailing slash), so SEO equity carries over.
2. **Content is data.** Collection items live in `src/content` with typed schemas. Pages never hard-code CMS copy, and static-page copy sits at the top of each page file or in `src/content/data`.
3. **Sections take props.** Section components receive their copy and items as props. A new page, or a new division, is a composition of existing sections.
4. **Tokens, not hex codes.** Colours, fonts, gutters and motion easing come from `src/styles/tokens.css`. Components use semantic roles (`--accent`, `--on-accent`, `--surface-dark`), which division themes override.
5. **No framework runtime.** Interactivity is small TypeScript modules wired through `data-*` attributes. Pages work without JavaScript; motion respects `prefers-reduced-motion`.

## Page anatomy

```
BaseLayout (title, description, nav variant, footerCta, division)
├─ Navbar          fixed; hides on scroll down, returns on scroll up; expanding square menu
├─ <main>          z-index 1, sits above the reveal footer
│   └─ sections…   MarqueeHero | DetailHero | HeroVideo | LogoTicker | … | Testimonials
├─ FooterCta       sticky bottom:0, z-index 0 → revealed as content scrolls away
└─ Footer          logo, WeChat QR, socials, links, legal line
```

## Motion system (replaces Webflow IX2, GSAP, SplitType, Swiper, jQuery)

| Behaviour | Where | How |
|---|---|---|
| Smooth scroll | every page | `scripts/smooth-scroll.ts` (Lenis, same lerp/wheel settings as live) |
| Split-text reveals | `data-split="…"` | `scripts/split-text.ts` splits into `.word/.char`, plays at 60% viewport, resets when scrolled back below |
| Scroll-scrubbed words | `data-split="scrub-each-word"` | same module, opacity follows scroll |
| One-shot scroll-into-view reveals | `data-reveal` → `.is-revealed` | `scripts/reveal.ts` (each component styles its own transition) |
| Infinite tickers | `ui/Marquee.astro` | CSS keyframes, duplicated track |
| Scroll-linked rows | `data-scroll-x`, `data-scroll-scope` | `scripts/scroll-motion.ts` |
| Horizontal case-study track | `data-horizontal-track` / `data-horizontal-rail` | same module; disabled ≤991px via `--horizontal-enabled: 0` |
| Flip cards, card hover, menu | CSS transitions | component styles |
| Draggable sliders | `data-drag-scroll` | `scripts/drag-scroll.ts` + native scroll-snap |

## The three divisions

The group is moving to three brands: Stride Social (agency), Stride Talent (creator management) and Stride Education. The codebase is ready for that split without changing today's URLs.

### What exists now

- `src/config/divisions.ts`: a registry with `id`, `name`, `basePath`, `enabled` and the collections each division owns. Only `social` is enabled, at `/`.
- `BaseLayout` accepts `division` and writes `data-division` on `<html>`.
- `tokens.css` has placeholder theme blocks for `[data-division='talent']` and `[data-division='education']`. They only override accent roles, so every component works in every division.
- Every collection schema has a `division` field. Creators default to `talent`; everything else defaults to `social`.

### Launching Stride Talent (example)

1. Set `talent.enabled = true` and agree the URL scheme. `/talent/*` keeps one domain; a subdomain is also possible with a separate deploy of the same repo.
2. Add `src/pages/talent/index.astro` composed from existing sections, for example `MarqueeHero` + creator grid (from `creators`) + `Testimonials` + `FooterCta`, rendered with `<BaseLayout division="talent">`.
3. Move creator profiles to `/talent/creators/[slug]` if wanted, and add redirects from `/creators/*` in the host config to keep SEO.
4. Give the division its own nav. Extend `src/config/site.ts` with per-division `primaryNav`, or add `nav` to the division registry, and have `Navbar` read it from the `division` prop.
5. Fill in the real Talent palette in `tokens.css`.

Stride Education follows the same steps. Its natural seed content is the blog (guides) and careers (placement scheme).

### Suggested redesign path

- Keep `ui/` and `layout/` as the shared design system. Restyle through tokens first.
- Treat `sections/` as the page-builder palette, and add new sections there rather than inside pages.
- If a headless CMS is adopted later, swap the `glob()` loaders in `content.config.ts` for CMS loaders. Schemas and pages stay the same.

## Internationalisation

Webflow Localization served `/zh/*` with mostly translated copy and translated SEO tags. The rebuild keeps the hooks: `locales` in `site.ts`, `LocaleSwitcher`, and `hreflang` tags in `Seo.astro`. To migrate Chinese:

1. Add `zh` copy per page (a `src/i18n/zh.ts` dictionary for static pages, `*.zh.md` siblings for collections).
2. Generate `/zh/*` routes, either by moving pages under `src/pages/[lang]/` or by adding `src/pages/zh/` wrappers that pass `lang="zh"`.
3. Flip `migrated: true` on the `zh` locale so the switcher stops linking to the live site.

## Known differences from the live site (intentional)

- Creators index shows all 230 creators on one page. The live site loads 100 at a time (Jetboost / `?a335c3eb_page=N`).
- "More campaigns" on a case study excludes the current case study. The live site can list the page itself.
- Creator profiles below 992px use the intended stacked layout (photo, then details). On the live site the portrait covers the content and makes the page wider than the screen.
- Three creators without a photo (`image: null`) show a blank card. The live site hides the Webflow stock placeholder.
- Blog posts on phones: wide tables scroll inside their own box and long words wrap. The live page overflows to about 461px wide.
- Contact form:
  - The live form posts to Webflow's form backend, which does not exist here. Set `PUBLIC_CONTACT_FORM_ACTION` to a real endpoint. Without it, the last step opens the visitor's mail app addressed to team@stride-social.com with their answers filled in.
  - The two radio groups get distinct names; on the live site both are named `radio`, so a budget choice clears the interest choice.
- Creator sign-up keeps the live Typeform embed (form `eWgkHlmq`), loaded from embed.typeform.com.
- Job pages decode the Cloudflare-obfuscated careers email to a plain `mailto:` link.
- Team cards whose second photo is missing keep their photo on hover. The live card fades to blank.
- Analytics, ads tags, Jetboost and Tidio chat are not embedded.
- Heading levels are corrected where the live site uses many `<h1>`s for cards (the visuals are unchanged).
- Some heavy headings differ by a few pixels: the rebuild uses Inter / Mona Sans variable fonts from @fontsource, while the live site uses static font files.

## Copy and content issues kept as on the live site

Typos and odd copy are copied verbatim so the rebuild is a faithful baseline, for example "Cretaors", "prenseted", "opportunites", "braun" and "opertaion". Other issues kept:

- Some eyebrow labels are near-invisible: light text on light grey (About, Seeding, creator pages).
- Three strategy tabs have an empty "Case studies" heading.
- One blog post (`brand-influencer-collaboration-process-guide-en`) has a broken table that renders as a run-on paragraph.
- Creator SEO titles say "is managed by Stride Social" even for UGC partners.
- `blog/top-7-benefits-ugc-food-brands-2026-en` links to `/blog/anker`, which is a 404 on the live site too. It probably should be `/case-studies/anker`. This is the only broken internal link across all 312 built pages.

## SEO issues found on the live site (kept for parity, worth fixing)

- Home JSON-LD describes "Stride - A New Way to Connect" (a social platform), points at `/home/` URLs that don't exist, and declares a search action that doesn't exist. The data is in `src/data/home-jsonld.json`.
- Other JSON-LD (kept as `src/data/*-jsonld.json`):
  - the blog's list stops at the 5 oldest posts;
  - About uses `stridesocial.co` and a different Instagram handle;
  - the team list has 20 of 33 people;
  - the services `sameAs` points at an icon SVG;
  - several blocks use relative URLs.

  Case-study and creator JSON-LD is generated from the content, with these problems removed.
- No `og:image` on static pages.
- Typos in some meta descriptions, such as "Our Cretaors".
- Three sitemap URLs return 404: `/creators/foodiefunwithus`, `/creators/homewithcolin`, `/creators/iam-brittneyy`.
- Glam AI's "campaign content" videos are Instagram reel URLs inside `<video>` tags, so they render empty on the live site. They are omitted here.
