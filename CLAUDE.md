# Stride website: rules for Claude Code sessions

This repository is the Stride group website (Stride Social, Stride Talent, Stride Education), built with Astro.
Read `docs/phase-2/README.md` first. The approved plan lives in `docs/phase-2/`; treat it as the spec.

## Project status

- **Phase 1** (done, tag `phase-1-recreation`): pixel-close rebuild of the old Webflow site.
- **Phase 2** (done, approved 2026-10-31): architecture, design system, wireframes, content model, roadmap.
- **Phase 3** (in progress): development by roadmap stage (`docs/phase-2/08-roadmap.md`). Each stage ends with a review gate. Do not start the next stage without the owner's go-ahead.

## Commands

```bash
npm install
npm run dev                  # http://localhost:4321
npm run build                # static build + content schema validation
npm run check                # astro check (types)
npm run check:links          # internal links and assets in dist/
npm run check:placeholders   # unfinished placeholders in dist/ (add -- --strict for production)
npm run check:content        # Phase 3 content status + reference integrity (add -- --strict for launch)
npm run ci                   # everything CI runs
```

## Content rules (non-negotiable)

- **Never invent** creators, follower counts, testimonials, campaign results, statistics, clients, logos, awards, offices or team members. If something is missing, ask, or use the `PlaceholderNotice` component (Phase 3). Never use fake data.
- Every figure needs a `source`; only `verified: true` results render.
- Creator profiles need recorded consent; brand logos need `approvedForDisplay: true`.
- Use the PDF headlines verbatim. Mark any copy you draft as `status: draft` until the owner approves it.
- Image fields always need meaningful `alt` text.
- Tone: confident, direct, human, brief. No filler words ("unlock", "elevate", "seamless", "cutting-edge").

## Workflow

1. Never commit directly to `main`. Create a branch: `content/<what>`, `feature/<what>` or `fix/<what>`.
2. Make the change, run `npm run ci`, and for visual changes screenshot the affected page at 1440px and 390px.
3. Open a pull request using the template. A reviewer approves the preview before merging.
4. Do not push, merge, deploy or touch the live Webflow site unless the owner explicitly asks.

## Code conventions

- **New (Phase 3) pages** use `src/layouts/SiteLayout.astro`, tokens from `src/styles/system/tokens.css`, and components from `src/components/core/` (primitives), `src/components/global/` (header, footer, breadcrumbs) and per-area folders (`home/`, `social/`, `talent/`, later `education/`). Navigation lives in `src/config/navigation.ts`; form fields in `src/config/forms.ts`; collection routes in `src/lib/routes.ts`. Forms use `core/FormShell` + `core/Field`/`core/CheckboxGroup` (behaviour in `src/scripts/system/form.ts`). Roster listings always go through `src/lib/roster.ts` (consent rule).
- **Phase 1 pages** still use `BaseLayout` and the legacy folders (`layout/`, `ui/`, `sections/`, `cards/`, `company/`, `offering/`, `portfolio/`, `editorial/`). Don't extend legacy components; replace pages stage by stage, then delete what is unused.
- Pages not built yet are listed in `plannedPages` (navigation config) and render a labelled placeholder. Remove the entry when the real page ships.
- Mark interim or missing content with `core/PlaceholderNotice` (it sets `data-placeholder`, which the placeholder check detects).
- Astro components with scoped `<style>`; breakpoints follow the design system.
- Division context comes from `BaseLayout`'s `division` prop (`data-division` on `<html>`).
- Content lives in `src/content/` (typed collections, schemas in `src/content.config.ts`). Pages never hard-code collection data.
- **Phase 3 collections:**
  - taxonomies: `categories`, `industries`, `markets`;
  - `services`, `talentDivisions`, `educationTopics`, `educationExperience`;
  - `brands`, `team`, `testimonials`, `roster`, `work`, `insights`.

  New pages read these. Legacy collections (`caseStudies`, `blog`, `creators`, `legacyTestimonials`, `clientLogos`, `legacyServices`) only feed Phase 1 pages, and are deleted with them.
- Respect the status fields when rendering: show results only when `verified`, roster profiles only with confirmed (or, before launch, `legacy`) consent, logos only when approved, and education items only with a confirmed availability. Never upgrade a status without Stride's confirmation.
- Keep JavaScript minimal (vanilla TS modules in `src/scripts/`), and respect `prefers-reduced-motion`.
- Keep components readable: match the surrounding naming and comment density.

## Gotchas

- `duplicade-stride/` is a local Phase 1 backup. It is git-ignored; never edit it or reference it from the site.
- Media: images live in normal Git; video files (`*.mp4`, `*.webm`) are tracked with Git LFS. Run `git lfs install` once per machine.
- Windows: some migrated asset filenames are long (up to ~127 characters). Run `git config --global core.longpaths true` before cloning, or files fail to check out in deep folders. The names get shortened when media moves into `src/assets` (Phase 3, Stage 2).
- The live site's own content issues (typos, one broken link `/blog/anker`) are documented in `docs/ARCHITECTURE.md`. Fix them only when asked.
