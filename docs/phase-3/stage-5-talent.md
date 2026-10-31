# Stage 5 — Stride Talent

Branch: `feature/stage-5-talent`. Review gate: **Gate 5**, the Talent review plus the talent team confirming roster data accuracy (docs/phase-2/08-roadmap.md).

**Gate 5 (Talent review) approved by the owner on 2026-10-31.** The talent team's roster data check and creator consent are still owed before launch; production shows confirmed-consent creators only until then.

## What was built

### `/talent` landing: the seven sections from the brief (PDF §5)

Copy lives in `src/content/pages/talent.yaml`.

| # | Section | Composition | Data | State |
|---|---|---|---|---|
| C1 | More than management. | A wall of 14 roster portraits in six columns, neighbouring columns drifting in opposite directions. The headline sits on a clear paper band across the middle. One button pauses the drift; reduced motion keeps it still. Phones show two columns with the band at the bottom. | Copy file (brief verbatim) · `featured` roster ids | **Interim:** portraits are legacy-consent roster photos, labelled. In production only confirmed-consent portraits are used; with none, the band stands alone on peach. |
| C2 | Introduction | One large statement, plus the five talent markets as labels | Copy file · `markets` (verified) | **Draft**, with "since 2022" and "more than 600" taken from the brief; both to be confirmed (Q1, Q2). |
| C3 | Your career. Our commitment. | Magazine spread: a sticky heading, and the 8 services as numbered entries with one plain sentence each | Copy file | Service names verbatim; sentences **draft**. Two candid photo frames are awaited (Q18): preview only. |
| C4 | Creator roster. | Category chips above a 4-column portrait grid of 12 creators. Chips filter inline; "See Full Roster" carries the chosen category into the directory. | `roster` | Chips only for categories that have creators. Preview lists the brief's categories with nobody mapped yet (Sport, Music, Podcasts, Speakers). |
| C5 | Creator experiences. | One large serif quote at a time with portrait, name and previous/next | `testimonials` (type creator) | Shown only with 2+ publishable quotes. Preview shows the three legacy quotes (Jack Chalmers, Justice Buys, Sam Shan Shops), labelled for consent re-confirmation. Production needs confirmed consent. |
| C6 | Divisions. | Five tall cards with names running up each card; the hovered card widens. Phones get stacked bands. | `talentDivisions` | All five are coming soon, so there are no links and no member counts (Q24). |
| C7 | Join Stride Talent. | Peach split: three short points on the left, the application form on the right | Copy file | Points and form copy are **draft**. |

### Other pages

| Page | Notes |
|---|---|
| `/talent/roster` | Name search, category chips with counts, a live results count, portrait grid, "Load more" (24 at a time) and an empty state. Category and search stay in the URL (`?category=beauty&q=amy`). Without JavaScript, every creator is listed. |
| `/talent/roster/[slug]` (230 in preview) | Sections: portrait · category and country · platform links · "Enquire about [name]" · biography (old-site bios, spacer paragraphs removed) · selected work · more creators in the same category. Missing country, bio and selected work are labelled in preview. Structured data: `ProfilePage`/`Person`. |
| `/talent/[division]` (5) | Holding pages while each division is coming soon: noindex, no invented members or copy, with routes to the roster and the application form. The full template (about, creators, CTA) renders once a division is marked active. |
| `/talent/apply` | The application form on its own page. |

### Talent application form

- **Fields:** name, email, country, content category (the 10 brief categories), primary platforms (TikTok, Instagram, YouTube, Twitch, Podcast, Other), social account links, short introduction (500 characters with a live count), consent notice.
- **Social links:** two rows show, and "Add another link" reveals up to five (all five show without JavaScript).
- **States:** the same as the brand form: validation, sending, success, failure with retry, an "email us" panel until a destination is set (`PUBLIC_TALENT_APPLICATION_ACTION`, Q13), and the spam checks.
- **Success message:** points emerging creators to Stride Education.
- **Server validation:** `src/lib/forms/talent-application.ts`.
- **Replaces:** the Typeform behind `/creator-sign-up`, once Stride confirms (Q13). The old page stays until the Stage 8 redirects.

### Consent rule for the roster (`src/lib/roster.ts`)

Every listing, profile, link and portrait goes through one function:

- **Preview:** shows confirmed and legacy-consent creators. Legacy means public on the old site, to be re-confirmed.
- **Production:** shows confirmed consent only.
- **Today:** no creator is confirmed, so a production build has no profiles. The roster page says it is being updated, and the landing drops the roster preview, quotes and portrait wall. Profiles can never be linked without being built. The header's roster tile now picks a published creator, or falls back to the roster page.

### Also changed

- **One form system:** `core/FormShell`, `core/CheckboxGroup` and `src/scripts/system/form.ts` replace the Social-only form script. `Field` gained an id override, client error messages, a live counter, a prefill option and a hidden-label option.
- **Brand form names the creator:** when it comes from a profile, it shows "Enquiry about [name]".
- **Page intro:** `PageIntro` moved to `global/` and follows the division surface (navy for Social, paper for Talent).
- **Links and planned pages:** `routes.creator` now points to `/talent/roster/[slug]`, and the Talent pages are removed from `plannedPages`.
- **Copy schema:** page copy sections accept `featured` (hand-picked entry ids, here the hero portraits).

## Checks run

| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| Build | 596 pages (preview: includes the 230 profiles); 43,922 internal references, 0 broken |
| Horizontal overflow and clipped headings | None at 320, 360, 390, 430, 768, 1024 and 1440px on `/talent`, `/talent/roster`, two profiles with long handles, a division page, `/talent/apply`, plus `/`, `/social`, `/work` and a service page |
| Behaviour (34 checks) | All pass. Roster: first page, chips, search, empty state, clear, load more (focus moves), URL filter. Landing: preview chips and roster link, quotes previous/next, portrait pause control. Application form: errors, focus, group error, link validation, add-a-link, counter, unavailable/success/education link, posted fields. Profile → brand form names the creator. Reduced motion: wall still, control hidden. |
| Stage 4 behaviour (36 checks) | All still pass on the shared form script |
| Accessibility structure | Pass on all Talent pages, plus `/social` and `/social/enquire`. Header keyboard/focus checks: 12/12. |
| Production build | 366 pages: no profiles, portrait wall, quotes or awaiting-photo frames. Draft copy and the form-destination labels remain, so the strict placeholder check correctly blocks release. |

## Open items for Stride (Gate 5)

- **Roster accuracy** (the gate itself): the talent team checks names, categories (the mapping is proposed), countries (missing for all 230) and portraits.
  - **Q9:** should partner/UGC creators (127 of 230) be listed?
  - **Consent:** confirmation for every creator who stays.
- **Figures** (Q1, Q2): confirm "since 2022" and "more than 600 creators".
- **Copy sign-off:** the intro, the 8 service sentences, the roster line, and the application points and form copy.
- **Hero portraits:** approve the 14 picked for the wall, or supply portrait clips.
- **Creator quotes:** consent for Jack Chalmers, Justice Buys and Sam Shan Shops, plus more quotes or video testimonials.
- **Divisions** (Q24): which divisions launch, their copy, imagery and members.
- **Photography** (Q18): candid shots of talent managers with creators.
- **Selected work** (Q10): link creators to case studies, or supply collaboration lists.
- **Form destination** (Q13): where applications go, and whether the Typeform at `/creator-sign-up` is retired.
