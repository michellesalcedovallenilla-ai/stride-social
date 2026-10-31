# Stage 8 — Hardening and launch readiness

Branch: `feature/stage-8-launch-readiness`. Review gate: **Gate 8**, launch approval (docs/phase-2/08-roadmap.md). The DNS switch happens only on Stride's explicit go-ahead. Everything that still blocks launch is in **[docs/LAUNCH.md](../LAUNCH.md)**.

**Gate 8 approved by the owner on 2026-10-31:** the build is approved as launch-ready. Going live still needs the Stride inputs in LAUNCH.md §2 (forms, host, legal text, analytics, URL approvals, consent and verification, copy sign-off, final media) and Stride's explicit go-ahead for the DNS switch. Nothing has been deployed.

## What was done

### Phase 1 retired, redirect map shipped

- **Removed:** the last Phase 1 pages (`/blog`, `/case-studies`, `/creators`, `/jobs`, `/meet-the-team`, `/our-services`, `/influencer-seeding`, `/influencer-strategies`, `/creator-sign-up`). Also `BaseLayout`, every legacy component folder, the legacy styles, scripts, data and the six legacy collections. Everything stays available at git tag `phase-1-recreation`.
- **Redirect map:** `scripts/redirects/map.mjs` maps every URL from the old sitemap (kept in `docs/inventory/old-sitemap.txt`, 579 URLs):
  - section moves: 301;
  - collection items: 301, one to one when the new page exists, otherwise to the archive (e.g. an unconfirmed creator → the roster);
  - `/zh/...`: 302 to the English page until the translation ships (Q17).
- **Build output:**
  - fallback redirect pages for any static host;
  - `dist/_redirects` (forced 301/302) for Netlify or Cloudflare Pages, with catch-alls for old URLs never in the sitemap.
- **Links inside content:** migrated articles and case studies now link straight to new URLs, so no internal link goes through a redirect.
- **New check:** `npm run check:redirects` (in CI) finds 579 old URLs: 4 unchanged, 575 redirected, 0 problems (no chains, `_redirects` agrees).

### SEO

- **Tags:** `global/Seo` (moved out of the legacy folder) outputs:
  - title, description (long legacy descriptions trimmed at a word), canonical;
  - Open Graph and Twitter cards with correct `name=` attributes and `og:type` (article, profile);
  - a shared 1200×630 Stride image when a page has none (`scripts/og/default-og.mjs`; interim like the header lockup).
- **Language links:** the old `zh` hreflang links to the Webflow site are gone (hreflang only for real translations).
- **Preview builds:** every page is noindex and `robots.txt` disallows crawling. The production `robots.txt` allows crawling and links the sitemap.
- **Sitemap:** leaves out noindex pages and redirect stubs.
- **Homepage structured data:** `Organization` and `WebSite` JSON-LD, with real facts only.
- **New check:** `npm run check:seo` (in CI) audits every page: title, description, absolute canonical, og:image, lang, exactly one h1, valid JSON-LD; in production builds it also checks the sitemap against indexable pages. It finds 0 errors. The warnings are 9 long article titles from the old site, for editors.

### Consent and analytics (off until Q14)

- **Default:** nothing loads unless `PUBLIC_GA4_ID` or `PUBLIC_PLAUSIBLE_DOMAIN` is set.
- **With GA4:**
  - a consent banner appears (equal-weight Reject / Accept analytics);
  - nothing loads before acceptance;
  - Consent Mode v2 defaults to denied;
  - the choice is remembered, and the footer's "Cookie settings" reopens it.
- **With Plausible:** it loads directly; it's cookieless, so no banner.
- **Tested** with a dummy GA4 id (8/8 checks): banner on first visit; nothing loaded before a choice; equal-size buttons; reject loads nothing and is remembered; Cookie settings reopens with focus; accept loads GA4 with consent default/update; returning visitors load it without the banner.

### Performance

- **Responsive images** (`integrations/responsive-images.mjs`):
  - after the build, every local `<img>` gets a WebP `srcset` (480–1800px, never wider than the original);
  - variants are generated into `dist/_img` only, so the repository keeps one original per image;
  - variants are cached in `node_modules/.cache` (CI caches them too);
  - components set `sizes` where an image renders narrower than the screen.
- **Filter bars** show from the first paint, which removed the layout shift on Our Work.
- **Breadcrumbs** stay on one line, which removed the shift caused by wrapping when the web font loads.

Measured on the built site:

| Page (phone, throttled) | Before | After |
|---|---|---|
| `/insights` desktop weight | 9.75 MB | 204 KB |
| `/talent` desktop weight | 2.8 MB | 341 KB |
| `/talent` phone LCP | 5.0 s | 0.74 s |
| `/work` phone LCP / CLS | 3.7 s / 0.149 | 0.87 s / 0.001 |
| Creator profile phone CLS | 0.194 | 0.001 |
| All main templates, phone | — | LCP ≤ 1.5 s, CLS ≤ 0.05 |

Still to do: the Social hero's three interim clips weigh about 8.6MB on desktop. They'll be replaced by the approved reel, which should be encoded to ≤ 4MB. Case-study videos need re-encoding or a video host. There's no encoder on this machine (LAUNCH.md §3).

### Accessibility

- **axe-core** (WCAG 2.0/2.1/2.2 A + AA) on 25 templates at 1440 and 390px. Fixed:
  - placeholder labels inheriting white on yellow;
  - the phone menu button losing its name when its label was hidden;
  - grey text on peach sections (now navy);
  - faded eyebrow numbers.
- **Result: no violations.** Keyboard and focus checks still pass 12/12.

### Cross-browser

- **Chrome 156 and Edge 156:** 10 key pages at desktop and phone sizes (status, no console errors, no overflow, motion running, one h1), plus the mega menu or mobile menu and form validation. All pass.
- **Firefox and Safari engines aren't installed here:** real-device testing on iOS Safari, Android Chrome and desktop Safari/Firefox is part of UAT (LAUNCH.md §3).

### Regression

All earlier behaviour suites pass on the built site: Stage 4 (36), Stage 5 (34), Stage 6 (12) and Stage 7 (24). The overflow check is clean on 24 pages at 7 widths.

### Documentation

- `README.md`: rewritten for the current codebase.
- `docs/EDITING.md`: editor guide covering the workflow, where content lives, status fields, writing rules, images, and adding common items.
- `docs/LAUNCH.md`: what's verified, what Stride must supply, and the go-live steps.
- `scripts/migrate/README.md`: the migration scripts are historical.
- `CLAUDE.md`: updated for the post-Phase-1 codebase.

## Checks run

| Check | Result |
|---|---|
| `npm run ci` | Type check, build, links, redirects, SEO, placeholders (report) and content (report) all pass |
| Redirects | 579/579 old URLs resolve |
| SEO | 0 errors (preview: 333 pages; production: 101 pages, 90 in the sitemap) |
| axe | 0 WCAG A/AA violations on 25 templates × 2 widths |
| Behaviour | 106 checks across Stages 4–7, plus 8 consent checks |
| Browsers | Chrome and Edge: all checks pass |

## Open items (Gate 8)

See [docs/LAUNCH.md](../LAUNCH.md) §2. In short:
- form destinations and hosting (Q13, Q21);
- legal text (Q15) and the analytics choice (Q14);
- URL approvals (Q16, Q17);
- consent, verification and copy sign-off;
- final media and video encoding;
- UAT with real-device testing.
