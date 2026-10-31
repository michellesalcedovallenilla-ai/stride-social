# Phase 2 — Stride website architecture and creative direction

**Status: plan approved by the project owner on 2026-10-31.** Client confirmations are still tracked in the [approval checklist](09-client-approval-checklist.md). Next: Phase 3 (Development), starting with roadmap Stage 0.

**Planning only.** No website code was changed in this phase. Source requirements: the client's "Stride Social Site" PDF, which covers sections 3–10; sections 1–2 are missing and section 10 is cut off.

| # | Document | What it answers |
|---|---|---|
| 01 | [Existing site audit](01-existing-site-audit.md) | What Phase 1 built, which content and assets exist, what is reusable, and where the current site contradicts the brief |
| 02 | [Requirements analysis and missing information](02-requirements-analysis.md) | Every PDF requirement mapped to reuse / adapt / build / blocked, plus 24 open questions |
| 03 | [Sitemap, navigation, URLs and journeys](03-sitemap.md) | Full sitemap, mega-menu and division sub-bar, URL rules, templates, redirects from current URLs, user journeys |
| 04 | [Design system and creative direction](04-design-system.md) | Creative principles, how the three divisions differ, colour (contrast-checked), type, grid, components, imagery, motion, accessibility, copy rules |
| 05 | [Section-by-section wireframes](05-wireframes.md) | The homepage's 10 sections, plus Stride Social, Stride Talent and Stride Education in full; outlines for all other pages |
| 06 | [Content architecture](06-content-architecture.md) | Collections and schemas for creators, divisions, case studies, services, team, sponsorships, insights; Claude Code + GitHub editorial workflow; multilingual readiness |
| 07 | [Technical architecture](07-technical-architecture.md) | Stack, media pipeline, performance budgets, SEO and redirects, forms, consent, accessibility engineering, CI gates, launch process |
| 08 | [Phased development roadmap](08-roadmap.md) | Stages 0–9 with review gates and dependencies |
| 09 | [Client approval checklist](09-client-approval-checklist.md) | Everything the client must confirm, supply or approve, with critical items marked |

## Headline decisions proposed

1. **One site, one domain, three divisions as sections:** `/social`, `/talent`, `/education`. The parent logo and navigation stay constant, and a division sub-bar shows where you are.
2. **Four distinct landing compositions:** the group home is an anthology, Social a campaign reel, Talent a portrait magazine, Education a prospectus. They share one design system that changes only one accent, one surface and one photographic mood per division.
3. **The existing identity is evolved, not replaced:** navy and ice stay. Inter and IBM Plex Mono stay. Archivo (wide, heavy) and Instrument Serif italic are added for an editorial, cinematic voice.
4. **Content stays in Git with typed schemas,** reviewed through pull requests with preview links. Verification and consent flags make "no invented content" a build rule.
5. **Current URLs are preserved or 301-redirected one-to-one,** including all case studies, creators and blog posts.

## Biggest blockers

1. The founding year conflict (2020 / 2021 / 2022).
2. The "600+ creators" claim versus 230 public profiles.
3. Approved logos and the Samsung / Barsys case material.
4. Real photography and video, especially for Education.
5. What Stride Education offers today.
6. Form destinations.
7. Legal text.
8. The missing PDF sections.

The full list is in [09](09-client-approval-checklist.md).
