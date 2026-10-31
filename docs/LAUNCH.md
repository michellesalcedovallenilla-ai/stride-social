# Launch checklist

Gate 8 is the launch approval. The DNS switch from Webflow happens **only on Stride's explicit go-ahead**, with the Webflow site kept as a fallback (docs/phase-2/08-roadmap.md).

## 1. Ready now (verified in Stage 8)

| Area | State |
|---|---|
| Pages | Every page in the approved sitemap exists; no placeholder routes remain. 333 pages in a preview build; 101 in a production build today, because unconfirmed profiles and roles aren't built. |
| Redirects | All 579 URLs from the old sitemap resolve: 4 unchanged, 575 redirected, no chains (`npm run check:redirects`). The `_redirects` file is generated for Netlify / Cloudflare Pages, with fallback redirect pages for any other host. |
| SEO | Titles, descriptions, canonicals, Open Graph/Twitter cards (shared Stride image as fallback), one h1 per page, valid JSON-LD (Organization, WebSite, Article, CreativeWork, ProfilePage, JobPosting, Service, BreadcrumbList), and a sitemap of indexable pages only (`npm run check:seo`). Preview builds are noindex and robots-blocked. |
| Performance | Responsive WebP images. Largest Contentful Paint under 1.5s and layout shift under 0.05 on every main template, in a throttled phone test. |
| Accessibility | axe-core: no WCAG 2.2 A/AA violations on 25 templates at desktop and phone widths. Keyboard/focus checks pass. Reduced motion is respected throughout. |
| Browsers | Chrome 156 and Edge 156: all key pages, menus and forms pass on desktop and phone sizes. |
| Forms | Four forms (brand, talent, education, general) with validation, sending, success and failure states, honeypot and timing checks, plus server-side validation modules ready for the host. |
| Consent | Analytics are off by default. If GA4 is chosen, a consent banner gives equal-weight accept/reject, loads nothing before consent and uses Consent Mode v2. |

## 2. Needed from Stride before launch

These block a production release. `npm run check:content -- --strict` and `npm run check:placeholders -- --strict` both fail until they're done.

- **Q13, form destinations:** an inbox or CRM for each form. Then one test submission per form arrives (closes Gate 4's open item).
- **Q21, hosting:** Vercel, Netlify or Cloudflare Pages; who controls DNS.
- **Q15, legal text:** privacy policy, cookie policy and terms.
- **Q14, analytics:** none, Plausible (no banner) or GA4 (banner).
- **Q16 / Q17, URLs:** approve the URL moves (`/case-studies` → `/work`, `/blog` → `/insights`, `/creators` → `/talent/roster`); keep or retire `/zh` (currently a temporary redirect to English until the translation ships).
- **Consent and verification:** creator consent (roster, hero portraits, quotes); case-study results with sources; logo approvals; history milestones and the founding year (Q1); open roles.
- **Copy sign-off:** the draft sections listed by `npm run check:content`.
- **Media** (Q18): approved hero reel and photography; replace the interim clips and images.
- **Content still to supply:** mission and values, sponsorships, Education availability (Q11), division plans (Q24), FAQs.

## 3. Go-live steps (once section 2 is done)

1. **Host:** connect the GitHub repository (create it first; the remote was skipped in Stage 0) to the chosen host. Build command `npm run build`, output `dist/`.
2. **Environment:** set `PUBLIC_SITE_ENV=production`, the four form endpoints and the analytics variable on the host.
3. **Form functions:** wire the endpoints with the validation modules in `src/lib/forms/`, plus email or CRM delivery and Cloudflare Turnstile.
4. **Redirects on Vercel:** if the host is Vercel, generate `vercel.json` from `scripts/redirects/map.mjs` (Netlify and Cloudflare read the generated `_redirects`).
5. **Staging and UAT:** deploy a staging build and run user acceptance testing with Stride. Then test on real devices: iOS Safari, Android Chrome, desktop Safari and Firefox (only Chrome and Edge were automated here).
6. **Launch checks:** `npm run ci` green with `--strict` content and placeholder checks.
7. **Media:** re-encode the final hero reel (H.264 + WebM, ≤ 4MB) and case-study videos (≤ 1.5MB each, or a video host). There is no encoder on the build machine yet.
8. **Switch:** on Stride's go-ahead, point DNS at the new host, keeping the Webflow site available as a fallback.
9. **After launch:** submit the sitemap in Search Console, then check 404 logs and redirects for 4–6 weeks.

## 4. Editor training

[docs/EDITING.md](EDITING.md) covers the workflow, where content lives, the status fields and the writing rules. A short walkthrough with Stride's editors (Claude Code + pull requests) is part of UAT.
