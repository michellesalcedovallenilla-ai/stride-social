# 06 — Content architecture

Content stays in **structured files in the Git repository**, validated by typed schemas (Astro content collections, already used in Phase 1). No traditional CMS is needed for launch. Section 5 covers the editorial workflow, and when a Git-based editing UI would become worthwhile.

## 1. Principles

1. **One fact, one place.** A creator's data lives in their file; case studies reference creators by slug, not by copying names.
2. **Schemas enforce the brief.** Required fields cover what each page needs (portrait, alt text, country…). Verification flags make "no invented results" a build rule rather than a promise.
3. **Taxonomies are files.** Categories, industries, services, markets and divisions are each a small collection, so adding a new division is adding one file.
4. **Every fact can be traced.** Figures carry a `source` and `verified` flag. Testimonials and profiles carry a `consent` field.
5. **Locale-ready.** Every entry has a `locale` (default `en`); translations are sibling files (§6).

## 2. Folder layout

```
src/content/
  taxonomies/
    categories.yaml         # creator content categories (Sport, Beauty, Fashion, Lifestyle, Travel, Music, Podcasts, Speakers, Technology, Other)
    industries.yaml         # Technology, Lifestyle, Beauty, Fashion, Sport, Travel, Home, Trades & Construction
    markets.yaml            # countries with role: talent-market | team-location | operating-market, verified flag
  services/                 # 7 Markdown files (Stride Social services)
  talent-divisions/         # sport.md, travel.md, podcasts.md, music.md, speakers.md (+ future)
  creators/                 # one Markdown file per creator (230 today)
  case-studies/             # one Markdown file per campaign (25 today)
  insights/                 # articles (42 migrated from blog/)
  team/                     # one YAML file per person (33 today)
  sponsorships/             # one Markdown file per sponsorship
  testimonials/             # one YAML file per quote (brand or creator)
  brands/                   # brand partners: name, logo, approved-for-display
  education-topics/         # the 7 learning topics with status
  education-experience/     # the 6 experience items with status
  jobs/                     # careers
  pages/                    # editable copy blocks for landing pages (headlines, intros) as YAML
src/assets/media/           # images processed by Astro's image pipeline (see 07 §4)
```

## 3. Schemas (key fields)

Field types are shown informally. `→ x` means "reference to collection x". Fields marked \* are required.

### Creators: roster and profiles

```yaml
name*: "Alchemistlyy"
slug*: alchemistlyy                 # URL /talent/roster/alchemistlyy (kept from current site)
portrait*: { src: ./alchemistlyy.jpg, alt: "…" }   # alt required
mainCategory*: → categories          # e.g. lifestyle
categories: [→ categories]           # secondary, for filtering
divisions: [→ talent-divisions]      # sport, music… (empty allowed)
country*: GB                          # ISO code → markets
platforms:                            # any subset
  tiktok: https://…
  instagram: https://…
  youtube: https://…
  twitch: / podcast: / x: / website:
relationship*: managed | partner     # Q9 decides which appear publicly
bio*: Markdown body
selectedWork: [→ case-studies]        # and/or freeform collaborations:
collaborations: [{ brand: → brands, title, year, link? }]
audience: { figure: "59K", platform: tiktok, asOf: 2026-10, source: "…", verified: true }   # optional; hidden unless verified
featured: false                       # show in the landing roster preview
order: 10
visible*: true                        # unpublish without deleting
consent*: { publicProfile: true, confirmedBy: "name", date: 2026-11-01 }
locale: en
```

The migration maps today's 14 free-text categories to the new taxonomy ("Tech reviews" → Technology, "Amazon finds" → Lifestyle/Home, …). The mapping table is approved by the client before it runs. Countries come from the client (Q10).

### Talent divisions

```yaml
name*: "Stride Sport"
slug*: sport
status*: active | coming-soon         # coming-soon renders without links
tagline*: "…"
hero*: { src, alt }
intro: Markdown
rosterFilter: { divisions: [sport] }  # how the division page builds its grid
order: 1
```

### Case studies

```yaml
title*: "Govee"
client*: → brands
slug*: govee                          # kept; URL /work/govee
summary*: "One sentence."
services*: [→ services]
industries*: [→ industries]
markets: [→ markets]
year: 2024
hero*: { src, alt } | { video, poster, alt }
brief*: Markdown
strategy*: Markdown
execution*: Markdown
gallery: [{ src, alt, caption? }]
videos: [{ src, poster, caption }]
results:                              # rendered only when verified
  - { label: "Campaign views", value: "1.1M+", source: "TikTok analytics export, 2024-06", verified: true }
creators: [→ creators]                # "creators involved"
testimonial: → testimonials
featuredOn: [home, social]            # placement flags; order via featuredOrder
featuredOrder: 1
visible*: true
locale: en
```

Existing case studies are migrated into this shape. Their current body text is split into brief, strategy and execution by an editor, not by automation, and figures stay `verified: false` until the client confirms them (Q6, Q7).

### Services (Stride Social)

```yaml
name*: "UGC Production"
slug*: ugc-production
number*: 3
descriptor*: "Creator-produced content for organic and paid advertising."   # from the PDF
hero*: { src, alt } | { video, poster }
intro*: Markdown
deliverables: ["…"]
faqs: [{ q, a }]
relatedWork: auto                     # case studies tagged with this service
seo: { title, description }
```

### Team

```yaml
name*: "Alex Hendy"
role*: "Co-founder"
department: leadership | talent | campaigns | sales | operations
photo*: { src, alt }
photoAlt: { src, alt }                # optional second photo (hover)
bio: "…"                              # optional
linkedin: https://…                   # optional
order: 1
visible*: true
```

### Sponsorships

```yaml
title*: "…"
partner*: "…"                         # creator, team, event or organisation
type*: creator | sports-team | event | community
year*: 2025
location: "…"
images*: [{ src, alt }]
summary*: "…"
link: https://…
featured: true                        # appears on the homepage section
```

### Insights (blog)

```yaml
title*: "…"
slug*: …                              # kept from current /blog URLs
category*: company-news | creator-economy | marketing-insights | education
date*: 2026-02-24
author*: → team
standfirst*: "…"
cover*: { src, alt }
featured: false
tags: [education-story, …]
seo: { title, description, ogImage }
```

### Testimonials, brands, education

```yaml
# testimonials/
quote*, name*, role*, type*: brand|creator|student, image, video, division*: social|talent|education,
consent*: { approved: true, date, by }, featured: false

# brands/
name*, logo*: ./logo.svg, logoOnDark: ./logo-white.svg, approvedForDisplay*: false, website

# education-topics/ and education-experience/
title*, summary*, status*: available | planned, order, detail: Markdown
```

### Page copy blocks (`pages/*.yaml`)

The four landing pages keep their editable copy (headlines, intros, CTA labels) in small YAML files, e.g. `pages/home.yaml` → `hero.headline: "BUILT AROUND CREATORS."`. Editors can change words without touching layout code. Each field carries a `status: draft | approved` marker, so unapproved copy is visible in preview.

## 4. Build-time rules

These run as part of `astro build` and in CI:

| Rule | Effect |
|---|---|
| Schema validation | Build fails on missing required fields or broken references (e.g. a case study pointing at a creator that doesn't exist). |
| `verified: false` results | Never rendered. |
| `visible: false` entries | Excluded everywhere: pages, roster, sitemap. |
| `consent.publicProfile !== true` | Creator excluded from the public roster. |
| `approvedForDisplay: false` | Brand logo not shown in the logo strip. |
| Placeholders | `PLACEHOLDER` markers render a labelled notice in preview builds; **production builds fail** if any remain on a published page. |
| Draft copy | `status: draft` copy shows a small "Draft" badge in preview builds only. |
| Image alt text | Required in every media field. |

## 5. Editorial workflow (Claude Code + GitHub)

### Roles

| Role | Can do |
|---|---|
| **Editor** (authorised team member) | Asks Claude Code to add or update content; reviews the preview; requests changes. |
| **Reviewer / approver** (e.g. marketing lead) | Approves pull requests that touch content. Required for anything public-facing. |
| **Maintainer** (developer) | Approves changes to code, schemas, layouts and dependencies. |

### Flow

1. **Request.** The editor opens Claude Code in the repository and asks in plain language: *"Add creator Jane Doe: Beauty, UK, Instagram and TikTok links, bio below, portrait in Downloads/jane.jpg."*
2. **Branch.** Claude Code creates a branch (`content/add-creator-jane-doe`), adds `src/content/creators/jane-doe.md` and the optimised image, and fills the fields. It asks for anything required but missing (consent, alt text) instead of guessing.
3. **Validate.** Claude Code runs `npm run build` (schema and link checks) and, for visual changes, screenshots the affected page.
4. **Pull request.** Claude Code opens a PR using the repository's PR template. The checklist covers: facts verified, image rights confirmed, consent recorded, no placeholder left, SEO title/description set.
5. **Preview.** The host builds a preview URL for the PR automatically; the reviewer checks it on desktop and mobile.
6. **Approve and merge.** Branch protection on `main` requires one approving review from a content owner, plus passing CI. Merge deploys to production automatically.
7. **Rollback.** Any merge can be reverted from GitHub in one click; the previous deploy remains available on the host.

### Repository guardrails

- `CODEOWNERS`: `src/content/**` owned by the content reviewers; `src/components/**`, `src/layouts/**`, `src/styles/**` and the schemas by maintainers.
- A `CLAUDE.md` at the repo root documents content conventions, so every Claude Code session follows the same rules: where files go, image sizes, never invent data, always open a PR, never push to `main`.
- A PR template with the content checklist, and issue templates for common requests ("Add creator", "New case study", "New article", "Update team member").
- Secrets (form endpoints, API keys) live in host environment variables, never in content files.

### When to add a Git-based CMS UI

If non-technical editors need forms instead of chat, add **Keystatic** or **Decap CMS** on top of the same files: both commit to GitHub and open PRs, so the workflow, schemas and review stay identical. This is not needed for launch; it can be revisited after three months of real editing.

## 6. Multilingual readiness (English first)

- Astro i18n routing: `defaultLocale: 'en'` unprefixed; future locales prefixed (`/zh`, `/de`, `/fr`).
- UI strings (nav labels, buttons, form messages) live in `src/i18n/{en,zh}.ts` from day one, even though only `en` ships.
- Content translations are **sibling files** with the same slug in a locale folder (`creators/zh/alchemistlyy.md`) or a `locale` field. Untranslated entries fall back to English with `hreflang` only on translated pages.
- Forms carry a hidden `locale` field so submissions route correctly later.
- The existing `/zh` URLs are handled per Q17 (keep for a later translation, or 301 to English at launch).

## 7. Migration from Phase 1 content

| Phase 1 | Phase 2 | Work |
|---|---|---|
| `src/content/creators` (230) | `creators/` new schema | Scripted field mapping + category remap (approved table) + country/division from client data + consent confirmation |
| `src/content/case-studies` (25) | `case-studies/` new schema | Editorial rewrite into brief/strategy/execution; tags; result verification |
| `src/content/blog` (42) | `insights/` | Scripted move + category remap; slugs kept |
| `src/content/data/company-team.json` (33) | `team/` YAML | Scripted |
| `testimonials.json` (6) | `testimonials/` | Scripted; `consent.approved: false` until re-confirmed |
| `client-logos.json` (20) | `brands/` | Scripted; `approvedForDisplay: false` until the client approves (Q5) |
| `services.json` + strategies data | `services/` (7) | Editorial: new list, new copy |
| `jobs` (2) | `jobs/` | Scripted |
