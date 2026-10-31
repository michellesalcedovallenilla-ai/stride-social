# Stage 7 — Group pages

Branch: `feature/stage-7-group-pages`. Review gate: **Gate 7**, a content completeness review (docs/phase-2/08-roadmap.md).

## What was built

Every page in the approved sitemap now exists. `plannedPages` is empty, so no link in the header, footer or division bars leads to a placeholder page. Copy lives in `src/content/pages/{about,history,team,sponsorships,insights,careers,contact,system}.yaml`.

| Page | Composition | Data | State |
|---|---|---|---|
| `/about` (replaces Phase 1) | Statement intro · the three sides, one paragraph each with links (division-coloured rules) · mission and values · markets · founders' story · links to History, Team and Careers | `about.yaml`; sides from `home.yaml`; `markets` | **Mission and values** must be Stride's own: a labelled request in preview, nothing in production (brief §7, §9). The **founders' story** is the old site's text (**draft**: the "over 6 million" figure needs verifying; portraits need approval). |
| `/history` | Editorial timeline: outlined year (pinned while its entry scrolls), uppercase headline, text, photo slot | `milestones` (new collection, from the old site's timeline) | All 6 milestones are **legacy**: labelled "to verify" in preview, omitted in production (which shows a short note instead). The brief says the company was founded in 2022, but the old timeline starts in 2018 and names 2020 (Q1). It also contains claims to verify (an award, follower counts, a Bali office, 35+ staff). |
| `/team` | Leadership row (larger) · department chips (URL-synced) · grid of 31 with hover photo swap · careers CTA | `team` | Departments were derived from job titles and are proposed (Gate 2). No bios yet (optional). |
| `/sponsorships` | Type chips · archive of image, partner, year, summary | `sponsorships` (confirmed only) | Empty (Q12). Preview explains what each entry needs; production shows a short honest note. The page is noindex while empty. |
| `/insights` | Latest article large · category chips (URL-synced) · grid of the rest with "Load more" (12 at a time) | `insights` (42) | The category mapping is proposed; there are no Education articles yet. |
| `/insights/[slug]` (42) | Category and date · title · standfirst · author · wide cover · sticky share links (LinkedIn, X, email) · body · aside image · related articles. Structured data: `Article`. | `insights` | Migrated HTML is renumbered so headings never skip a level (all 42 checked); wide tables scroll inside the article. Asides that were the old CMS placeholder graphic are dropped. |
| `/careers` (replaces Phase 1) | Culture intro · open roles · placement-scheme highlight (ice band) · how to apply (careers inbox) | `roles` (new collection, from the old job posts) | **Culture copy and photos** are needed: preview only. Both roles are **legacy** (confirm they're still open): labelled in preview, and in production the page says there are no open roles and builds no job pages. |
| `/careers/[slug]` | Title, location, salary · description · sticky "how to apply" (email with the role in the subject). Structured data: `JobPosting`, real fields only. | `roles` | The old postings mention a Bali office, to confirm. |
| `/contact` (replaces Phase 1) | Four large route panels in division colours (brands → `/social/enquire`, established creators → `/talent/apply`, emerging creators → `/education/enquire`, general → form below) · email, careers inbox, phone, socials · general form | `contact.yaml` | Panel lines and form copy are **draft**. The general form (name, email, topic, message) posts to `PUBLIC_CONTACT_FORM_ACTION` (Q13). |
| `/privacy`, `/cookies`, `/terms` | A plain document with a table of contents built from the text's headings | `legal` (new collection) | The text must come from Stride (Q15). Until then each page says so, is noindex, and blocks a production release. |
| `/404` (replaces Phase 1) | Outlined "404" sized to the screen · message · routes to the three divisions and home, inside the normal header and footer | `system.yaml` | Fixes the old page's sideways scroll at 1024px. |

### Also changed

- **Shared components:**
  - `core/Prose` styles long-form text: headings, lists, quotes, images, scrolling tables.
  - `scripts/system/archive-filter.ts` replaces the work-only filter. One URL-synced chip filter with "Load more" now serves Our Work, Insights, Team and Sponsorships.
  - `PageIntro` and `MarketsDisplay` titles are capped to fit their longest word, so long titles like "Our sponsorships." and "International presence." never get cut off.
- **Routes:** `routes.article` now points to `/insights/[slug]`, which covers the homepage trio and the header's latest article.
- **Phase 1 cleanup:** 13 components and data files that nothing uses any more are removed, as is the unused `legacyServices` collection. Its source JSON stays because the Stage 2 migration script reads it. The Phase 1 pages still standing (`/blog`, `/case-studies`, `/creators`, `/meet-the-team`, `/jobs`, `/our-services`, `/influencer-*`, `/creator-sign-up`) go when the Stage 8 redirect map ships.

## Checks run

| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| Build | 640 pages; 49,269 internal references, 0 broken |
| Horizontal overflow and clipped headings | None at 320, 360, 390, 430, 768, 1024 and 1440px on all group pages (an article, a job page and the 404 included), plus `/`, `/work`, `/talent`, `/education`, `/social/services` and `/talent/roster` |
| Article outlines | All 42 built articles: one `h1`, no heading skips |
| Behaviour (24 checks) | All pass: the team leadership row and department filter; the Insights lead, page size, load more, category filter, URL category, article JSON-LD and share links, tables not widening the page; the four contact routes, general-form validation and the unavailable panel; labelled careers roles, placement highlight and apply mailto; noindex on the empty legal and sponsorship pages; a real 404 status with four routes; history milestones labelled; no console errors |
| Accessibility structure | Pass on all 11 group page types |
| Production build | 408 pages: no job pages, milestones, culture or mission placeholders. Draft copy and the legal-text notices remain, so the strict placeholder check correctly blocks release. |

## Open items for Stride (Gate 7: content completeness)

- **About:** the group mission statement and 3–5 values; founder portraits and titles; verify the founders' story figure.
- **History** (Q1): reconcile the founding year (2022 per the brief); confirm or edit each milestone and its claims; supply a photo per milestone.
- **Team:** confirm departments; bios (optional); confirm everyone listed is current.
- **Sponsorships** (Q12): the entries.
- **Insights:** confirm the category mapping; Education articles.
- **Careers:** culture copy and team photos; confirm whether both roles are still open, and their details.
- **Contact:** confirm the phone number, emails and socials to show; form destination (Q13).
- **Legal** (Q15): privacy policy, cookie policy and terms.
- **Copy sign-off:** the 26 draft sections, listed by `npm run check:content`.
