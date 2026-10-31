# Stage 1 — Design system and creative proof

Branch: `feature/stage-1-design-system`. Review gate: **Gate 1** (docs/phase-2/08-roadmap.md).

**Status: Gate 1 approved by the project owner on 2026-10-31.** The design system, navigation pattern and creative proof are the baseline for Stages 2–7. The client-facing Gate 1 questions below remain open in the approval checklist.

## What to review (local: `npm run dev` → http://localhost:4321)

| URL | What it shows |
|---|---|
| `/` | **Creative proof:** homepage hero (A1) and Three Sides of Stride (A2) at full fidelity with interim media; sections A3–A10 shown as a labelled Stage 3 placeholder. The new header, mega menus and footer. |
| `/styleguide` | Every token and component: colour (with contrast), division themes, type scale, buttons, chips, badges, form fields, media, placeholders, motion, spacing. Internal and noindex. |
| `/social`, `/talent/roster`, `/education` (and every other new menu link) | Planned-page placeholders rendered in each division's theme, with the division sub-bar. They show how moving between divisions feels. |

Try: hover the Three Sides panels; open each mega menu (mouse, or Tab + Enter + arrow keys + Escape); resize below 1120px for the mobile menu; turn on "reduce motion" in your OS.

## What was built

- **Tokens** (`src/styles/system/tokens.css`): palette, division themes (`data-division`), fluid type scale, spacing, layout, motion.
- **Fonts** (self-hosted): Archivo variable with the width axis (62–125%, confirmed), Inter, IBM Plex Mono, Instrument Serif italic.
- **Core components** (`src/components/core/`): Button, Eyebrow, Chip, Badge, Field, Media (image/video with pause control), PlaceholderNotice, StrideLogo.
- **Global chrome** (`src/components/global/`): SiteHeader (mega menus with feature tiles, division sub-bar, full-screen mobile menu), SiteFooter, Breadcrumbs.
- **Layout:** `src/layouts/SiteLayout.astro` for all redesigned pages.
- **Motion** (`src/scripts/system/`): line-by-line headline reveals, video behaviour (autoplay only on screen, pause control, hover playback), header behaviour (scroll states, menus, focus management).
- **Navigation config** (`src/config/navigation.ts`): the single source for header, menus, sub-bars, footer and the planned-page list.
- **Homepage proof** (`src/components/home/`): HeroMontage, ThreeSides.

## Checks run

| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| Build | 341 pages (312 Phase 1 + 28 planned + style guide) |
| Internal links | 13,242 checked, 0 broken |
| Keyboard and focus (automated) | Skip link first; mega menus open with Enter, move with arrows, close with Escape and return focus; mobile menu traps focus and restores it; one `h1` on the homepage; no console errors |
| Reduced motion | Hero text visible immediately; hero video starts paused |
| Visual | Desktop 1440 and mobile 390 screenshots reviewed for the hero, Three Sides (including hover), mega menu, division pages, mobile menu and footer |

## Decisions and deviations to note

1. **Phase 1 and Phase 3 coexist.** Redesigned pages use `SiteLayout` and the new `core/`, `global/` and `home/` folders. The Phase 1 pages (About, Contact, Careers, case studies, creators, blog) keep `BaseLayout` until their stage replaces them. Old component folders (`layout/`, `ui/`, `sections/`, `cards/`, `company/`, `offering/`, `portfolio/`, `editorial/`) are legacy and will be deleted once unused.
2. **Desktop navigation starts at 1120px**, not 1024px: seven items, the logo and the Contact button need the room. Below 1120px the full-screen menu is used.
3. **Interim assets, all labelled on screen:**
   - **Logo:** the Stride mark with a typeset "STRIDE" wordmark (official parent and division lockups requested).
   - **Hero:** the existing campaign montage.
   - **Three Sides panels:**
     - Social: a creator campaign clip from the current site;
     - Talent: a managed creator's portrait (consent not yet confirmed);
     - Education: a Stride event photo (no education imagery exists).
4. **Safety net for motion.** Hidden-until-revealed content is shown automatically if the motion script fails to start within 3 seconds, and the hero's entrance is pure CSS. This was added after a stale dev bundle left the hero blank during testing.
5. **No dead links.** Every sitemap page that is not built yet renders a labelled, noindex placeholder in its division theme (`src/pages/[...planned].astro`). Remove a page from `plannedPages` when it ships.
6. **Homepage SEO.** The old, incorrect home JSON-LD is not carried over; correct Organization data comes in Stage 8. The meta description is a **draft** pending approval. The page title is unchanged for now.
7. **Footer.** The office phone number and WeChat QR from the old footer are left out until the client confirms them (Q3, approval checklist). The tagline uses the brief's "Built around creators."

## Gate 1 questions for the client

- Approve the type pairing (Archivo wide + Inter + Plex Mono + Instrument Serif accent), or choose a licensed display face (Q19)?
- Approve the Talent peach and Education sun accents (Q20)?
- Approve the navigation pattern: mega menus with feature tiles, division sub-bar, full-screen mobile menu?
- Approve the Three Sides interaction (panel widens on hover, others dim) and the overall motion level?
- Provide the official parent "Stride" logo and division lockups.
