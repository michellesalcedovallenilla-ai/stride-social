# Stage 4 — Stride Social

Branch: `feature/stage-4-social`. Review gate: **Gate 4**, the Social review plus a test submission received in Stride's inbox or CRM (docs/phase-2/08-roadmap.md). The second half is blocked until Stride names the form destination (Q13) and the host (Q21).

**Gate 4 (Social review) approved by the owner on 2026-10-31.** The test submission is still owed: it happens once Q13 and Q21 are answered, before launch.

## What was built

### `/social` landing: the eight sections from the brief (PDF §4)

Copy lives in `src/content/pages/social.yaml`.

| # | Section | Composition | Data | State |
|---|---|---|---|---|
| B1 | The right creators. Real impact. | Navy hero. Headline left, subheading and both buttons below. Three staggered vertical clips sit on the right behind one pause control; phones show one clip full-bleed. | Copy file (brief verbatim) | Interim footage (the old site's live-campaign clips, labelled) |
| B2 | Trusted by brands | One row of logos in the accent colour on a slow marquee that pauses on hover. Under reduced motion it becomes a static grid. | `brands` | **Interim:** the 20 logos from the old site show in preview, labelled. Production shows only `approval: confirmed`, and none are confirmed yet, so the section is left out (Q5). Samsung, Adobe, P&G, Govee, XGIMI and Temu have no logo file yet. |
| B3 | Influence is more than a post. | Type-led editorial split | Copy file | **Draft** body. Proof points stay out until the old figures are re-verified (Q7). |
| B4 | Our services. | Typographic index of the 7 services. On desktop each row reveals its image beside the cursor; phones show a thumbnail. | `services` | Names and descriptors are verbatim from the brief. |
| B5 | Industries we work in. | Horizontal rail of 8 tall tiles with arrows and snap. Each tile shows a real campaign image and its case study count, and links to the filtered archive. | `industries` + `work` | Sport and Trades & Construction have no case study, so they get text-only tiles with no link. |
| B6 | Featured campaigns. | Full-width spreads with alternating sides: image, client, summary, services, industry | `work` with `featuredOn: social` | **Proposed selection:** Temu, Holafly and Comfelie (none of them is on the homepage). Result figures are shown only when verified, so preview labels them as awaiting verification. |
| B7 | Our approach. | Four chapters. On desktop the section pins and they move sideways as you scroll; phones, tablets and reduced motion get a vertical stack. | Copy file | **Draft** chapter copy, adapted from the old site's process copy. Stage photography is awaited (Q18): preview shows labelled frames, production omits them. |
| B8 | Your next campaign starts here. | Ice section: the headline and "Talk To Stride Social" lead straight into the inline brand enquiry form. | Copy file | Headline and button are verbatim; the form copy is **draft**. |

### Other pages

| Page | Notes |
|---|---|
| `/social/services` | Intro plus the same typographic index. |
| `/social/services/[slug]` (7) | Sections: hero (name, the brief's promise, image) · what it is · what's included · related work · questions · next service · enquiry CTA with the service prefilled. Descriptions are the old site's copy and deliverables are drafted from it (**draft**). Podcast Activations has no copy yet. Missing FAQs, deliverables or related work show labelled placeholders in preview and are omitted in production. |
| `/social/enquire` | The brand enquiry form on its own page. Prefills `?service=` and `?creator=`. |
| `/work` | All 25 case studies in a mixed-size mosaic. Filter chips (industry, service) stay in sync with the URL (`/work?industry=travel`), with an empty state and "Load more" (12 at a time). Without JavaScript, every case study is listed. |
| `/work/[slug]` (25) | Sections: full-bleed hero · facts bar · brief / strategy / execution · campaign video rail (click to play, no autoplay) · results · creators · quote · next case · CTA. **Results render only when verified, with their source.** Unverified figures and the old site's original copy appear only in preview, labelled, because they contain figures nobody has confirmed. Structured data: `CreativeWork`. |

### Brand enquiry form

- **Fields:** name, company, work email, market (UK, US, Canada, Germany, France, Other), service (the 7 services plus "Not sure yet"), estimated budget (optional, free text until Stride confirms ranges), brief, consent notice.
- **Behaviour:**
  - inline validation on submit, then live as fields are fixed;
  - errors linked through `aria-describedby`, focus moves to the first problem, and the number of problems is announced;
  - a sending state; a success panel ("Thanks, {name}. Our team will be in touch.");
  - on failure, an error message that keeps the input and offers retry plus a direct email.
- **Spam:** a honeypot field and a time-to-submit check, both re-checked server-side. Cloudflare Turnstile is to be added once a host is chosen (Q21).
- **Server validation:** `src/lib/forms/brand-enquiry.ts` (zod) uses the same field definitions as the page (`src/config/forms.ts`), ready for the host's form function.
- **Destination:** `PUBLIC_BRAND_ENQUIRY_ACTION`, still empty (Q13). Until it is set, the form says so: preview shows a labelled notice, and on submit a "temporarily unavailable, email us" panel appears. Without JavaScript the form opens the visitor's mail app. The label blocks a production release.

### Also changed

- **Case study links:** `routes.caseStudy` now points to `/work/[slug]`, which covers the homepage tiles and the header's featured case study. If Stride keeps the old URLs (Q16), only `src/lib/routes.ts` changes.
- **Planned pages:** the five built routes are removed from `plannedPages`.
- **Phase 1 pages:** `/case-studies/*`, `/our-services`, `/influencer-strategies` and `/influencer-seeding` stay until the redirect map ships in Stage 8, which is tested against the old sitemap.
- **Content proposals (for the Gate 2 review):**
  - Comfelie is also tagged `tiktok-shop`, since its summary is about TikTok Shop.
  - The services gain draft deliverables, plus the images the old site used for each service.
- **Core components:**
  - `Chip` has a `tone` (dark surfaces).
  - `Field` always renders its error line, so client validation can fill it.
  - Placeholder blocks take the colour of their surface.
  - The list reset has zero specificity, so `.container-wide` (a new helper) can pad lists.
- **Hero clips:** no transform animation. Chromium painted a playing video above the fixed header when an ancestor animated its transform.

## Checks run

| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| Build | 366 pages; 16,351 internal references, 0 broken |
| Horizontal overflow and clipped headings | None at 320, 360, 390, 430, 768, 1024 and 1440px on `/social`, `/social/services`, three service pages, `/social/enquire`, `/work`, four case studies and `/` |
| Behaviour (36 checks) | All pass: form prefill, validation, focus, sending/success/failure, honeypot; archive URL filter, combined filters, empty state, clear, load more; hero pause control; hover preview; rail arrows; pinned approach; reduced motion (not pinned, clips paused) |
| Accessibility structure | One `h1`, no heading skips, every image has `alt`, every link and button is named, every control is labelled, no duplicate ids, valid `aria-labelledby`: pass on all new pages. Header keyboard/focus checks: 12/12 pass. |
| Production build | Logos, awaiting-photo frames, unverified results, original copy and empty FAQ/work placeholders are all omitted. Draft copy, interim footage and the form-destination label remain, so the strict placeholder check correctly blocks release. |
| Content report | References resolve. New draft page sections: `social.intro`, `social.servicesPage`, `social.approach`, `social.enquiry`, `work.hero`. |

## Open items for Stride (Gate 4)

- **Form destination and host** (Q13, Q21): the inbox or CRM for brand enquiries, response-time wording, and the budget ranges (if wanted). Then a test submission closes the gate.
- **Logos** (Q5): which of the 20 legacy logos may be shown, plus vector files for Samsung, Adobe, P&G, Govee, XGIMI and Temu.
- **Copy sign-off:** the intro, approach chapters, form copy, services intro and Our Work line; the 7 service descriptions and deliverables; Podcast Activations copy; FAQs per service.
- **Featured campaigns:** confirm Temu, Holafly and Comfelie, or swap them.
- **Case studies** (Q6): verified results with sources, plus brief/strategy/execution for every case study. Five need a full rewrite: Temu, Holafly, Overdub, Papaya Gaming and Glam AI.
- **Campaign media** (Q18): a campaign reel for the hero, and photography for the four approach stages.
- **Industries:** case material for Sport and Trades & Construction.
- **URL moves** (Q16): approve `/case-studies` → `/work` (the redirects ship in Stage 8).
