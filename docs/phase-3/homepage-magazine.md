# Homepage and navigation redesign (2026-11-02)

After Gate 3 the owner rejected the ten-section homepage as monotonous (the same display headline
nine times), too long (about thirteen screens, the three businesses explained four times),
unfinished-looking (empty "awaiting" frames), cold and thin on proof. A first rebuild ("magazine",
paper pages) was followed the same day by the owner's creative brief: make Stride feel like a
creator-culture studio rather than a corporate agency. Navy (#06142B) with white type, Stride's
light cyan (`--ice`) as the sparing interactive accent, an editorial video hero, a camera mode dial
for navigation and one motion language across the site. CORE-A Studios was the reference for the
dial's arc of labels; the Stride dial is its own design. This replaces wireframe section A
(`docs/phase-2/05-wireframes.md`) for the homepage, and the header's mega menus everywhere.

## Navigation: the camera mode dial

- `global/ModeDial.astro` + `src/scripts/system/mode-dial.ts`; modes in `src/config/navigation.ts`
  (`modes`, `modeOf`): Group, Social, Talent, Education, Work, About.
- **Dock** (desktop, every page): half a matte, knurled dial at the left edge, marker at 3 o'clock.
  Open at the top of the home page; elsewhere it rests tucked to its rim and opens on hover or
  keyboard focus. Drag, wheel/trackpad or arrow keys turn it; momentum, then an exact snap with a
  small detent "click". Resting on a new mode after a pointer or wheel turn fills the marker and
  opens that page; arrow keys only select (Enter opens). Every mode is a real link.
- **Menu** (every width, the Menu button): full-screen; a larger dial at the bottom chooses a mode
  and the mode's pages show above it. Tapping the selected mode opens it. The menu replaces the
  mega menus and the old mobile accordion; every page they listed is still one tap away.
- The header keeps the logo, Contact, a "mode" chip (current mode) and the division sub-bar.
- Page changes: same-site navigations use cross-document view transitions (old page drifts and
  blurs, new page wipes in; Chrome, Edge, Safari). The dial starts on the previous page's mode and
  turns to the new one. All of it is off under reduced motion.

## Motion language (`src/styles/system/motion.css`, `src/scripts/system/motion.ts`)

Reveal variants `wipe`, `from-left`, `from-right`, `tilt` (one-shot, existing reveal script);
`data-parallax` (subtle pointer drift) and `data-magnetic` (hover lean), fine pointers only. Nothing
loops by itself except the logo and creator marquees, which pause on hover or focus and stand still
under reduced motion.

## Homepage sections (src/pages/index.astro)

| # | Section | Component | Copy (all `status: approved`) |
|---|---|---|---|
| 1 | Hero: the showreel full-bleed; "Built around" kicker, "creators." huge; annotations | `home/CoverHero` (keeps `IntroReveal` + `hero-intro.ts`) | `home.hero`, audiences from `home.sides` |
| 2 | The three businesses as destinations (hover: name widens, footage, descriptor) | `home/ContentsIndex` | `home.sides` |
| 3 | Work: hover-to-play case study tiles + logo marquee | `home/ProofSpread` | `home.work`, `social.logos` |
| 4 | People: creators strip + team lineup (cast selection) | `home/PeopleSpread` | `home.people`, `talent.roster` |
| 5 | Insights: lead story + numbered list | `home/InsightsIndex` | `home.insights` |
| 6 | Closing line + three routes | `home/FinalRoutes` | `home.final` |

Media: the showreel (`/assets/video/stride-reel-{desktop,mobile}.*`) is cut from campaign footage
already on the site, until Stride's approved montage arrives. Hover previews
(`/assets/video/preview-*.mp4`, about 0.1–1 MB each) are six-second cuts of each campaign's own
footage. Temu, Holafly and Papaya are proposed as homepage case studies because they have footage
(`featuredOn: home`, marked as proposals in their files).

## Stride Social: creator globe and content world

Two sections after the Social intro (`src/pages/social/index.astro`):

- **Creator globe** (`social/CreatorGlobe.astro`, `src/scripts/system/creator-globe.ts`): a stylised,
  cut-away globe (the cap of a sphere sliced across, a layered cross-section under the rim) selects
  a region; a phone shows that region's creator content as a reel. Drag or swipe the globe (a swipe
  moves to the next region), scroll through the pinned section (one region per step), or use the
  region tabs (arrow keys). Regions, west to east, and their creators: `src/config/creator-regions.ts`.
  No creator has a recorded country yet and no case study links creators, so every region shows
  either its case study's own footage labelled "Interim" (North America: Papaya, UK & Europe: Temu,
  Asia: Holafly) or a labelled empty state (Latin America, Australia). A creator appears once Stride
  names one per region with confirmed consent and a recorded country.
- **Content world** (`social/ContentWorld.astro`): browser-style windows (a live campaign, reels, a
  collab brief, the roster) that drift as the page scrolls. All real content; the reels are the
  previous site's creator clips (labelled interim), cut to light loops (`preview-reel-*.mp4`).
- The globe was built from the written brief; the hand-drawn sketch it refers to was not received.

## Team lineup and characters

The lineup is built for full-body character renders: team entries take an optional `character`
image (transparent background, feet at the bottom); without one, the headshot fills the slot. No
character art has been made or faked. Preview shows "Character art: full-body characters to come".

## Dropped from the homepage

- "One group" (`home.group`, draft): the story lives on `/about`.
- Talent divisions index (`home.divisions`, draft): `/talent` carries the divisions section.
- "Beyond business" (`home.beyond`, draft): returns on `/sponsorships` when confirmed entries exist.
- "Global presence" (`home.presence`): stays on `/about` only (`MarketsDisplay`).

The draft sections stay in `home.yaml` (unrendered) until Stride decides on them; removing copy
is Stride's call. `check:content --strict` keeps listing them as a known launch item.

## Placeholders (owner rule: a labelled frame for every missing image)

- Creators strip: legacy-consent portraits with an "Interim portraits" note in preview; production
  omits the strip until consent is confirmed.
- Businesses: education has no imagery (Q11): a labelled placeholder comes up behind its row; the
  Talent row's roster portrait is tagged "Interim image".
- Work: "Interim logos" (Q5) and "Awaiting case studies: Samsung, Barsys" (Q6) as one-line notices.
- Team: "Character art" note in preview.
