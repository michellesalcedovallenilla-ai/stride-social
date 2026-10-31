# Stage 6 — Stride Education

Branch: `feature/stage-6-education`. Review gate: **Gate 6**, the Education review plus the client confirming every Available/Planned statement (docs/phase-2/08-roadmap.md).

**Gate 6 (Education review) approved by the owner on 2026-10-31.** The Available/Planned confirmations (Q11) are still owed; until then production omits the topics and experience sections.

## What was built

### `/education` landing: the six sections from the brief (PDF §6)

Copy lives in `src/content/pages/education.yaml`.

| # | Section | Composition | Data | State |
|---|---|---|---|---|
| D1 | Every creator starts somewhere. | Light hero: headline and supporting line on the left; on the right, a collage of three frames (creator filming, editing session, group workshop) overlapping a sun-yellow block. "Explore Stride Education" scrolls to the topics; "Enquire" goes to the form. | Copy file (brief verbatim) | No education photography exists and stock is ruled out, so preview shows three labelled frames and production keeps only the yellow block (Q18). |
| D2 | Our purpose | Centred statement: the first sentence in serif italic, the second larger in the display face | Copy file (brief verbatim) | A "from the team" signature can join once one is approved. |
| D3 | What creators can learn. | Prospectus contents page: number, topic, one-line outcome, dotted leader, availability label | `educationTopics` | The 7 topics are verbatim; outcome lines are **draft**. |
| D4 | The experience. | Six items in varied sizes (one large block, four regular, one wide band), each with an image slot, title, one line and availability. Available items are filled (sun); planned items are outlined. | `educationExperience` | Item names verbatim; lines **draft**. |
| D5 | Creator stories. | Story rail: portrait, quote, name | `testimonials` (type student, confirmed consent) | No stories exist. Preview shows a labelled note; production leaves the section out. |
| D6 | Start building your creator career. | Sun-yellow section with one action | Copy file | The action is "Enquire" → `/education/enquire`. Its label and link sit in the copy file, so a waitlist or course link (Q11) is a copy change. |

### Availability rule (`src/lib/education.ts`)

The brief asks to "clearly distinguish currently available benefits from future planned features":

- An item shows "Available now" or "Coming soon" only once its `status` is `available` or `planned`.
- All 13 items are still `unconfirmed`. Preview labels each one "Availability to confirm (Q11)"; production leaves them out entirely, so the site never guesses.
- **Today's production page:** hero, purpose and the closing call to action only. The topics and experience sections appear as soon as Stride confirms statuses.

### `/education/enquire`

- **Form fields:** name, email, country (required), plus optional platforms, the topics they want to learn (all 7, since asking doesn't claim a topic is offered) and a message with a live count.
- **Behaviour:** the same states and spam checks as the other forms, through the shared form system.
- **Destination:** `PUBLIC_EDUCATION_ENQUIRY_ACTION` (Q11, Q13).
- **Server validation:** `src/lib/forms/education-enquiry.ts`.
- **FAQs:** a labelled placeholder in preview, omitted in production.

### Also changed

- **Education items:** they now carry `copyStatus`, and `check:content` reports unapproved education copy.
- **Navigation:** the Education routes are removed from `plannedPages`; the homepage panel, the header mega menu and the division bar now land on real pages.

## Checks run

| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| Build | 596 pages; 43,925 internal references, 0 broken |
| Horizontal overflow and clipped headings | None at 320, 360, 390, 430, 768, 1024 and 1440px on `/education` and `/education/enquire` |
| Behaviour (12 checks) | All pass: 7 topics and 6 items listed; no availability badge while unconfirmed (13 labels instead); division-bar anchors exist; "Explore" scrolls to the topics; the final CTA links to the form; the form validates only required fields, counts characters, shows the unavailable/success panels and posts the chosen topics; no console errors |
| Accessibility structure | Pass on both pages |
| Production build | Topics, experience, stories, photo frames and FAQs omitted. Draft copy and the form-destination label remain on `/education/enquire`, so the strict placeholder check correctly blocks release. |

## Open items for Stride (Gate 6)

- **Q11, the offer itself:**
  - which of the 7 topics and 6 experience items are available today, and which are planned (the gate itself);
  - format (cohorts, on-demand, calls), price, and where enrollment happens;
  - whether the final action is a waitlist, an enquiry or a course link.
- **Copy sign-off:** the topic outcome lines, the experience lines and the enquiry copy; FAQs.
- **Photography** (Q18): a creator filming, an editing session, a group workshop, plus one image per experience item.
- **Creator stories:** real student stories with consent.
- **Form destination** (Q13).
