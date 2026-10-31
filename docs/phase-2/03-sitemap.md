# 03 — Sitemap, navigation, URLs and user journeys

## 1. Site structure

The group site is the parent. Social, Talent and Education are three sections of one site on one domain, each with its own landing page and identity. Keeping one domain concentrates SEO authority, keeps the parent logo and navigation constant (a brief requirement), and lets content cross-link (a case study links to the creators involved, a creator profile links to their selected work).

```
/                                   Stride group homepage (10 sections)
│
├── /social                         Stride Social landing
│   ├── /social/services            Services index
│   │   ├── /social/services/influencer-activations
│   │   ├── /social/services/influencer-seeding
│   │   ├── /social/services/ugc-production
│   │   ├── /social/services/tiktok-shop
│   │   ├── /social/services/tiktok-shop-livestreams
│   │   ├── /social/services/influencer-events
│   │   └── /social/services/podcast-activations
│   └── /social/enquire             Brand enquiry form (also embedded at the end of /social)
│
├── /talent                         Stride Talent landing
│   ├── /talent/roster              Searchable creator directory (filters in the URL: ?category=beauty&country=uk)
│   │   └── /talent/roster/[slug]   Creator profile
│   ├── /talent/sport               Specialist division pages (data-driven; Q24)
│   ├── /talent/travel
│   ├── /talent/podcasts
│   ├── /talent/music
│   ├── /talent/speakers
│   └── /talent/apply               Representation application form
│
├── /education                      Stride Education landing
│   └── /education/enquire          Enquiry / waitlist / enrollment route (Q11)
│
├── /work                           Our Work archive (filter: ?industry=&service=)
│   └── /work/[slug]                Case study
│
├── /about                          About Stride
├── /history                        Our History (timeline)
├── /team                           Our Team
├── /sponsorships                   Our Sponsorships (archive)
├── /insights                       Insights / Blog (filter: ?category=)
│   └── /insights/[slug]            Article
├── /careers                        Careers
│   └── /careers/[slug]             Job
├── /contact                        Contact hub: brands · established creators · emerging creators · general
│
├── /privacy  /cookies  /terms      Legal
└── /404                            Not found
```

Approximate page count at launch: 30 hand-built routes plus the collection pages (roster profiles, case studies, articles, jobs, divisions). Using today's data that is about 330 pages.

### Page hierarchy (depth and parents)

| Level | Pages | Breadcrumb |
|---|---|---|
| 0 | Home | — |
| 1 | Social, Talent, Education, Work, About, History, Team, Sponsorships, Insights, Careers, Contact, Legal | Home › Page |
| 2 | Services index, Enquire, Roster, Division pages, Apply, Case study, Article, Job, Education enquire | Home › Section › Page |
| 3 | Service detail, Creator profile | Home › Social › Services › Service |

History, Team, Sponsorships and Careers are flat URLs, but their breadcrumb shows them under "Our Group" (Home › Our Group › Team), which matches the navigation.

## 2. Navigation

### Desktop header (≥ 1024px)

```
[Stride logo]   Our Group ▾   Stride Social ▾   Stride Talent ▾   Stride Education ▾   Our Work   About   [Contact]
```

- The **logo** is always top-left and always links to `/` (brief §8).
- **Contact** is styled as the single filled button. It is the primary conversion route on every page.
- Header behaviour: transparent over full-bleed heroes, solid (navy or paper, depending on the page) after 80px of scroll. It hides on scroll down and returns on scroll up; this behaviour already exists in Phase 1.
- When inside a division, the division's nav item shows an active indicator (an accent-coloured underline), and a **division sub-bar** appears under the header (see below).

### Dropdowns (mega-menu panels)

Each panel is full-width with two zones: a link list on the left and one featured image tile on the right that changes on link hover. Panels open on hover with a short delay and on click/Enter, and close on Escape. They are keyboard navigable with arrow keys and `aria-expanded`.

| Menu | Links | Feature tile |
|---|---|---|
| **Our Group** | About Stride · Our History · Our Team · Our Sponsorships · Careers · Insights | Latest Insights article |
| **Stride Social** | Overview · Services (7 listed in a second column) · Our Work · Start a campaign → `/social/enquire` | Featured case study |
| **Stride Talent** | Overview · Creator roster · Divisions (Sport, Travel, Podcasts, Music, Speakers) · Apply for management | A rotating roster portrait |
| **Stride Education** | Overview · What you'll learn (anchor) · The experience (anchor) · Enquire | Education imagery |

`Our Work`, `About` and `Contact` are direct links. Q4 asks whether "About" should merge into "Our Group".

### Division sub-bar (inside `/social/*`, `/talent/*`, `/education/*`)

A slim second row, 44px tall, sticky with the header, in the division's surface colour:

```
STRIDE SOCIAL     Services   Our Work   Approach            [Start a campaign]
STRIDE TALENT     Roster   Divisions   Creator stories      [Apply for management]
STRIDE EDUCATION  What you'll learn   The experience   Stories   [Enquire]
```

It tells visitors where they are, gives one-click access to the division's key pages, and keeps the division CTA visible. Switching division happens in the main nav, with no need to return to the homepage (brief §8).

### Mobile (< 1024px)

- The header shows the logo, a compact division chip when inside a division (e.g. "Talent"), and a menu button.
- The menu opens a full-screen overlay. Its top level is the main nav items as large type; tapping a division expands an accordion with its links. Contact is a full-width button at the bottom, with social links.
- The division sub-bar becomes a horizontal scroll strip under the header, or collapses into the chip; this will be tested on device in Phase 3.

### Footer (all pages, dark navy, brief §3.10)

| Column | Content |
|---|---|
| Group | About · History · Team · Sponsorships · Careers · Insights |
| Stride Social | Overview · Services · Our Work · Start a campaign |
| Stride Talent | Overview · Roster · Divisions · Apply |
| Stride Education | Overview · Enquire |
| Contact | Brand enquiries · Creator applications · Education · General. Socials (Instagram, LinkedIn, TikTok if approved). WeChat QR, if the client wants it kept. |
| Base row | Logo · legal entity line · Privacy · Cookies · Terms · Cookie settings · © year |

The legal entity text and company number come from the client (Q15). The current line reads "© Stride Global Holdings Pte. Ltd - 202527987G".

## 3. Proposed URL structure — rules

- Lowercase, hyphenated, no trailing slash, no `.html` (as today).
- Divisions are path prefixes (`/social`, `/talent`, `/education`), not subdomains: one domain and one sitemap (Q23 covers a possible group domain).
- Collections use human slugs: `/work/govee`, `/talent/roster/alchemistlyy`, `/insights/influencer-marketing-trends-2026`.
- Filters live in query parameters (`/work?industry=technology&service=ugc-production`), so filtered views are shareable. The canonical URL points at the unfiltered page.
- Future locales are prefixed (`/zh/…`, `/de/…`). English stays unprefixed ([06](06-content-architecture.md) §6).

## 4. Page templates and reusable components

Templates define page compositions; components are the shared blocks they are built from. The four landing pages are deliberately **not** templates: each is composed by hand ([05](05-wireframes.md)).

| Template | Used by | Core components |
|---|---|---|
| `LandingGroup` (one-off) | `/` | HeroMontage, ThreeSides, SplitEditorial, DivisionIndex, WorkMosaic, PeopleMosaic, PhotoStory, InsightsTrio, MarketsDisplay, RoutesCTA |
| `LandingSocial` (one-off) | `/social` | HeroCampaign, LogoStrip, SplitEditorial, ServiceIndex, IndustryRail, WorkFeature, ApproachSteps, EnquiryForm |
| `LandingTalent` (one-off) | `/talent` | HeroPortraits, IntroStatement, ServiceList, RosterPreview, CreatorStories, DivisionIndex, ApplyCTA |
| `LandingEducation` (one-off) | `/education` | HeroCommunity, PurposeSplit, CurriculumList, ExperienceGrid (with Available / Coming soon badges), StoriesSlot, EnquiryCTA |
| `ServicePage` | 7 service pages | ServiceHero, SplitEditorial, Deliverables, WorkFeature (filtered by service), FAQ, EnquiryCTA |
| `DivisionPage` | 5+ talent divisions | DivisionHero, statement, RosterGrid (filtered), work/collabs, ApplyCTA |
| `ArchivePage` | Work, Insights, Roster, Sponsorships | ArchiveHero, FilterBar, MasonryGrid / RosterGrid, Pagination or Load more |
| `CaseStudyPage` | Case studies | CaseHero, FactsBar (client, services, markets, year), Brief, Strategy, Execution gallery, ResultsBand (verified only), CreatorsInvolved, Quote, NextCase |
| `ProfilePage` | Creator profiles | ProfileHero (portrait + name + category + country), PlatformLinks, Bio, SelectedWork, EnquiryCTA |
| `ArticlePage` | Insights articles, jobs | ArticleHero, Meta, RichText, Aside, RelatedArticles |
| `ContentPage` | About, History, Team, Careers, Legal | PageHero plus the page's own section components |
| `FormPage` | Social enquire, Talent apply, Education enquire, Contact | FormLayout, Field components, ConsentNotice, SuccessState |

Global components: `SiteHeader`, `MegaMenu`, `DivisionBar`, `MobileMenu`, `SiteFooter`, `Breadcrumbs`, `Button`, `Link`, `Eyebrow`, `Media` (responsive image/video with poster and pause control), `PlaceholderNotice`, `Seo`.

## 5. Redirects from current URLs

Every current URL either stays the same or gets a permanent (301) redirect to its closest new equivalent, so search rankings and shared links survive. The full map lives in a single `redirects` config ([07](07-technical-architecture.md) §5).

| Current URL | New URL | Notes |
|---|---|---|
| `/` | `/` | Same URL, new group homepage. |
| `/about` | `/about` | Same. |
| `/contact` | `/contact` | Same. |
| `/careers` | `/careers` | Same. |
| `/our-services` | `/social/services` | |
| `/influencer-strategies` | `/social/services` | Strategy list merges into services. |
| `/influencer-seeding` | `/social/services/influencer-seeding` | |
| `/case-studies` | `/work` | Q16 |
| `/case-studies/[slug]` | `/work/[slug]` | Slug kept 1:1 (25 URLs). |
| `/creators` | `/talent/roster` | Q16. Pagination parameters are dropped. |
| `/creators/[slug]` | `/talent/roster/[slug]` | 1:1 (227 live profiles). The 3 sitemap 404s stay gone. |
| `/blog` | `/insights` | Q16 |
| `/blog/[slug]` | `/insights/[slug]` | 1:1 (42). |
| `/meet-the-team` | `/team` | |
| `/jobs/[slug]` | `/careers/[slug]` | 1:1 (2). |
| `/creator-sign-up` | `/talent/apply` | |
| `/zh`, `/zh/*` | Q17: keep (future translation) or redirect to the English equivalent | ~265 URLs. |

If the client prefers to keep `/case-studies`, `/creators` and `/blog` as they are (Q16), the new templates mount there instead. Nothing else in the plan changes.

## 6. User journeys

### Brand marketer (primary commercial audience)

1. Arrives on `/` from search or a referral, or directly on a service page (e.g. "TikTok Shop agency UK").
2. "Three sides of Stride" → **Stride Social** panel → `/social`.
3. Logo strip and featured campaigns build trust → opens a case study `/work/govee` → reads the brief, execution and verified results.
4. Checks the matching service `/social/services/ugc-production` → sees related work.
5. "Talk To Stride Social" → `/social/enquire`. The form is prefilled with the service when it came from a service page → success state with next steps.

Shortcuts: the sub-bar "Start a campaign" button on every Social page, and Contact → Brands.

### Established creator (seeking representation)

1. Arrives on `/` or directly on `/talent` (Instagram bio link, search "UK talent management").
2. Hero, "Your career. Our commitment." and creator stories → `/talent/roster` (sees peers in their niche, filtered by category or country).
3. Reads a profile to understand how Stride presents talent.
4. "Apply for management" → `/talent/apply` → success state that sets expectations (no promised response time unless the client confirms one).

### Emerging creator (learning)

1. Arrives on `/`, or via an Education social post → `/education`.
2. Purpose → what you'll learn → the experience, with clear *Available now* and *Coming soon* labels.
3. "Start building your creator career" → `/education/enquire` (waitlist, enquiry or enrollment, depending on Q11).
4. Cross-route: an applicant to `/talent/apply` who lacks the required audience is shown a link to Education in the success message.

### Brand or agency booking a specific creator

`/talent/roster` → filter → profile → "Enquire about [name]" → `/social/enquire?creator=slug`, a brand form with the creator preselected. Brand deals for talent and campaign enquiries go to the right team (routing confirmed in Q13).

### Press, partners and community organisations

`/` → About / History / Team / Sponsorships → Contact → General.

### Job seekers

Footer or Our Group → `/careers` → job → apply (an email or form route, confirmed in Q13).
