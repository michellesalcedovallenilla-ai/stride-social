# 08 — Phased development roadmap

Phase 3 (Development) is split into stages that each end with a review gate. Pages that depend on missing client material are built against labelled placeholders, so development is not blocked. Production stays locked until the placeholders are replaced.

Relative effort is given as S / M / L, not calendar dates: speed depends mostly on how fast the client answers the [checklist](09-client-approval-checklist.md) and supplies assets.

## Stage 0 — Approvals and setup (before any build)

| Task | Effort | Output |
|---|---|---|
| Client reviews this Phase 2 package; answers the critical questions (Q1–Q3, Q5, Q11, Q13, Q16, Q21) | — | Signed-off plan |
| Create the GitHub repository; move or ignore `duplicade-stride`; decide media storage (Git LFS or a bucket); first commit; tag `phase-1-recreation` | S | Repository with branch protection, CODEOWNERS, PR template, `CLAUDE.md` content rules |
| Connect the host (Q21): preview deploys per PR, `noindex` on previews | S | Preview URLs |
| CI: build, type check, link check, placeholder scan | S | GitHub Actions workflow |
| Upgrade Astro to the current major (optional, see [07](07-technical-architecture.md) §1) | S | Clean baseline |

**Gate 0:** plan approved, repository and previews working.

## Stage 1 — Design system and creative proof

| Task | Effort | Output |
|---|---|---|
| Tokens: colours, division themes, type scale, spacing, grid | S | `tokens.css` v2 |
| Fonts: Archivo (width axis verified), Inter, Plex Mono, Instrument Serif; or the licensed alternative (Q19) | S | Self-hosted fonts |
| Core UI: Button, Link, Chip, Badge, Eyebrow, Media (image/video with pause control), Field set, PlaceholderNotice | M | Component library |
| Global: SiteHeader, MegaMenu, DivisionBar, MobileMenu, SiteFooter, Breadcrumbs | M | Navigation working across empty division shells |
| Motion: line reveals, hover media, section entrance, reduced-motion handling | S | Motion module v2 |
| **Style-guide page** (`/styleguide`, noindex): every token and component on one page | S | Review artefact |
| **Creative proof:** homepage hero + "Three Sides" built at full fidelity with interim media | M | Look-and-feel sign-off |

**Gate 1:** the client approves the design system and the creative proof (type, colour, motion, nav). This is the most important gate; everything after reuses these decisions.

## Stage 2 — Content model and migration

| Task | Effort | Output |
|---|---|---|
| New collection schemas and taxonomies ([06](06-content-architecture.md)) | M | `content.config.ts` v2 |
| Migration scripts: creators (with the approved category map), insights, team, testimonials, brands, jobs | M | Content in the new shape; consent/approval flags off by default |
| Editorial restructure of case studies into brief/strategy/execution/results (starting with Laifen, Govee, XGIMI; Samsung and Barsys when the material arrives) | M–L | Case study files |
| Seed taxonomies, divisions, services, education topics/experience with approved or draft copy | S | Content files |

**Gate 2:** the client reviews the content map: category mapping, which creators appear, which logos and testimonials are approved.

## Stage 3 — Group homepage

All 10 sections ([05](05-wireframes.md) §A). Hidden-until-populated logic applies to Beyond Business, and divisions show "coming soon" where needed. M–L.

**Gate 3:** homepage review at desktop, tablet and mobile.

## Stage 4 — Stride Social

| Task | Effort |
|---|---|
| `/social` landing (B1–B8) | L |
| 7 service pages (ServicePage template) | M |
| `/work` archive with industry/service filters + case study template | M |
| Brand enquiry form: front end + server function + email/CRM (Q13) + spam protection | M |

**Gate 4:** Social review, plus a test submission received by the client's inbox/CRM.

## Stage 5 — Stride Talent

| Task | Effort |
|---|---|
| `/talent` landing (C1–C7) | L |
| Roster directory with search and filters + creator profile template | M |
| Division pages (DivisionPage template) or filtered views (Q24) | S–M |
| Talent application form + backend | S |

**Gate 5:** Talent review, roster data accuracy confirmed by the talent team.

## Stage 6 — Stride Education

`/education` landing (D1–D6), with availability badges driven by data, and the enquiry/waitlist route per Q11. M.

**Gate 6:** Education review; the Available/Planned statements confirmed by the client.

## Stage 7 — Group pages

About, History, Team, Sponsorships, Insights (archive + article template restyle), Careers (+ job template), Contact hub (four routes + general form), Legal templates, 404. M–L.

**Gate 7:** content completeness review.

## Stage 8 — Hardening and launch readiness

| Task | Effort |
|---|---|
| Redirect map implemented and tested against the old sitemap (Q16, Q17) | S |
| SEO: metadata audit, OG images, structured data validation, sitemap | S |
| Analytics + consent manager (Q14), legal pages populated (Q15) | S |
| Media re-encoding and performance pass to budgets | M |
| Accessibility audit (automated + manual) and fixes | M |
| Cross-browser and device QA (iOS Safari, Android Chrome, desktop Chrome/Safari/Firefox/Edge) | M |
| Placeholder scan clean; all forms tested end to end | S |
| UAT on staging with the client; editor training (Claude Code + PR workflow) | S |

**Gate 8:** launch approval. A DNS switch from Webflow happens only on the client's explicit go-ahead, with Webflow kept as a fallback.

## Stage 9 — After launch (backlog)

- Monitor Search Console and 404 logs for missed redirects (first 4–6 weeks).
- Chinese locale (`/zh`) per Q17, and other languages.
- Git-based CMS UI (Keystatic / Decap) if editors want forms.
- Video testimonials, creator stories and education stories as content arrives.
- Industry landing pages (`/social/industries/[industry]`) if SEO data supports it.

## Dependencies at a glance

```
Gate 0 ──► Stage 1 (design system) ──► Gate 1 ──┬─► Stage 3 Home ─────┐
                                                 ├─► Stage 4 Social ───┤
Stage 2 (content) runs alongside Stage 1 ────────┼─► Stage 5 Talent ───┼─► Stage 7 Group pages ─► Stage 8 ─► Launch gate
                                                 └─► Stage 6 Education ┘
Client assets (photos, video, logos, results, legal) feed every stage; missing items stay as placeholders until supplied.
```

Stages 3–6 can run in parallel once Gate 1 is passed, because they share the design system but not page code.
