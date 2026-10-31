# 02 — Requirements analysis and missing information

The source document is **"Stride Social Site.pdf"** (15 pages). Its numbered sections run from 3 to 10:

| Section | Topic |
|---|---|
| 3 | Main homepage |
| 4 | Stride Social |
| 5 | Stride Talent |
| 6 | Stride Education |
| 7 | Additional required pages |
| 8 | UX and functionality |
| 9 | Copywriting and tone of voice |
| 10 | Implementation instructions (incomplete) |

## 1. Document completeness

| Issue | Detail | What we do meanwhile |
|---|---|---|
| **Sections 1 and 2 missing** | The PDF starts at "3. Main Stride homepage". Sections 1–2 probably held the brief's background: brand overview, objectives, audiences, brand guidelines, or the definition of the group structure. | Nothing is assumed. Brand identity is taken from the current site, and the group/division structure from the user's Phase 2 brief. **Ask the client for sections 1–2.** |
| **Section 10 truncated** | It ends with "Then:" followed by a blank page 15. The missing part likely lists the build order or acceptance steps. | The roadmap follows the order the visible part implies: design system and creative direction first, then distinct page compositions. **Ask the client for the rest of section 10.** |
| **No brand guidelines attached** | No logo files beyond those on the live site, no colour or type specification, no imagery library. | The design system preserves the existing identity and proposes extensions for approval. |
| **No assets attached** | No photography, video, logos, case-study data or team bios. | Every image slot in the wireframes has an asset brief; placeholders are labelled `PLACEHOLDER — awaiting approved asset`. |

## 2. Requirements matrix

Status codes:

| Code | Meaning |
|---|---|
| **R** | Reuse from Phase 1 |
| **A** | Adapt existing |
| **N** | Build new |
| **B** | Blocked on client input |

Section numbers refer to the PDF.

### 3. Main homepage (ten sections)

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | Near full-screen hero: "BUILT AROUND CREATORS." plus the secondary line; video montage or a curated photo arrangement; logo top-left; nav: Our Group, Stride Social, Stride Talent, Stride Education, Our Work, About, Contact, with premium dropdowns. | N + B | The existing hero montage video can be a temporary source. The final montage needs approved footage. The nav lists both "Our Group" and "About" (see open question Q4). |
| 2 | "THREE SIDES OF STRIDE.": three large image-led panels (Social / Talent / Education) with the given copy and CTAs; three columns on desktop with hover; stacked editorial sections on mobile. | N + B | Needs a commercial campaign image, signed-creator portraits and education/community imagery. Education imagery does not exist yet. |
| 3 | "ONE GROUP. BUILT FOR WHAT'S NEXT.": established 2022, international, what makes it different; split-screen; CTA "Our Story". | N + B | **Founding-year conflict** (2020 / 2021 / 2022). The "what makes us different" copy needs client input. |
| 4 | Specialist divisions: Sport, Travel, Podcasts, Music, Speakers; bold typography + photography; link to a page or filtered roster; easy to add more. | N + B | Data-driven (`talentDivisions` collection). No division assignments exist for creators yet. |
| 5 | Our Work: premium featured work, varied card sizes; Samsung, Barsys, Laifen, Govee, XGIMI; each links to a case study with brief, strategy, execution and verified results; CTA "Explore Our Work". | A + B | Laifen, Govee and XGIMI exist but lack brief/strategy structure and verified results. **Samsung and Barsys have no material.** |
| 6 | People behind Stride: real portraits plus natural team photography; editorial grid; CTA "Meet The Team". | A + B | 33 portraits exist. Candid team photography is needed. |
| 7 | Beyond business: sponsorships, communities, creator partnerships, local initiatives; CTA "Our Sponsorships". | N + B | No content or imagery exists. |
| 8 | Insights: three articles; large thumbnails, category, date, headline; CTA "Explore Insights". | A | 42 posts exist. Thumbnails are weak; better imagery is recommended for the three featured posts. |
| 9 | Global presence: UK, US, Canada, Germany, France as talent markets; other verified team locations and markets shown separately; editorial map or typographic display; no implied offices. | N + B | Needs a verified list of team locations and operating markets. |
| 10 | "LET'S MAKE SOMETHING HAPPEN." with three routes; comprehensive dark navy footer. | N | Footer content (links, legal entity, socials) is partly known. |

### 4. Stride Social

| Requirement | Status | Notes |
|---|---|---|
| Hero "THE RIGHT CREATORS. REAL IMPACT." with subheading, campaign footage, CTAs "Speak To Our Team" and "Explore Our Work". | N + B | The 5 live-campaign clips and 18 case-study clips can serve until new footage is approved. |
| Trusted-by logo strip with genuine logos, subject to approval (Samsung, Adobe, P&G, Govee, XGIMI, Anker, Temu, NordVPN). | A + B | Only Anker and NordVPN logos exist. An approved logo list and vector files are needed. |
| Intro "INFLUENCE IS MORE THAN A POST.": editorial split. | N | Copy drafted from real capabilities, for approval. |
| Services: 7 services, each with a dedicated page or section; no identical cards. | A + N | Existing service copy is partially reusable. Podcast Activations and TikTok Shop are new. |
| Industries: 8 industries with photography and campaign examples. | N + B | Existing case studies cover Technology, Lifestyle, Home and Travel. **Trades & Construction has no case study.** |
| Featured campaigns with verified results; separate Our Work archive filterable by industry and service. | A + N | Case studies need `industries[]` and `services[]` tags and results verification. |
| Our approach: Strategy → Creator Selection → Campaign Execution → Reporting, as an editorial layout. | A | The process copy on the current Seeding page is partially reusable. |
| Final CTA "YOUR NEXT CAMPAIGN STARTS HERE.", button "Talk To Stride Social", brand form: name, company, email, market, service, budget (optional), brief. | N + B | Needs a form destination (email inbox, CRM) and a definition of "market". |

### 5. Stride Talent

| Requirement | Status | Notes |
|---|---|---|
| Hero "MORE THAN MANAGEMENT." with talent montage; CTAs "Explore Our Roster" and "Apply For Management". | N + B | Needs approved creator portraits/footage and talent consent. |
| Intro: since 2022, 600+ creators, UK/US/Canada/Germany/France, mission. | N + B | **2022 and 600+ must be confirmed.** |
| "YOUR CAREER. OUR COMMITMENT.": 8 management services, editorial, not corporate. | N | Copy to draft. |
| Searchable roster with 10 filters; profile: portrait, name, main category, country, socials, bio, selected work, brand enquiry. | A + N + B | 230 creators exist. **Country, division and selected work are missing for all of them.** Categories need remapping. Clarify whether Partner/UGC-partner creators belong in the roster (Q9). |
| Creator experiences: real quotes, names, images, optional video. | A + B | 2–3 creator quotes exist. More are needed, with consent. |
| Divisions: creative navigation to Sport, Travel, Podcasts, Music, Speakers. | N + B | Division pages need content and members. |
| Application form: name, email, country, platforms, social links, category, intro; CTA "Join Stride Talent". | N + B | It replaces the Typeform currently used at `/creator-sign-up`. Confirm whether to keep Typeform or move to a native form. |

### 6. Stride Education

| Requirement | Status | Notes |
|---|---|---|
| Hero "EVERY CREATOR STARTS SOMEWHERE." with supporting text, authentic learning/community imagery, CTA "Explore Stride Education". | N + B | No education imagery exists. |
| Our purpose. | N | Draft from the brief's own wording. |
| What creators can learn: 7 topics. | N | Topic list given. Depth and format unknown. |
| The experience: lessons, mentoring, community, resources, workshops/calls, opportunities; **clearly distinguish available from planned**. | N + B | **The availability status of each item is unknown.** |
| Creator stories, when provided. | B | Nothing exists. The section stays hidden until content exists. |
| Final CTA "START BUILDING YOUR CREATOR CAREER." with an inquiry, enrollment or course-discovery route. | N + B | **Which route is it?** Free or paid? Waitlist? Platform (own site, Skool, Kajabi, …)? |

### 7. Additional pages

| Page | Status | Notes |
|---|---|---|
| About Stride (company, business model, mission, values, presence) | A + B | Mission and values copy needed. |
| Our History (timeline from 2022, verified milestones, photos) | A + B | The existing timeline starts in 2018 and calls 2020 "Stride Group is born". Reconcile. |
| Our Team (profiles, roles, photos, optional bios) | A | 33 profiles exist. Bios are optional. |
| Our Sponsorships (archive of creators, teams, events, community) | N + B | Content needed. |
| Our Work (archive) + Case study pages | A | Restructure the existing 25. |
| Insights / Blog | A | 42 posts. |
| Careers (culture, roles, application route) | A | Culture copy and an application route are needed. Currently it is a mailto link to Careers@stride-social.com. |
| Contact (brands, established creators, emerging creators, general) | N + B | Destinations per route are needed. |
| Legal (privacy, cookies, terms) | N + B | **The client must supply or approve legal text.** We will not write legal policies. |

### 8–10. UX, tone and implementation

| Requirement | Status | How it is met |
|---|---|---|
| Move between divisions without returning home; parent logo always visible; show the current division. | N | Global nav plus a division sub-bar and division-aware active states ([03-sitemap](03-sitemap.md)). |
| Restrained animation: quick transitions, subtle hover movement, refined type reveals, natural section transitions, well-designed dropdowns. | A | Motion spec in [04-design-system](04-design-system.md) §8. |
| Fast loading, optimised media, accessible nav and contrast, heading hierarchy, SEO metadata, mobile-first. | A + N | Technical architecture ([07](07-technical-architecture.md)). |
| Content management for blogs, creators, services, case studies. | A | Git-based content with schema validation and PR review ([06](06-content-architecture.md)). |
| Working forms with validation and success states. | N + B | Needs a backend choice. |
| Consent and privacy handling. | N + B | Needs a cookie banner decision tied to analytics. |
| Reduced-motion support. | R | Already in place. Extended to every new animation. |
| No dead buttons; placeholders clearly identified. | N | `PlaceholderNotice` component plus a build-time report of placeholder usage. |
| Tone: confident, direct, contemporary, human, brief, real information; no invented facts. | — | Copy rules in [04-design-system](04-design-system.md) §11. All drafted copy is marked for approval. |
| Don't repeat one template; distinct compositions for the four landing pages; design system first. | — | Wireframes ([05](05-wireframes.md)) give each landing a different composition. The roadmap starts with the design system. |

## 3. Open questions and conflicts

The client must answer these before or during Phase 3. They are numbered for the [approval checklist](09-client-approval-checklist.md).

| # | Question | Why it matters |
|---|---|---|
| Q1 | **What is the founding year: 2020, 2021 or 2022?** The current site says 2020 (group born) and "since 2021"; the brief says 2022. | Homepage §3, Talent intro, History timeline, SEO copy. |
| Q2 | **Is "600+ creators" correct**, and should the public roster show all of them? The public site lists 230. | Talent intro, roster scope, data entry effort. |
| Q3 | **Which team locations and operating markets are verified?** Is there a physical office? The current material mentions London, Manchester and a Singapore entity. | Global presence section, footer, About, Organization schema. |
| Q4 | The nav lists both **"Our Group" and "About"**. Our proposal: "Our Group" dropdown = About, History, Team, Sponsorships, Careers, Insights; "About" stays as a direct link because the brief lists it. **Merge them into one item instead?** | Navigation clarity. |
| Q5 | **Which brand logos are approved for display**, and can we get vector files (Samsung, Adobe, P&G, Govee, XGIMI, Anker, Temu, NordVPN, plus the 20 existing)? | Social logo strip. Legal risk. |
| Q6 | **What material exists for the Samsung and Barsys campaigns**, and which results are verified for Laifen, Govee and XGIMI (with source)? | Homepage §5, Our Work. |
| Q7 | **Keep, rewrite or retire the existing statistics?** "2 billion combined followers", "4000+ campaigns", "$5M+ paid", "21 years". | Credibility; the no-invented-statistics rule. |
| Q8 | **What happens to services not in the new list?** Mobile game & app ambassadors, social media management, influencer affiliate programme. | Service pages, redirects. |
| Q9 | **Roster scope:** include "UGC partner" creators (127) or only managed talent (103)? | Talent credibility; "represents" vs "works with". |
| Q10 | **Creator data:** who supplies country, division, category, platforms and selected work for each creator? Is consent confirmed for every public profile? | Roster filters, GDPR. |
| Q11 | **Stride Education offering:** which items are available today vs planned? Format (cohorts, on-demand, calls)? Free or paid? Where does enrollment happen? | Education page structure and CTA. |
| Q12 | **Sponsorships:** list, dates, partners, imagery, permissions. | Homepage §7, Sponsorships page. |
| Q13 | **Form destinations:** which inbox or CRM does each form feed (brand, talent application, education, general, careers)? Response-time promises? | Forms, success states, privacy notice. |
| Q14 | **Analytics and marketing tags:** keep GA4, GTM and Google Ads? Keep the Tidio chat? | Cookie consent design, performance. |
| Q15 | **Legal pages:** will the client provide the privacy policy, cookie policy and terms? Which legal entity and jurisdiction (UK vs Singapore entity)? | Legal pages, footer, forms. |
| Q16 | **URL changes:** approve moving `/case-studies` → `/work`, `/blog` → `/insights`, `/creators` → `/talent/roster` (with 301 redirects)? | SEO continuity ([03-sitemap](03-sitemap.md) §5). |
| Q17 | **Chinese site (`/zh`):** keep it (translate the new site later) or retire it with redirects at launch? | Scope, SEO, hreflang. |
| Q18 | **Photography and video:** is there an existing library? Is a shoot planned? Who holds the rights? | Every cinematic section depends on it. |
| Q19 | **Typography licence:** approve the free font pairing, or license a premium display face? | Design system. |
| Q20 | **Division accent colours:** approve the proposed Talent and Education accents? | Design system. |
| Q21 | **Hosting, domain and deploy:** which host (Vercel, Netlify or Cloudflare Pages)? Who controls DNS for stride-social.com? When does the Webflow site switch over? | Technical architecture, launch. |
| Q22 | **Missing PDF content:** sections 1–2 and the rest of section 10. | Possible requirements we have not seen. |
| Q23 | **Domain naming:** stay on stride-social.com for the whole group, or move to a group domain (e.g. stride.com / stridegroup.com) with Social as a section? | URLs, SEO, branding. |
| Q24 | **Talent division pages:** dedicated editorial pages now, or filtered roster views until each division is populated? | Scope of Phase 3. |

## 4. Rules we follow until answers arrive

- **No invented content.** Creators, testimonials, results, statistics, partners, offices, awards and team members are never fabricated. Where content is missing, the component renders a labelled placeholder in preview builds. Production builds fail if a placeholder would ship (see [07](07-technical-architecture.md) §9).
- **Suggested headlines from the PDF are used as written.** Body copy we draft is marked `DRAFT — needs approval` in the content files.
- **Existing figures stay out** of the new pages until re-verified (Q7).
