# 05 — Section-by-section wireframes

Low-fidelity wireframes written as specifications. Each section lists its **purpose**, **layout**, **media**, **interaction**, **CTA** and **desktop / mobile** behaviour. ASCII sketches show the composition at desktop width; 12-column grid references (`c1–c6`) follow [04-design-system](04-design-system.md) §5.

The four landing pages are composed differently on purpose:

| Page | Composition idea | Tempo |
|---|---|---|
| Group home | A cinematic **anthology**: three worlds introduced, then proof, people and reach | Varied, editorial |
| Social | A **campaign reel**: work-led, dark, kinetic, commercial | Dense and fast |
| Talent | A **portrait magazine**: faces first, warm, spacious | Slow and personal |
| Education | A **prospectus**: welcoming, structured, honest about what is available | Clear, light, friendly |

`[B]` marks content blocked on the client (see [02](02-requirements-analysis.md) §3). Blocked sections either show a labelled placeholder (preview builds) or are hidden until populated, as stated per section.

---

## A. Main Stride homepage (`/`): ten sections, per PDF §3

### A1 — Main hero

```
┌──────────────────────────────────────────────────────────────────────┐
│ STRIDE▲   Our Group▾ Social▾ Talent▾ Education▾ Our Work About [Contact]│
│                                                                      │
│  ░░░░░░░░░ full-bleed video montage (campaign · portraits · sessions)░│
│                                                                      │
│  BUILT                                                               │
│  AROUND                                                              │
│  CREATORS.                                     One global group.     │
│                                                Three businesses …    │
│  ⏸  ▲ STRIDE · EST. [Q1]                        [Social →][Talent →] │
│                                                 [Education →]        │
└──────────────────────────────────────────────────────────────────────┘
```

| | |
|---|---|
| Purpose | State in one line that Stride is a creator-centred media group, not only an agency. |
| Message | "BUILT AROUND CREATORS." plus the PDF's secondary description, used verbatim. |
| Layout | 100svh (max 1000px). Headline bottom-left over c1–c8 in hero type, three lines. Description and three division links bottom-right over c9–c12. A soft bottom scrim keeps text legible. |
| Media | A 10–15s muted loop alternating a commercial shoot, a creator portrait and an education session (≈4s each). Poster plus a mobile 9:16 cut. Fallback: a 3-image crossfade. `[B]`: until approved footage exists, the existing hero montage serves as a temporary source. |
| Interaction | The headline reveals line by line on load. The video has a visible pause control. The header is transparent over the hero and becomes solid on scroll. |
| CTA | Three text links: Stride Social → / Stride Talent → / Stride Education →. The header Contact button stays the main conversion. |
| Desktop | As sketched. Headline about 160–176px. |
| Mobile | Vertical video. Headline 3 lines at about 56px, stacked description, the three links as a full-width list with arrows. |

### A2 — Explore Stride: "THREE SIDES OF STRIDE."

```
 EXPLORE STRIDE                                        THREE SIDES OF STRIDE.
┌───────────────────────┬───────────────────────┬───────────────────────┐
│                       │                       │                       │
│   campaign image      │   creator portrait    │   learning/community  │
│                       │                       │                       │
│ 01 — FOR BRANDS       │ 02 — FOR CREATORS     │ 03 — FOR THE NEXT GEN │
│ STRIDE                │ STRIDE                │ STRIDE                │
│ SOCIAL                │ TALENT                │ EDUCATION             │
│ Influencer marketing, │ Representation, …     │ Learn the industry, … │
│ Explore Stride Social→│ Explore Stride Talent→│ Explore Stride Educ. →│
└───────────────────────┴───────────────────────┴───────────────────────┘
```

| | |
|---|---|
| Purpose | The homepage's main router: each audience self-selects. |
| Layout | Three equal full-height columns (≈90vh) edge to edge, 2px navy gaps. A label with the audience, the division name in display type, one line of PDF copy and the CTA at the bottom of each panel. The section headline sits above, right-aligned. |
| Media | Social: the strongest commercial campaign still. Talent: an authentic signed-creator portrait. Education: a real session or creator filming. Each panel uses its division's grade and a thin accent rule. `[B]` for Education imagery. |
| Interaction | Hovering a panel widens it slightly while the others dim; its image scales to 1.04. The whole panel is the link (one focusable element). On keyboard focus it shows the same state plus a focus ring. |
| CTA | Explore Stride Social / Talent / Education (PDF wording). |
| Desktop | Three columns. Not small cards: each panel is at least 640px tall. |
| Mobile | Three stacked editorial sections, each about 85svh: image top two-thirds, text block below on the division surface colour. No expansion animation. |

### A3 — Introducing the group: "ONE GROUP. BUILT FOR WHAT'S NEXT."

| | |
|---|---|
| Purpose | Credibility and story: when Stride started, where it operates and what makes it different. |
| Layout | Split screen 6/6: a full-height photograph left (bleeds to the edge), text right on paper. Headline, then 2 short paragraphs, then a "Our Story" link. |
| Media | Founders or team at work (documentary style). Existing founder photos are usable as an interim choice. |
| Copy | Founding year and international scope `[B: Q1, Q3]`. The "what makes us different" points must be real (e.g. creator-founded, three connected businesses). Drafted for approval. |
| Interaction | The image settles in with a subtle parallax (≤6%). Text lines reveal. |
| CTA | "Our Story" → `/about` (or `/history`). |
| Mobile | Image first (4:5), text below. |

### A4 — Our divisions (talent specialisms)

```
 SPECIALIST DIVISIONS
 ───────────────────────────────────────────────────────────  ┌─────────┐
 SPORT                                                   →   │ hover   │
 TRAVEL                                                  →   │ image   │
 PODCASTS                                                →   │ follows │
 MUSIC                                                   →   │ cursor  │
 SPEAKERS                                                →   └─────────┘
```

| | |
|---|---|
| Purpose | Show the depth of Stride Talent's specialist verticals, and let the list grow over time. |
| Layout | A typographic index: each division is one full-width row in display type (about 96–120px) with a hairline divider and an arrow. A small descriptor and creator count appear only if verified. |
| Media | One image per division, revealed on hover (desktop) as a floating 4:5 frame that eases after the cursor. On mobile, a small thumbnail sits inside each row. `[B]` division imagery. |
| Data | Driven by the `talentDivisions` collection: adding a file adds a row. A division with `status: coming-soon` shows a "Coming soon" label and no link (no dead buttons). |
| CTA | Each row → `/talent/[division]` or the filtered roster (Q24). |
| Mobile | Rows at about 40px type with the thumbnail at right. Tap to open. |

### A5 — Our work

```
 OUR WORK                                                 Explore Our Work →
┌──────────────────────────────┬──────────────┐
│                              │   BARSYS     │
│   SAMSUNG  (XL, video loop)  │   (M)        │
│                              ├──────────────┤
├───────────────┬──────────────┤   LAIFEN (M) │
│ GOVEE (M)     │ XGIMI (L)    │              │
└───────────────┴──────────────┴──────────────┘
```

| | |
|---|---|
| Purpose | Show agency-grade proof: big brands, real creative, verified outcomes. |
| Layout | An asymmetric mosaic of 5 tiles in XL/L/M sizes. Each tile: media, client name in display type, a one-line verified result, service tags. Varied sizes are required by the brief. |
| Media | Campaign stills with a short loop on hover. Samsung and Barsys `[B: Q6]`. Laifen, Govee and XGIMI have existing imagery that may need upgrading. |
| Content rule | A tile only shows a result marked `verified: true` in its case-study file; otherwise it shows the services line. Tiles without a case study are not rendered. |
| Interaction | Hover plays the loop and scales the image; on touch, tiles show posters. Tiles reveal staggered on entry. |
| CTA | Each tile → `/work/[slug]`. Section CTA "Explore Our Work" → `/work`. |
| Mobile | Single column; the first tile is tall (4:5), the rest 3:2. A horizontal rail is an alternative to test in Phase 3. |

### A6 — The people behind Stride

| | |
|---|---|
| Purpose | Human credibility: a real team, not a logo. |
| Layout | An editorial mosaic on paper mixing 4:5 portraits (name and role on hover) with 2–3 wider candid team photographs. Uneven column spans, not a uniform grid. Headline top-left, "Meet The Team" link bottom-right. |
| Media | Professional portraits (33 exist) plus natural team photography `[B]`. |
| Interaction | Portraits crossfade to their second photo on hover where one exists (as on the current team page). |
| CTA | "Meet The Team" → `/team`. |
| Mobile | A 2-column mosaic with candid images spanning both columns, limited to 6–8 tiles. |

### A7 — Beyond business

| | |
|---|---|
| Purpose | Show genuine community involvement: creator sponsorships, local sports, initiatives. |
| Layout | A photo story: one large full-bleed image with a headline overlay, followed by a horizontal rail of 3–6 sponsorship entries (image, partner, one-line description, year). |
| Media | Real sponsorship photography `[B: Q12]`. |
| Visibility | **Hidden until at least one sponsorship entry exists.** No placeholder imagery in production. |
| CTA | "Our Sponsorships" → `/sponsorships`. |
| Mobile | Image, then a swipeable rail. |

### A8 — Insights and news

| | |
|---|---|
| Purpose | Show expertise and activity. |
| Layout | Three articles: one large (c1–c7, 4:3) plus two stacked (c8–c12, each 3:2). Category label, date, headline (2 lines max). |
| Media | Article thumbnails. Featured articles should get real photography (current thumbnails are stock-like). |
| Data | The latest three, or three flagged `featured: true` in the insights collection. |
| CTA | "Explore Insights" → `/insights`. |
| Mobile | Stacked, all at 3:2. |

### A9 — Global presence

```
 WHERE WE WORK
 TALENT MARKETS                     TEAM / OPERATING MARKETS [Q3]
 UNITED KINGDOM                     ……  (verified only)
 UNITED STATES
 CANADA
 GERMANY
 FRANCE
```

| | |
|---|---|
| Purpose | Show international reach without overstating it. |
| Layout | A typographic geographic display on navy: two labelled columns, "Talent markets" (the five from the brief) and "Team & operating markets" (verified list only). An optional minimal dot map behind the text. Country names in display type; each may show a small local-time ticker. |
| Rule | No "offices" wording or pins unless an office is confirmed (brief §3.9). |
| Interaction | Hovering a country highlights its dot. Names reveal on scroll. |
| Mobile | One column per group. The map is hidden. |

### A10 — Final call to action

| | |
|---|---|
| Purpose | Convert every audience at the end of the story. |
| Layout | A full-height ice section: "LET'S MAKE SOMETHING HAPPEN." in hero type, then three large route rows (division name, one line, arrow), each with an accent swatch. The dark navy footer follows. The sticky footer-reveal technique from Phase 1 can be reused. |
| CTA | Work with Stride Social → `/social/enquire` · Join Stride Talent → `/talent/apply` · Explore Stride Education → `/education`. |
| Mobile | Headline at 3 lines; the routes become full-width buttons. |

---

## B. Stride Social (`/social`): PDF §4 · surface navy · accent ice

### B1 — Hero: "THE RIGHT CREATORS. REAL IMPACT."

| | |
|---|---|
| Layout | Full-bleed campaign footage on navy. Headline left in expanded display type, subheading below (verbatim from the PDF). Two buttons. The division sub-bar sits under the header. |
| Media | A fast-cut campaign reel (6–10s): creators on set, product in hand, TikTok-style vertical clips arranged in a moving 3-up strip. The existing live-campaign clips can serve as interim footage. |
| Interaction | The clips play only while the hero is visible, with a pause control. The headline reveals line by line. |
| CTA | Primary "Speak To Our Team" → `/social/enquire`; secondary "Explore Our Work" → `/work`. |
| Mobile | One vertical clip full-bleed, headline over a bottom scrim, stacked buttons. |

### B2 — Trusted by brands

| | |
|---|---|
| Layout | A single refined row: monochrome (ice on navy) logos on a slow marquee, pausing on hover. Optionally a static 2×4 grid on large screens. |
| Media | **Approved vector logos only** `[B: Q5]`. Interim: the approved subset of the 20 existing logos. |
| Mobile | A marquee strip that respects reduced motion (static grid fallback). |

### B3 — Introduction: "INFLUENCE IS MORE THAN A POST."

| | |
|---|---|
| Layout | An editorial split: the large headline left (c1–c6), right column (c8–c12) with 2–3 short paragraphs on planning and executing creator-led campaigns across platforms, formats and markets. A slim row of verified proof points (only if approved, Q7). |
| Media | None: type-led, as a deliberate pause after the logos. |
| Mobile | Headline, then text. |

### B4 — Our services (7)

```
 OUR SERVICES
 01  INFLUENCER ACTIVATIONS        Influencer partnerships with creators of all sizes   →
 02  INFLUENCER SEEDING            Product gifting and creator activation at scale      →
 03  UGC PRODUCTION                …                                                   →
 …                                                    ┌──────────┐ hover: image/video
 07  PODCAST ACTIVATIONS           …                  │          │ preview follows
                                                      └──────────┘
```

| | |
|---|---|
| Purpose | Make the 7 services scannable and distinctive, with no identical cards (brief §4). |
| Layout | A large typographic index: number, service name in display type, the PDF's one-line descriptor, arrow. Each row reveals a service-specific image or clip on hover. Rows alternate subtle accent treatments. |
| CTA | Each row → `/social/services/[slug]`. |
| Mobile | An accordion-free list: name and descriptor with a small thumbnail; tap to navigate. |

### B5 — Industries we work in (8)

| | |
|---|---|
| Layout | A horizontal rail of 8 tall image tiles (Technology, Lifestyle, Beauty, Fashion, Sport, Travel, Home, Trades & Construction). Each shows a real campaign image from that industry and the number of case studies tagged. |
| Media | Campaign imagery per industry. Trades & Construction and Sport have no material yet `[B]`. |
| Interaction | Drag or scroll the rail; arrow buttons; snap. |
| CTA | Each tile → `/work?industry=[slug]`. A tile with no case studies shows a text-only treatment and does not link. |
| Mobile | A swipe rail with peek. |

### B6 — Featured campaigns

| | |
|---|---|
| Layout | A *different* treatment from the homepage mosaic: 2–3 full-width "spreads", each with a large image or video left (c1–c8) and the summary right (client, challenge in one line, verified results as large figures, services). |
| Data | Case studies flagged `featuredOn: [social]`. |
| CTA | "View case study" per spread; section CTA "Explore Our Work". |
| Mobile | Media, then summary, per spread. |

### B7 — Our approach: Strategy → Creator Selection → Campaign Execution → Reporting

| | |
|---|---|
| Layout | A pinned horizontal sequence on desktop: four large "chapters" scroll across while the section is pinned. Each has a number, a title in display type, 2–3 lines of real process copy and an image from that stage (strategy session, shortlist board, on-set, report screen). |
| Rule | No generic icon diagram (brief §4). |
| Reduced motion / mobile | A vertical stack of four chapters. |

### B8 — Final CTA and brand enquiry form

| | |
|---|---|
| Layout | Ice section: "YOUR NEXT CAMPAIGN STARTS HERE." and the button "Talk To Stride Social", which scrolls to or reveals the inline form (the same form lives at `/social/enquire`). |
| Form fields | Name\*, Company\*, Email\*, Market\* (select: UK, US, Canada, Germany, France, Other; Q13 confirms the list), Service\* (7 services + "Not sure yet"), Estimated budget (optional, ranges confirmed by the client), Brief\* (textarea), consent notice. A hidden `creator` field is prefilled from roster enquiries. |
| States | Inline validation, submitting state, success panel ("Thanks, [name]. Our team will be in touch." Any response time needs Q13 confirmation), error with retry and a direct email fallback. |

---

## C. Stride Talent (`/talent`): PDF §5 · surface paper · accent peach

### C1 — Hero: "MORE THAN MANAGEMENT."

| | |
|---|---|
| Layout | A portrait wall: 5–7 real talent portraits in a staggered column layout drifting vertically at slightly different speeds. The headline is set over a central clear band, with the supporting line below. Warm grade. |
| Media | Approved talent portraits or short portrait clips `[B]`. Consent required. |
| CTA | "Explore Our Roster" → `/talent/roster`; "Apply For Management" → `/talent/apply`. |
| Mobile | A 2-column portrait grid behind a top-aligned headline, or a single autoplay portrait loop. Columns are static under reduced motion. |

### C2 — Introduction

| | |
|---|---|
| Layout | A large statement paragraph across c2–c11 in the display face at h2 size, sentence case: since [Q1], representing [Q2] creators across the UK, US, Canada, Germany and France; mission: to improve creators' experience of being creators. Market names as small ice-deep/peach-deep labels. |
| Mobile | The same at smaller size. |

### C3 — What we do: "YOUR CAREER. OUR COMMITMENT."

| | |
|---|---|
| Layout | A magazine spread: the heading left, sticky while scrolling. Right: 8 services as numbered short entries (title plus one human sentence each), interleaved with 2 candid images of talent managers working with creators. |
| Copy | Personal, non-corporate ("We find the deals worth doing, and negotiate them properly."). Drafted for approval. |
| Mobile | Heading, then the list with the images inline. |

### C4 — Creator roster (preview on the landing page; full directory at `/talent/roster`)

| | |
|---|---|
| Layout (landing) | The filter chips row (Sport, Beauty, Fashion, Lifestyle, Travel, Music, Podcasts, Speakers, Technology, Other) above a 4-column portrait grid showing 8–12 creators. Choosing a chip filters the preview inline; "See full roster" keeps the filter in the URL. |
| Card | 4:5 portrait, name, main category, country flag/code, platform icons. No follower counts unless verified (brief: "Do not invent talent or follower counts"). |
| Mobile | A horizontally scrolling chip row with a 2-column grid. |

### C5 — Creator experiences

| | |
|---|---|
| Layout | A quote spread: one large serif-italic creator quote with a portrait, a name/handle and a "next" control. Optional 9:16 video testimonials in a rail. |
| Visibility | Hidden unless at least 2 approved creator testimonials exist `[B]`. Existing candidates: Justice Buys, Jack Chalmers, Lilly/Guang (consent must be re-confirmed). |
| Mobile | One quote per screen, swipe. |

### C6 — Divisions

| | |
|---|---|
| Layout | Distinct from the homepage index: five tall cards in a row (Sport, Travel, Podcasts, Music, Speakers), each with a division image, display name and member count (if verified). Hovering expands one card horizontally. |
| CTA | → `/talent/[division]`. "Coming soon" divisions do not link. |
| Mobile | A vertical stack of wide bands. |

### C7 — Apply for representation

| | |
|---|---|
| Layout | Peach section, split: "JOIN STRIDE TALENT" with 3 short points on what Stride looks for and what happens next (left); the application form (right). |
| Form fields | Name\*, Email\*, Country\*, Primary platforms\* (multi-select: TikTok, Instagram, YouTube, Twitch, Podcast, Other), Social account links\* (repeatable URL fields), Content category\* (the filter list), Short introduction\* (500 characters), consent. |
| States | As B8. The success message links to Stride Education for emerging creators. |
| Mobile | Stacked. |

---

## D. Stride Education (`/education`): PDF §6 · surface white/paper · accent sun

### D1 — Hero: "EVERY CREATOR STARTS SOMEWHERE."

| | |
|---|---|
| Layout | A light hero: the headline left in large display type; right, a collage of 3 real images (creator filming, an editing session, a group workshop) overlapping slightly with a sun-yellow block behind. The supporting text sits under the headline. |
| Media | Authentic education/community photography `[B]`. Interim: the Phase 3 build uses labelled placeholders, never stock. |
| CTA | "Explore Stride Education", which scrolls to D3. A secondary "Enquire" link goes to `/education/enquire`. |
| Mobile | Headline, then one image, then the CTA. |

### D2 — Our purpose

| | |
|---|---|
| Layout | A centred editorial statement (c3–c10) adapted from the brief's own wording (Stride works inside the industry; Education makes that knowledge accessible), plus a small "from the team" signature, e.g. a founder's name and portrait if approved. |
| Mobile | Same, left-aligned. |

### D3 — What creators can learn (7 topics)

| | |
|---|---|
| Layout | A curriculum list styled like a prospectus contents page: number, topic title, a one-line outcome and an availability badge (Available now / Coming soon). Clicking a topic expands 2–3 lines of detail. |
| Topics | Getting started with content creation · UGC creation · Building a social media presence · Finding brand opportunities · Pricing and negotiating collaborations · Creating professional portfolios · Developing sustainable creator careers. |
| Data | An `educationTopics` collection with a `status` field `[B: Q11]`. |
| Mobile | The same list, full width. |

### D4 — The experience

| | |
|---|---|
| Layout | A grid of 6 items with deliberately varied sizes: Practical lessons, Industry mentoring, Creator community, Training resources, Workshops & educational calls, Relevant industry opportunities. Each item has a photo or illustration slot, a title, one line, and a clear **Available now / Planned** badge. Planned items are visually quieter (outlined, not filled). |
| Rule | "Clearly distinguish currently available benefits from future planned features" (brief §6). |
| Mobile | A single column in the same order, badges preserved. |

### D5 — Creator stories

| | |
|---|---|
| Layout | A story rail: portrait, name, a one-sentence journey (start → result) and a link to the full story (an Insights article tagged `education-story`). |
| Visibility | Hidden until real stories exist `[B]`. |

### D6 — Final CTA: "START BUILDING YOUR CREATOR CAREER."

| | |
|---|---|
| Layout | A sun-yellow section with the headline and one primary action. The action depends on Q11: "Join the waitlist" (short form: name, email, country, platforms, what you want to learn), "Enquire", or "Browse courses" (external platform link). |
| Mobile | Stacked, full-width button. |

---

## E. Other required pages (outlines)

| Page | Composition | Key content | Blocked |
|---|---|---|---|
| **Service page** ×7 `/social/services/[slug]` | Service hero (name, one-line promise, image or clip) · what it is (split editorial) · what's included (deliverables list) · related work (filtered tiles) · FAQs (3–5) · enquiry CTA with the service prefilled | Service copy per service | Copy approval; work tagged by service |
| **Our Work** `/work` | Hero title · filter bar (Industry, Service; chips, URL-synced) · mosaic of all case studies with mixed sizes · load more | 25 existing case studies (re-tagged) + new | Industry/service tags; verified results |
| **Case study** `/work/[slug]` | Full-bleed hero media + client · facts bar (client, services, industry, markets, year) · The brief · The strategy · The execution (gallery/video rail) · Results (verified figures only, with `source`) · creators involved (linked roster cards) · quote (if approved) · next case | Restructured content | Brief/strategy/results per case (Q6) |
| **Roster** `/talent/roster` | Title + live search (name) · filter chips (category, country, division) · results count · portrait grid · empty state ("No creators match. Clear filters.") | Creators collection | Country, division, consent (Q9, Q10) |
| **Creator profile** `/talent/roster/[slug]` | Portrait (4:5) + name, main category, country, platform links · biography · selected work (linked case studies or collaboration list) · "Enquire about [name]" → brand form with the creator prefilled · more creators in the category | Creator entry | Selected work data |
| **Division page** `/talent/[division]` | Division hero (image, statement) · what makes this vertical different · filtered roster grid · relevant work · apply CTA | Division entry | Division content and members (Q24) |
| **Talent apply** `/talent/apply` | Standalone version of C7 with the full form | — | Form destination (Q13) |
| **Education enquire** `/education/enquire` | Short form per Q11 + FAQs | — | Q11, Q13 |
| **About Stride** `/about` | Hero statement · business model (the three sides, one paragraph each, linking out) · mission · values (3–5, real) · international presence (markets) · founders spotlight · links to History / Team / Careers | Founders' story exists | Mission/values copy (client) |
| **Our History** `/history` | A vertical editorial timeline with year markers, a milestone headline, 1–2 sentences, a photo per milestone; sticky year indicator | Existing timeline material (2018–2026) | Reconcile with the founding year (Q1); verified milestones |
| **Our Team** `/team` | Intro · leadership row (larger) · the full team grid (filter by department optional) · optional bio drawer · careers CTA | 33 team members | Bios (optional), departments |
| **Our Sponsorships** `/sponsorships` | Intro · filter (creators / sports teams / events / community) · archive of entries (image, partner, year, description) | — | All content (Q12) |
| **Insights** `/insights` | Featured article (large) · category filter (Company news, Creator economy, Marketing insights, Education) · grid · pagination | 42 posts (re-categorised) | Category mapping approval |
| **Article** `/insights/[slug]` | Article hero (category, title, standfirst, date, author) · body (RichText, tables scroll on mobile) · aside image · related articles · share links | Existing posts | — |
| **Careers** `/careers` | Culture intro · what it's like to work here (photos) · open roles list · how to apply · placement scheme highlight | 2 jobs | Culture copy, application route |
| **Job** `/careers/[slug]` | Job hero (title, location, type, salary) · body · apply button (form or email) | Existing | — |
| **Contact hub** `/contact` | Four large route panels (Brands → Social enquiry · Established creators → Talent apply · Emerging creators → Education enquire · General → short general form below) · direct emails · socials | — | Destinations (Q13) |
| **Legal** `/privacy`, `/cookies`, `/terms` | Plain readable document layout with a table of contents | — | **Client-provided text (Q15)** |
| **404** | Short message, search-free, links to the three divisions and home | — | — |
