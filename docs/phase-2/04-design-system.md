# 04 — Proposed design system and creative direction

## 1. Creative direction

**Premium, cinematic and editorial: a creative media group, not a template.** The site should feel like a magazine about the people Stride works with, edited by a company that knows the industry from the inside.

### What we take from each reference

| Reference | Take | Leave |
|---|---|---|
| **goatagency.com** | Full-bleed video work tiles in a staggered rhythm. A heavy wide display face for client names. A disciplined mono for labels. "Without borders" market storytelling. A confident logo wall. | Event pop-ups on entry, a heavily orange palette, loud type everywhere. |
| **connectmgt.com** | The clearest analogue to Stride's model: one group with three routes (Management / Agency / Academy) presented side by side; a footer organised by division; cross-division navigation. | Sticker-collage hero, cartoonish colour, lime-on-green palette, cookie wall. |
| **stride-creator-culture.lovable.app** | **Structure only.** Section order matches the brief; the nav grouping (Our Group dropdown, division overviews, roster, apply) validates our IA. | Its visual style: generic layout, equal grey placeholder boxes, system-like type, repeated cards. |

### Principles

1. **People first, product second.** Faces, hands and real sets lead. Product shots appear inside human context.
2. **One idea per screen.** Every section has one message, one image focus and one action.
3. **Type as image.** Headlines are big, tight and confident, and carry the layout when photography is absent.
4. **Edit, don't decorate.** No gradients for their own sake, no stock icons, no glass cards, no repeated card grids.
5. **Movement with purpose.** Motion reveals hierarchy and responds to the visitor. It never performs for its own sake.
6. **Proof over claims.** Real names, real campaigns, verified numbers, or nothing.

### Three divisions, one family

All divisions share the logo system, type families, grid, spacing, components and navigation. Each changes **one accent colour, one dominant surface and one photographic mood**:

| | Stride (group) | Stride Social | Stride Talent | Stride Education |
|---|---|---|---|---|
| Personality | The editor: calm, assured, global | The strategist: commercial, sharp, kinetic | The manager: personal, warm, loyal | The mentor: open, encouraging, practical |
| Dominant surface | Paper with navy chapters | Navy | Paper / warm white | White and paper with bright blocks |
| Accent | Ice | Ice (the original brand colour) | Peach (proposed) | Sun yellow (proposed) |
| Photography | Montage of all three worlds | Campaign sets, product-in-hand, creators on shoot | Portraits: close, natural light, eye contact | Workshops, laptops, phones on tripods, groups laughing |
| Layout tempo | Mixed editorial rhythm | Dense, grid-snapping, big numbers (verified only) | Spacious, portrait-led, magazine spreads | Friendly, structured, list-led |

## 2. Brand identity: what we keep

- **Logo:** the Stride mark (four triangles) plus the wordmark. **The "Stride Social" wordmark currently doubles as the group logo.** We need a **parent "Stride" lockup** and three division lockups (Stride Social / Talent / Education). These are an asset request, not something we design without approval (see the checklist).
- **Navy `#06142b`** and **ice `#cfedf8`** are the brand core.
- **Inter** remains the text face. **IBM Plex Mono** remains the label face (a recognisable trait of the current site).
- The heavy uppercase display voice continues, in a more refined form (see §4).

## 3. Colour

### Core palette

| Token | Hex | Use |
|---|---|---|
| `--navy-900` | `#06142b` | Deepest surface; Social's globe, Group, footer; ink on every light colour (white on it 18.4:1) |
| `--navy-700` | `#0c2753` | Talent's main surface; the accent on light for Social and Group (white on it 14.7:1) |
| `--navy-500` | `#294368` | Education's opening surface; the accent on light for Education (white on it 10:1) |
| `--steel` | `#7892ab` | Glow, focus rings and the middle of every dark-to-light transition; not a surface for text |
| `--ice` | `#cfedf8` | Social's light surface; its accent on dark (navy on it 15:1) |
| `--lime` | `#edff77` | Stride Talent's buttons only, never a surface or accent (navy on it 16:1) |
| `--ice-pale` | `#e9fafd` | Education's light surface; its accent on dark (navy on it 17:1) |
| `--frost` | `#f5fcff` | Group's light surface: Team, the menus, the contact form (navy on it 18:1) |
| `--white` | `#ffffff` | Group's reading pages: Insights, articles, roles, legal; type on dark; Group's accent on dark |

*The owner's palette of 2026-11-04, which replaces the colours first proposed here.*

**Where each colour lives (each section's `data-look`):**

| | Scrolling down the page |
|---|---|
| Stride Social | `ice` on every page; the service page opens on a full-screen photo |
| Stride Talent | `deep` on every page; lime buttons |
| Stride Education | `slate` on every page |
| Group | `deep` or `navy` → `frost`; Insights, articles, roles and legal read on `white`; History travels `deep` → `frost` along its road |

The background is one layer that follows the scroll along the palette, dark to light (`src/scripts/system/backdrop.ts`); lime branches off at ice. Text, hairlines and glass turn from white to navy together, where both read equally well (4.2:1). Anything on a photo stays white (`.on-photo`).

### Measured contrast (WCAG 2.2)

| Pair | Ratio | Passes |
|---|---|---|
| Navy on paper | 16.70:1 | AAA |
| Navy on white | 18.38:1 | AAA |
| Ice on navy | 15.24:1 | AAA |
| Navy on peach | 11.93:1 | AAA |
| Navy on sun | 12.97:1 | AAA |
| Slate on paper | 5.34:1 | AA body text |
| Ice-deep on paper | 5.25:1 | AA |
| Peach-deep on paper | 5.65:1 | AA |
| Sun-deep on paper | 5.80:1 | AA |

Accents are **surfaces and highlights, never body text** on light backgrounds. The current site's light-on-light labels (e.g. `#f0f0f0` on `#ebebeb`) are retired.

### Division theming (extends the existing `data-division` mechanism)

```css
:root, [data-division='group'] { --accent: var(--ice);   --accent-ink: var(--ice-deep);   --surface: var(--paper); }
[data-division='social']       { --accent: var(--ice);   --accent-ink: var(--ice-deep);   --surface: var(--navy-900); }
[data-division='talent']       { --accent: var(--peach); --accent-ink: var(--peach-deep); --surface: var(--paper); }
[data-division='education']    { --accent: var(--sun);   --accent-ink: var(--sun-deep);   --surface: var(--white); }
```

## 4. Typography

### Recommended pairing (free, open licence, self-hosted)

| Role | Family | Settings |
|---|---|---|
| Display | **Archivo** (variable: width 62–125, weight 100–900) | Uppercase, weight 800–900, expanded width (≈112–125) for heroes, normal width for section titles; tracking −1% to −3% |
| Text | **Inter** (variable, existing) | 400 / 500 / 600; sentence case |
| Labels / data | **IBM Plex Mono** (existing) | 400 / 500, uppercase, tracking +4%, 12–14px |
| Editorial accent | **Instrument Serif** italic (declared, unused, on the current site) | Pull quotes, one-word emphasis in headlines, creator quotes. At most one use per screen. |

Archivo's width axis gives the wide, heavy "agency" voice (the role Druk Wide plays for GOAT) without a licence fee. Pairing it with a serif italic accent adds the editorial, cinematic register the brief asks for. Before Phase 3, confirm the self-hosted variable file includes the width axis; if the packaged file does not, self-host the OFL source from Google Fonts.

**Licensed alternative (Q19):** a commercial display face (for example a wide grotesk from Commercial Type or Pangram Pangram) can drop into the same roles through one token change.

### Type scale (fluid; mobile → desktop)

| Token | Size | Line height | Use |
|---|---|---|---|
| `--type-hero` | `clamp(3.5rem, 11vw, 11rem)` | 0.88 | Landing heroes ("BUILT AROUND CREATORS.") |
| `--type-display` | `clamp(2.75rem, 7vw, 7rem)` | 0.9 | Section headlines |
| `--type-h1` | `clamp(2.25rem, 4.5vw, 4.5rem)` | 0.95 | Page titles (inner pages) |
| `--type-h2` | `clamp(1.75rem, 3vw, 3rem)` | 1.0 | Sub-sections, case names |
| `--type-h3` | `clamp(1.25rem, 1.8vw, 1.75rem)` | 1.15 | Card titles, list items |
| `--type-lead` | `clamp(1.125rem, 1.4vw, 1.5rem)` | 1.4 | Intro paragraphs |
| `--type-body` | `1.0625rem` (17px) | 1.6 | Body |
| `--type-small` | `0.875rem` | 1.5 | Meta, captions |
| `--type-label` | `0.75rem` mono | 1.3 | Eyebrows, tags, data labels |

Rules: maximum line length 68ch for body text, one hero-size headline per page, and the heading hierarchy follows the document outline, never the visual size.

## 5. Space, grid and layout

- **Spacing scale** (4px base): `4 8 12 16 24 32 48 64 96 128 192`. Section padding is `clamp(64px, 10vw, 192px)` top and bottom.
- **Grid:** 12 columns at ≥1024px (gutter 24px), 8 columns at 768–1023px, 4 columns below 768px (gutter 16px). Outer margins are `clamp(16px, 4vw, 64px)`.
- **Containers:** `--container: 1440px`, `--container-wide: 1680px`. Media can break out to full bleed.
- **Editorial layouts used across the site** (variety is a rule; no two adjacent sections share a layout):
  - full-bleed media with an overlay headline;
  - split 5/7 or 7/5 (text and image);
  - offset mosaic (cards spanning 3/5/7 columns at different heights);
  - typographic index (large list rows with an image revealed on hover);
  - horizontal rail (drag/scroll);
  - quote spread (serif italic, one portrait).
- **Aspect ratios:** 4:5 portraits, 3:2 and 16:9 campaign imagery, 1:1 only for roster thumbnails, 9:16 for creator video.

## 6. Components

### Buttons and links

| Variant | Light surface | Dark surface | Use |
|---|---|---|---|
| Primary | Navy fill, white text | Accent fill, navy text | One per view: main action |
| Secondary | 1px navy outline | 1px white or accent outline | Second action |
| Text link | Navy with an animated underline and arrow `→` | Same on white | Inline and "Explore" CTAs |
| Chip / filter | Outline pill; filled when active | — | Roster, work and insights filters |

Specs: height 48px (44px minimum touch target), padding 0 24px, radius 2px (sharper and more editorial than the current 6px), label in Inter 500 at 15px. Plex Mono uppercase is reserved for chips. A visible 2px focus ring is offset 3px. Disabled state at 40% opacity with `aria-disabled`. **No button without a destination.** Unfinished destinations render `PlaceholderNotice` in preview builds and fail production builds.

### Cards (used sparingly)

- **Work tile:** media-first (video loops on hover on desktop; poster on mobile). Client name in display type, a one-line outcome (verified) and service tags. Sizes S/M/L/XL in the mosaic.
- **Roster card:** 4:5 portrait, name, main category and country on a navy band, revealed on hover on desktop and always visible on touch. Platform icons.
- **Article card:** large thumbnail, category label, date, two-line headline.
- **Person tile:** portrait with name and role; optional second photo crossfade.

### Navigation

As specified in [03-sitemap](03-sitemap.md) §2: a 76px header (64px mobile), mega-menu panels with an image feature, a 44px division sub-bar, a full-screen mobile menu, a skip link, `aria-current` on the active page and an active indicator on the current division.

### Forms

Labels always visible (no placeholder-only fields); fields 52px tall; inline validation on blur and on submit; an error summary at the top that links to the fields; success state in place with what happens next; a required consent notice linking to the privacy policy; honeypot plus an invisible challenge for spam ([07](07-technical-architecture.md) §6).

## 7. Photography and video direction

| Do | Don't |
|---|---|
| Real creators, real sets, natural or practical light | Stock models, AI-generated people, staged "office laughter" |
| Behind-the-scenes texture: phones on tripods, ring lights, crews | Floating phone mockups and 3D renders as heroes |
| Consistent grade per division: Social cool/contrasty; Talent warm/soft; Education bright/natural | Heavy filters, duotone everything, gradient overlays |
| Video: 6–12s loops, muted, captioned when there is speech, posters always provided | Long autoplay with sound; autoplay without a pause control |

Asset formats: AVIF/WebP images at 640/960/1440/2048 widths. Video as MP4 (H.264) plus WebM (VP9/AV1) at 720p and 1080p, ≤ 4 MB per hero loop, ≤ 1.5 MB per tile loop. Poster JPGs ≤ 150 KB.

## 8. Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 150ms | Hover colour, focus |
| `--dur-base` | 250ms | Dropdowns, buttons, chips |
| `--dur-slow` | 450ms | Image hover scale, panel reveals |
| `--dur-reveal` | 700ms | Section and typography reveals |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Page and panel transitions |

Patterns:

- **Typography reveal:** headlines rise line by line (mask and translateY 100% → 0), staggered 60ms per line. The text is not split into letters for screen readers.
- **Image hover:** scale 1 → 1.04 over 450ms, with a slight crossfade on work tiles to the video loop.
- **Section transition:** media fades and settles (opacity 0 → 1, translateY 24px → 0) once on entry.
- **Parallax:** at most a 6–8% offset, hero media only.
- **Three Sides panels:** the hovered panel expands slightly (flex 1 → 1.25) while the others dim to 70% opacity; touch has no expansion.
- **Page transitions:** optional cross-document View Transitions (a fade or a slide of the header indicator between divisions). Progressive enhancement only.
- **Smooth scroll:** Lenis stays, but is disabled on touch and reduced motion.
- `prefers-reduced-motion: reduce` turns off parallax, auto-advancing carousels, hover video autoplay, smooth scroll and reveals; content appears immediately.

## 9. Accessibility (target: WCAG 2.2 AA)

- Contrast as measured in §3. Text over imagery always sits on a scrim or a solid band, checked at each breakpoint.
- **Autoplay video:** muted, `playsinline`, a visible **pause/play control** on hero and montage video (WCAG 2.2.2), and poster fallback. Respects reduced motion.
- Keyboard: every menu, filter, carousel and form is fully operable; focus is visible; no keyboard traps. The mobile menu traps focus while open and returns it on close.
- Semantics: one `h1` per page, landmarks (`header`, `nav`, `main`, `footer`), `aria-current`, labelled regions for carousels.
- Media: meaningful alt text from content files (required field), captions for spoken video, transcripts for podcast embeds.
- Forms: associated labels, error text tied with `aria-describedby`, no colour-only errors, and an `autocomplete` attribute on every field.
- Targets ≥ 44×44px; text resizes to 200% without loss; no horizontal scrolling at 320px width.

## 10. Iconography and graphic devices

- The Stride mark's **triangles** are the graphic device: a cropped triangle as a section corner, diagonal image masks, and the divider between the three sides. Used sparingly.
- Icons: a single line icon set (1.5px stroke) only for UI (arrows, close, play/pause, platform logos). No decorative icon grids.
- Numbers (verified stats, steps) set in the display face, tabular figures.

## 11. Copy rules (from brief §9)

- Confident, direct, contemporary, human; short sentences; sentence case for body, uppercase only for display headlines.
- Lead with what Stride does and for whom. Cut adjectives that any agency could claim.
- **Never invent** awards, statistics, offices, clients, testimonials, team members or results. Every figure in content files carries a `source` note.
- Banned filler: "unlock", "elevate", "seamless", "cutting-edge", "in today's fast-paced digital landscape", "game-changer", "synergy".
- Headlines from the PDF are used verbatim unless the client changes them.
