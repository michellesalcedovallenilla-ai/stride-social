# Stage 2 — Content model and migration

Branch: `feature/stage-2-content-model`. Review gate: **Gate 2**, the client reviews the content map (docs/phase-2/08-roadmap.md).

## What was built

The Phase 3 content model from `docs/phase-2/06-content-architecture.md`, filled with everything that can honestly be carried over from the previous site. Nothing is invented. Mappings that need Stride's approval are marked `proposed`. Facts copied from the old site are marked `legacy`: they were public before, and must be re-confirmed before launch.

| Collection | Location | Entries | Source |
|---|---|---|---|
| Categories | `src/content/taxonomies/categories.yaml` | 10 | Brief §5 roster filters |
| Industries | `taxonomies/industries.yaml` | 8 | Brief §4 |
| Markets | `taxonomies/markets.yaml` | 5 | Brief §3.9 / §5 (UK, US, CA, DE, FR as talent markets, marked verified). No offices or team locations until Stride confirms (Q3). |
| Services | `services/*.md` | 7 | Names and one-line descriptors from the brief. Bodies are **drafts copied verbatim** from the old site where copy existed (sources noted in each file). Podcast Activations has no copy (`needed`). |
| Talent divisions | `talent-divisions/*.md` | 5 | Brief. All `coming-soon`: no creators are assigned to divisions yet (Q24). |
| Education topics / experience | `education/*.yaml` | 7 + 6 | Brief. All `unconfirmed`: availability must come from Stride (Q11). |
| Brands | `brands/brands.yaml` | 44 | 20 logos from the old site + 20 other case-study clients + 4 partners named in the brief (Samsung, Barsys, Adobe, P&G) |
| Team | `team/*.yaml` | 33 | Old Meet the Team page (names, roles, photos) |
| Testimonials | `testimonials/*.yaml` | 6 | Old homepage quotes (consent `legacy`) |
| Roster | `roster/*.md` | 230 | Old creator profiles |
| Work | `work/*.md` | 25 | Old case studies, split into brief/strategy/execution/results where the old copy had labelled paragraphs |
| Insights | `insights/*.md` | 42 | Old blog posts |

Legacy collections stay in place, so the remaining Phase 1 pages keep working until their stage replaces them. The new navigation's feature tiles already read from the new `insights` and `work` collections.

**Status model:**

| Field | Values |
|---|---|
| `consent` | confirmed / legacy / none |
| `verification` | verified / legacy / unverified |
| `categoryStatus`, `tagStatus` | proposed / approved |
| `copyStatus` | approved / draft / needed |
| `contentStatus` | complete / needs-input / needs-rewrite |

`npm run check:content` lists everything still open and verifies that every cross-reference resolves. With `--strict` it becomes the launch gate.

**Also in this stage:** the 51 asset filenames longer than 60 characters were shortened (references updated, build and links verified), which fixes the Windows checkout problem.

## Current open-item report (`npm run check:content`)

| Count | Item |
|---|---|
| 230 | Roster: consent not confirmed |
| 230 | Roster: category mapping proposed |
| 24 | Roster: no main category (none on the old site) |
| 230 | Roster: no country (the old site had none) |
| 3 | Roster: no portrait (old site showed Webflow's stock placeholder) |
| 230 | Roster: follower figures not verified |
| 25 | Work: brief/strategy/execution incomplete |
| 25 | Work: industry/service tags proposed |
| 55 | Work: result figures not verified |
| 25 | Work: quotes not verified |
| 42 | Insights: category proposed |
| 7 | Services: copy not approved |
| 5 | Divisions: copy not approved |
| 20 | Brands: logo display not confirmed |
| 6 | Testimonials: consent not confirmed |
| 13 | Education: availability unconfirmed |

## Mappings for Stride to approve (Gate 2)

### 1. Creator categories → new roster filters

| Current category | Proposed filter | Creators |
|---|---|---|
| Lifestyle | lifestyle | 47 |
| Entertainment | other | 47 |
| Tech reviews | technology | 44 |
| Amazon finds | lifestyle | 24 |
| *(none)* | *(none — needs a category)* | 24 |
| Beauty | beauty | 13 |
| Fashion | fashion | 6 |
| Gaming | technology | 6 |
| Cleaning | lifestyle | 6 |
| Comedy | other | 4 |
| Family | lifestyle | 4 |
| Home | lifestyle | 2 |
| Travel | travel | 2 |
| Food review | lifestyle | 1 |

No current creator maps to Sport, Music, Podcasts or Speakers. Those filters (and the matching talent divisions) stay empty until Stride assigns creators. Each creator's original category is kept in `legacyCategory`.

### 2. Case studies: proposed tags and content state

Service tags for Glam AI, Greene King, Comfelie, Holafly, TrainPal, Meta, Govee (Influencer Activations), Papaya Gaming and Temu (UGC Production) come from Stride's own old Influencer Strategies page. All other service tags are a proposed default (Influencer Activations), and every industry tag is proposed.

| Case study | Client | Proposed industries | Service | Content | Result figures |
|---|---|---|---|---|---|
| Airup | airup | lifestyle | influencer-activations | needs-input | 3 |
| AliExpress | aliexpress | lifestyle | influencer-activations | needs-input | 3 |
| Aliexpress (second) | aliexpress | lifestyle | influencer-activations | needs-input | 3 |
| Anker | anker | technology | influencer-activations | needs-input | 3 |
| Bloom | bloom | lifestyle | influencer-activations | needs-input | 3 |
| C2 Gripz | c2-gripz | — | influencer-activations | needs-input | 3 |
| Comfelie | comfelie | fashion | influencer-activations | needs-input | 0 |
| Glam AI | glam-ai | technology | influencer-activations | needs-rewrite | 0 |
| Govee | govee | home, technology | influencer-activations | needs-input | 3 |
| Greene King | greene-king | lifestyle | influencer-activations | needs-input | 0 |
| Holafly App | holafly | travel | influencer-activations | needs-rewrite | 1 |
| Jackery | jackery | technology | influencer-activations | needs-input | 3 |
| Laifen | laifen | beauty, technology | influencer-activations | needs-input | 3 |
| Mars Group | mars | lifestyle | influencer-activations | needs-input | 3 |
| Meta | meta | technology | influencer-activations | needs-input | 3 |
| Narwal | narwal | home, technology | influencer-activations | needs-input | 3 |
| Overdub App | overdub | technology | influencer-activations | needs-rewrite | 0 |
| Papaya Gaming | papaya-gaming | technology | ugc-production | needs-rewrite | 0 |
| Rhinoshields | rhinoshields | technology | influencer-activations | needs-input | 3 |
| Ring | ring | home, technology | influencer-activations | needs-input | 3 |
| Temu | temu | lifestyle | ugc-production | needs-rewrite | 0 |
| Tooletries | tooletries | home | influencer-activations | needs-input | 3 |
| TrainPal | trainpal | travel | influencer-activations | needs-input | 3 |
| True Classic | true-classic | fashion | influencer-activations | needs-input | 3 |
| XGIMI | xgimi | technology, home | influencer-activations | needs-input | 3 |

What the content states mean:

- **needs-input (20):** the old copy had labelled "Client background / Objectives / Execution / Results" paragraphs, now split into fields. **None had a strategy section**, so strategy is empty everywhere and needs Stride's input.
- **needs-rewrite (5):** the old copy had no labelled sections. The original text is kept in each file's body for the editorial rewrite.
- **Homepage "Our work" (brief §3.5):** Laifen, Govee and XGIMI are flagged `featuredOn: home` in the brief's order (3, 4, 5). **Samsung and Barsys have no case studies** because there is no material for them yet (Q6).

### 3. Insights categories

| Current | Proposed | Posts |
|---|---|---|
| News | marketing-insights | 37 |
| Industry | creator-economy | 4 |
| Our work | company-news | 1 |

No post is tagged "education" yet.

### 4. Team departments (derived from job titles)

| Role contains | Department |
|---|---|
| Founder / Head of | leadership |
| Talent | talent |
| Campaign / Influencer marketing / Seeding | campaigns |
| Social media | social |
| Sales / Business | sales |

The team list holds first names only (e.g. "Alex", "Ollie"). Leadership bios and full names are needed for the Team page.

### 5. Brand logos

The 20 logos from the old logo strip were identified as:

> Student Minds, Blitz, *unidentified (logo 03, a "Gn" app icon)*, Genshin Impact, Voodoo, Azar, Fairy, Anker, Bloom, Zovoo, AliExpress, Tooletries, Tinder, Bulldog Skincare, ACE, NordVPN, Bolt, Manscaped, Cash App, Merge Gardens.

All are `legacy` until Stride confirms each one may still be displayed. The brief's examples Samsung, Adobe, P&G, Govee, XGIMI and Temu exist as brand entries **without logos**. Vector files are needed (Q5).

## Findings worth knowing

- **Case-study quotes are not campaign quotes.** Every old case study showed one of the six general testimonials. All 25 are marked `unverified`, and the new case study template will not present them as client quotes unless Stride confirms one.
- **Blog author.** All 42 posts name "Alex Hendy". They are not linked to the team profile "Alex" (Head of Talent & New Business), because that cannot be confirmed from the data. `authorName` is kept.
- **Service copy.** Six services have draft bodies taken from Stride's own old copy. The TikTok Shop draft uses the old "Influencer Affiliate program" text, so Stride should confirm it describes TikTok Shop. Mobile Game & App Ambassadors and Social Media Management have no place in the new list (Q8); their old copy remains in the legacy data.
- **Alt text** for migrated images is generic ("Portrait of {name}", "{client} campaign"). An editorial pass is recommended as images are replaced.

## Gate 2 decisions for Stride

1. Approve or adjust the creator category map, and assign categories to the 24 uncategorised creators.
2. Confirm roster scope (managed only, or managed + UGC partners; Q9) and public-profile consent (Q10).
3. Supply countries (and divisions, where relevant) per creator.
4. Approve the case-study industry and service tags; supply a strategy (and missing briefs or results) per case study; confirm which result figures are verified.
5. Approve the insights category map.
6. Confirm which of the 20 logos may still be shown, identify logo 03, and send vector logos for the brief's partners.
7. Confirm testimonial consent.
8. Confirm Education availability (Q11) and talent division launch scope (Q24).
