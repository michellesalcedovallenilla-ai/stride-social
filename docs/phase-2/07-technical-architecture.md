# 07 — Technical architecture

## 1. Stack decision

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Astro** (continue from Phase 1) | Static-first HTML is ideal for a content-heavy marketing site and fast loading. Content collections already hold the data. Islands allow small interactive pieces (roster filters, forms) without a SPA. |
| Version | **Upgrade to the current Astro major (7.x) at the start of Phase 3**, before new code is written | Phase 1 deliberately used the mature 5.18 line. Upgrading on a near-empty slate is cheapest; staying on 5.x is also viable (decision for the maintainer). |
| Rendering | Static pages by default. On-demand server functions **only** for form handling (and preview/drafts if needed) via the host's adapter | Keeps hosting cheap and fast while giving forms a real backend. |
| Styling | Plain CSS with design tokens + component-scoped styles (as now). No CSS framework | The token layer from Phase 1 is the foundation of the division theming. |
| Interactivity | Vanilla TypeScript modules; one small island for roster search/filter | Preserves the ~zero-JS baseline. |
| Motion | Existing modules (reveal, split-lines, scroll-motion, marquee) + Lenis + optional View Transitions | Already built and accessible. |
| Content | Git-based content collections ([06](06-content-architecture.md)) | No CMS licence; review via pull requests. |
| Repository | GitHub (to be created: the project folder is not yet a git repository) | Required for the editorial workflow. |
| Hosting | **Vercel, Netlify or Cloudflare Pages** (Q21): any of them gives PR preview URLs, redirects, edge caching, image CDN options and serverless functions | Decide with the client based on account ownership and cost. |

## 2. Project structure (Phase 3 target)

```
src/
  config/        site.ts (brand, nav per division), divisions.ts, redirects.ts
  i18n/          en.ts (UI strings), zh.ts later
  content/       collections (06)
  assets/media/  source images (optimised at build)
  styles/        tokens.css, base.css, typography.css, utilities.css
  layouts/       BaseLayout (division context), ArticleLayout, FormLayout
  components/
    global/      SiteHeader, MegaMenu, DivisionBar, MobileMenu, SiteFooter, Breadcrumbs, Seo
    ui/          Button, Link, Eyebrow, Media, Badge, Chip, Field*, PlaceholderNotice
    sections/    shared editorial sections (SplitEditorial, TypographicIndex, Mosaic, Rail, QuoteSpread…)
    group/ social/ talent/ education/   page-specific compositions for the four landings
  pages/         routes per 03-sitemap
  scripts/       motion + behaviour modules
  lib/           data helpers (queries, filters, JSON-LD builders)
public/          favicons, robots.txt, static files only (media moves to src/assets or a media CDN)
docs/            phase docs
tests/           Playwright smoke, accessibility and visual tests
```

The Phase 1 page components remain in Git history (tag `phase-1-recreation`) and in the `duplicade-stride` backup. That backup lives inside the repository folder: **move it out, or add it to `.gitignore`, before the first commit** so 440 MB of duplicate media is not committed.

## 3. Routing and navigation

- Routes as in [03-sitemap](03-sitemap.md); collection routes via `getStaticPaths`.
- `BaseLayout` takes `division: 'group' | 'social' | 'talent' | 'education'`. It sets `data-division` (theme), the active nav item, the division sub-bar and breadcrumbs.
- Navigation data lives in `config/site.ts` (one source for header, mobile menu, footer and sitemap ordering).
- Filters (roster, work, insights) are client-side over a prebuilt JSON index. 600 creators is about 60–120 KB uncompressed and renders instantly. Filter state is mirrored in the query string; the server-rendered default shows all items, so the page works without JavaScript.

## 4. Media pipeline and performance

| Item | Approach |
|---|---|
| Images | Move from `public/assets` into `src/assets/media` so Astro's `<Picture>` generates AVIF/WebP at 640/960/1440/2048 with `srcset` and `sizes`. Hero images get `fetchpriority="high"`, everything else lazy-loads. |
| Large libraries | If the image set grows beyond what is comfortable in Git (it is 440 MB already, mostly video), store originals in a media bucket (Cloudflare R2, S3 or Cloudinary) referenced by URL, or use **Git LFS**. Decide before the first commit. |
| Video | Re-encode every clip (H.264 MP4 + VP9/AV1 WebM, 720p/1080p, target ≤ 4 MB hero / ≤ 1.5 MB tile), always with a poster. Long or many videos → a video host (Mux / Cloudflare Stream / Bunny) with adaptive streaming. The current 18 case-study clips (up to 32 MB each) must be re-encoded. |
| Fonts | Self-hosted variable fonts, subset to Latin, `font-display: swap`, preload the display face. |
| JavaScript | Target < 40 KB gzipped per page (Lenis ≈ 4 KB, motion modules ≈ 6 KB, roster island ≈ 10 KB). No jQuery or GSAP. |
| Budgets (field, 75th percentile) | LCP < 2.5s · INP < 200ms · CLS < 0.1 on 4G mid-range mobile. Lighthouse ≥ 90 performance and ≥ 95 accessibility/SEO on every template. |
| Caching | Hashed static assets with immutable cache; HTML with short cache and revalidation; media on CDN. |

## 5. SEO

| Concern | Plan |
|---|---|
| URL preservation | Unchanged URLs where possible; otherwise 301 redirects for every current URL (map in [03](03-sitemap.md) §5), kept in `config/redirects.ts` and emitted in the host's format (`_redirects` / `vercel.json`). CI verifies every URL in the old sitemap resolves (200 or 301 → 200). |
| Metadata | Per-page title (≤ 60 chars) and description (≤ 155) from content/page files; OG/Twitter image per page, auto-generated from the hero image if none is set (fixes "no OG images" on the current site); canonical on every page; `noindex` on preview deploys, form success pages and filtered archive views. |
| Structured data | `Organization` (correct name, logo, sameAs, no fake addresses) + `WebSite` on home (replacing the incorrect current JSON-LD); `BreadcrumbList` everywhere; `Article` for insights; `ProfilePage`/`Person` for creators; `CreativeWork` for case studies; `JobPosting` for jobs (salary/location fields only if real). |
| Sitemaps | `@astrojs/sitemap` with lastmod; excludes hidden entries and placeholders. Submitted in Search Console (client access needed). |
| Headings | One `h1` per page; cards use `h2`/`h3` (fixes multiple `h1`s on the live site). |
| Internationalisation | `hreflang` only for pages that actually have translations. |
| Monitoring | Search Console, plus a post-launch 404 log review to catch missed redirects. |

## 6. Forms

| Form | Fields (see [05](05-wireframes.md)) | Destination |
|---|---|---|
| Brand enquiry (`/social/enquire`, inline on `/social`, prefilled from services or creator profiles) | name, company, email, market, service, budget?, brief, creator? | Q13: shared inbox and/or CRM (e.g. HubSpot) |
| Talent application (`/talent/apply`) | name, email, country, platforms, links, category, intro | Q13: talent team inbox/CRM. This replaces the current Typeform unless the client prefers to keep it. |
| Education enquiry / waitlist | per Q11 | Q13 |
| General contact | name, email, topic, message | Q13 |
| Careers | per job: email or form | Q13 |

Implementation:

- **Native HTML forms** posting to a server function on the host (or a form service such as Formspree or Basin, if the client wants no server code). The function validates input with the same schema as the client (zod), sends an email notification via a transactional service (e.g. Resend or Postmark) and optionally pushes to the CRM.
- **Validation:** client-side for usability, server-side for truth; accessible error messages; preserved input on error.
- **Spam:** a honeypot field, a time-to-submit check, and an invisible challenge (Cloudflare Turnstile), which is privacy-friendlier than reCAPTCHA.
- **Success states:** in-page confirmation with next steps; analytics event (if consented).
- **Privacy:** consent notice linking to the privacy policy; minimal data retention; no form data in URLs; the function logs no personal data.
- **No dead ends:** if a destination is not configured, the build flags it and the form shows a clear "temporarily unavailable — email us at …" state rather than silently failing.

## 7. Analytics, consent and privacy

- If GA4, GTM or Ads tags are kept (Q14), load them **only after consent** through a lightweight consent manager (e.g. Cookiebot, Klaro or a custom banner with Google Consent Mode v2). UK/EU visitors require opt-in for non-essential cookies.
- A cookieless analytics alternative (Plausible, Fathom, Cloudflare Web Analytics) avoids the banner for analytics alone. This is the client's decision.
- The Tidio chat (current site) is excluded unless requested; it adds weight and its own cookies.
- The legal pages (privacy, cookies, terms) need **client-supplied text** (Q15). The site provides the templates and the "Cookie settings" footer link.

## 8. Accessibility engineering

- Automated: axe-core checks in Playwright on every template in CI (zero serious/critical violations to merge).
- Manual per release: keyboard-only pass, screen reader smoke test (NVDA + VoiceOver) on the nav, forms and roster filters, 200% zoom, 320px width, reduced motion.
- Components ship with the accessibility behaviours from [04](04-design-system.md) §9: video pause controls, focus management in menus, labelled forms.

## 9. Quality gates (GitHub Actions)

| Check | When | Blocks merge |
|---|---|---|
| `astro check` (types) + build (schemas, references) | Every PR | Yes |
| Placeholder scan: no `PLACEHOLDER` on published pages | Every PR (warn), `main` (fail) | Yes on `main` |
| Link checker (internal links, assets) | Every PR | Yes |
| Redirect test (old sitemap URLs) | Every PR touching routes/redirects | Yes |
| Playwright smoke (key routes render, nav works, forms validate in test mode) | Every PR | Yes |
| axe accessibility scan | Every PR | Serious/critical issues block merging |
| Lighthouse CI (budgets) | Every PR on preview URL | Warn |
| Visual snapshots (key templates, desktop + mobile) | Every PR | Review required on diff |

## 10. Environments and release

| Environment | Source | Purpose |
|---|---|---|
| Local | Claude Code / developer machine | Build and preview |
| Preview | Every PR (host preview URL, `noindex`, password optional) | Review content and design |
| Staging (optional) | `staging` branch | Client UAT before launch |
| Production | `main` | Live site at stride-social.com, **only after the client approves the switch** |

**The live Webflow site is not touched in Phase 2 or 3.** Launch is a separate, client-approved step:

1. Final content and redirects sign-off.
2. DNS points to the new host.
3. Search Console verification and sitemap submission.
4. Webflow kept as a cold fallback for an agreed period.

## 11. Security and maintenance

- No secrets in the repository; environment variables per environment.
- Dependabot/Renovate for dependency updates, with CI gating.
- HTTP security headers (CSP allowing only the required third parties, HSTS, Referrer-Policy) set at the host.
- Form function rate limiting.
- Documented runbook in `docs/` for adding content, adding a division, adding a locale, and rotating keys.
