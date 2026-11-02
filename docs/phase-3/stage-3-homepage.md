# Stage 3 — Group homepage

**Superseded on 2026-11-02:** the homepage was rebuilt; see `homepage-magazine.md`. This gate record is historical.

Branch: `feature/stage-3-homepage`. Review gate: **Gate 3**, homepage review at desktop, tablet and mobile (docs/phase-2/08-roadmap.md).

**Gate 3 approved by the owner on 2026-10-31.** The open items below stay open for Stride; the homepage ships with labelled placeholders until they are answered.

## What was built

All ten sections from the client brief (PDF §3), composed per `docs/phase-2/05-wireframes.md` §A. Copy lives in `src/content/pages/home.yaml`, and each section's data comes from the Phase 3 collections.

| # | Section | Composition | Data | State |
|---|---|---|---|---|
| A1 | Built around creators | Full-screen montage, headline bottom-left, routes bottom-right | Copy file (brief verbatim) | Interim footage (labelled) |
| A2 | Three sides of Stride | Three full-height panels; hovered panel widens | Copy file (brief verbatim) | Interim images (labelled) |
| A3 | One group. Built for what's next. | Split screen: photo bleeds left, story right | Copy file | **Draft copy** (founding year 2022 per brief, Q1); interim image |
| A4 | Our divisions | Typographic index, outlined names for coming-soon divisions | `talentDivisions` | All five are coming soon, so no links (no dead buttons). **Draft** intro line. |
| A5 | Our work | Asymmetric mosaic, mixed tile sizes | `work` with `featuredOn: home` | Laifen, Govee, XGIMI live. Samsung and Barsys appear as labelled "awaiting case study" tiles in preview only (Q6). Tiles show services, because no result figure is verified yet. |
| A6 | The people behind Stride | Editorial mosaic, staggered columns, portraits crossfade on hover | `team` | Real portraits. Candid team photo is interim (labelled). |
| A7 | Beyond business | Photo story + rail of sponsorships | `sponsorships` (empty) | Preview shows a labelled placeholder; **not rendered in production** until a confirmed entry exists (Q12). **Draft** copy. |
| A8 | Insights | One large article and two stacked | `insights` (latest three) | Live |
| A9 | Global presence | Typographic market list on navy | `markets` (verified only) | Talent markets: UK, US, Canada, Germany, France. Team/operating markets show a labelled placeholder in preview and are hidden in production (Q3). No offices implied. |
| A10 | Let's make something happen. | Ice section, three large routes | Copy file (brief verbatim) | Live |

## Also added

- **Page copy files** (`src/content/pages/*.yaml`): editors change words without touching layout. Each section is `approved` (from the brief or signed off) or `draft`. Draft sections show a "Draft copy" label in preview, and `check:content` lists them.
- **`PUBLIC_SITE_ENV`:** `production` hides sections still waiting for content. Anything else, including local dev and preview deploys, shows them with labels.
- **Sponsorships collection:** schema ready, folder empty.
- **Planned-page placeholders** now link to the current Phase 1 version where one exists: Our Team, Insights, Our Work, Creator roster, Apply, Services.
- **Small-phone typography:** display headings scale with the viewport below 480px, so the longest words fit down to 320px wide.

## Checks run

| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| Build | 341 pages; 13,281 internal references, 0 broken |
| Horizontal overflow | None at 320, 360, 390, 430, 768, 1024 and 1440px. No clipped headings at any of those widths. |
| Keyboard, focus, reduced motion | 12/12 automated checks pass; one `h1`; no console errors |
| Production build | Awaiting-content sections removed. Interim media and draft copy still present, so the strict placeholder check correctly blocks a production release. |
| Content report | References resolve. Draft page sections: `home.group`, `home.divisions`, `home.beyond`. |

## Open items for Stride (Gate 3)

- Approve or edit the draft copy: "One group" story (and the **founding year**, Q1), the divisions intro line, the "Beyond business" line.
- Samsung and Barsys case material (Q6), and verified result figures for the featured campaigns.
- Hero montage footage, a signed-creator portrait and education imagery for Three Sides; natural team photography; a documentary group photo for "One group" (Q18).
- Sponsorship entries (Q12) and verified team locations (Q3).
- Talent division launch scope and creator assignments (Q24), so division rows can link.
