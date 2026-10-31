# 01 — Existing site audit

What Phase 1 produced, what it contains, and how much of it fits the Phase 2 brief ("Stride Social Site" PDF).

## 1. What exists today

Phase 1 recreated the public stride-social.com (Webflow) as an independent Astro 5 codebase in this repository. The structure and data are kept; the design and composition of every page will change in Phase 3.

| Area | Current state |
|---|---|
| Stack | Astro 5.18 static output, plain CSS with tokens, ~10 small TypeScript behaviour modules, Lenis smooth scroll. No CMS and no server code. |
| Pages | 12 static pages + 4 collection templates = 312 built pages. Full list in [`docs/INVENTORY.md`](../INVENTORY.md). |
| Content | Typed collections in `src/content`: 25 case studies, 42 blog posts, 230 creators, 2 jobs, 6 testimonials, 20 client logos, 5 services, 33 team members (JSON). |
| Assets | `public/assets`, about 440 MB: 83 site images, 426 CMS images, 32 videos (hero montage, 5 "live campaign" clips, 18 case-study campaign videos), posters. Manifest maps every original URL. |
| Brand | Navy `#06142b`, ice blue `#c3f2fb`, greys `#f0f0f0 / #ebebeb / #dbdbdb`. Inter 900 uppercase display, IBM Plex Mono labels. Four-triangle Stride mark, "Stride Social" wordmark logo. |
| Divisions | `src/config/divisions.ts` already models Social / Talent / Education with per-division theme overrides (`data-division`). |
| Quality | `astro check` clean, 0 broken internal links (except one inherited from live), desktop/mobile parity with live verified by screenshot. |

## 2. Inventory of reusable building blocks

### Code

| Item | Location | Phase 2 verdict |
|---|---|---|
| Design tokens + division theming | `src/styles/tokens.css`, `divisions.ts` | **Reuse and extend.** Becomes the design system's token layer. |
| Base layout, SEO head, sitemap | `layouts/BaseLayout.astro`, `ui/Seo.astro`, `@astrojs/sitemap` | **Reuse.** Add breadcrumbs, JSON-LD helpers, division context. |
| Motion system | `scripts/split-text.ts`, `reveal.ts`, `scroll-motion.ts`, `smooth-scroll.ts`, `ui/Marquee.astro`, `drag-scroll.ts` | **Reuse, refine.** Switch text reveals from per-letter to per-line for a calmer premium feel and better accessibility. |
| Content collections + schemas | `src/content.config.ts` | **Reuse, expand schemas** (see [06-content-architecture](06-content-architecture.md)). |
| Migration scripts | `scripts/migrate/*` | **Keep as a reference.** Not needed again once content is edited by hand. |
| Rich text typography | `ui/RichText.astro` | **Reuse, restyle** for Insights articles. |
| Talent card | `cards/TalentCard.astro` | **Redesign.** Hover-shard concept can be kept for the roster, but the grid and info layout change. |
| Navbar + menu | `layout/Navbar.astro` | **Replace.** The brief needs a multi-division nav with dropdowns and a division indicator. |
| Footer + reveal CTA | `layout/Footer*.astro` | **Replace.** The brief needs a comprehensive dark navy footer. The sticky reveal technique can be reused. |
| Page-specific sections | `components/{home,company,offering,portfolio,editorial}` | **Retire.** They recreate the old compositions; keep them only as references while building. |
| Contact multi-step form | `editorial/MultiStepForm.astro` | **Partially reuse.** Step logic and validation patterns are useful; the form fields and backend change. |

### Content

| Content | Count | Fit for new brief | Notes |
|---|---|---|---|
| Case studies | 25 | Partial | Many are short and product-shot heavy. 18 have 3 stats ("Campaign Views / Likes / Shares"); 6 have none. None follows the brief's **brief → strategy → execution → verified results** structure. Laifen, Govee and XGIMI exist. **Samsung and Barsys do not exist** in current content. |
| Creators | 230 | Partial | Fields: name, photo, a free-text category, followers, biggest channel, socials, bio, Partner (121) / Managed (103). **No country field, no division, no selected work.** Category taxonomy (Lifestyle, Entertainment, Tech reviews, Amazon finds, …) does not match the brief's filters (Sport, Beauty, Fashion, Lifestyle, Travel, Music, Podcasts, Speakers, Technology). 24 have no category; 3 have no photo. The brief cites **600+ creators**; the public roster shows 230. |
| Blog posts | 42 | Good | 37 "News", 4 "Industry", 1 "Our work". Most thumbnails are generic stock/AI-style imagery; they don't meet the "authentic photography" direction. The brief's categories (company news, creator economy, marketing insights, education) need re-tagging. |
| Team | 33 | Good base | Names, roles, photos (some with a second "hover" photo). 25 are Talent Managers. Bios are missing. Founders (Alex Hendy, Ollie Kitson) have story copy on /about. |
| Testimonials | 6 | Partial | Brand and creator quotes with avatars (Govee, Justice Buys, Papaya Gaming, Lilly/Guang, Jack Chalmers, +1). Reusable only with consent re-confirmed. |
| Client logos | 20 | Partial | Student Minds, Blitz, Gn, Genshin Impact, Voodoo, Azar, Fairy, Anker, Bloom, Zovoo, AliExpress, Tooletries, Tinder, Bulldog Skincare, ACE, NordVPN, Bolt, Manscaped, Cash App, Merge Gardens. Of the brief's examples, **only Anker and NordVPN exist**; Fairy is a P&G brand but there is no P&G logo. **Samsung, Adobe, P&G, Govee, XGIMI and Temu logos are missing.** |
| Services | 5 (home) + 7 (strategies) | Redesign | Current service names differ from the brief's 7 services. Podcast Activations and TikTok Shop (affiliate) are new. Some long copy can be adapted. |
| About story | 1 page | Partial | Founders' story and a 2018–2026 timeline exist. It conflicts with the brief's founding year (see below). |
| Jobs | 2 | Good | Placement scheme + Talent Communications role. |
| Video | 32 files | Partial | Hero montage (desktop + mobile cut), 5 live-campaign clips, 18 case-study clips (some 30+ MB, unoptimised). Usable for montages once rights are confirmed. |
| Education, sponsorships, global presence, legal | — | **Missing** | No content, imagery or pages exist. |

## 3. Facts on the current site that the new brief contradicts or extends

These must be resolved before any copy is written. They are repeated in the approval checklist.

| Topic | Current site says | Brief says |
|---|---|---|
| Founding year | "Agency since **2021**". About timeline: "**2020** — Stride GROUP is born" (2018 = Alex's TikTok growth). | Stride "established in **2022**". Stride Talent "has operated since **2022**". |
| Roster size | 230 public creator profiles. | "Represents **over 600 creators**". |
| Markets | Chinese meta: "headquartered in London and Manchester". Legal entity: Stride Global Holdings **Pte. Ltd** (Singapore registration 202527987G). UK phone number. | Talent markets: UK, US, Canada, Germany, France. "Do not imply physical offices where not confirmed." |
| Statistics | "2 billion combined followers", "4000+ campaigns launched", "$5M+ paid to influencers since 2021", "21 years combined industry experience". | "Do not invent statistics." Every figure must be re-verified before reuse. |
| Services | Influencer advertising, UGC, talent management, new business for influencers, TikTok Shop livestreams, plus a strategies list (activations, seeding, affiliate, content creation, mobile game & app ambassadors, social media management, events). | 7 services: Influencer Activations, Influencer Seeding, UGC Production, TikTok Shop, TikTok Shop Livestreams, Influencer Events, Podcast Activations. Mobile game ambassadors and social media management are not listed: **retire or keep?** |
| Industries | Not presented. | Technology, Lifestyle, Beauty, Fashion, Sport, Travel, Home, Trades & Construction. |
| Talent divisions | Not presented. | Stride Sport, Travel, Podcasts, Music, Speakers (+ future divisions). |
| Languages | English + Chinese (`/zh`, mostly translated, not yet migrated). | Not mentioned. English first; multilingual later. |

## 4. Live-site issues worth fixing in the redesign

These issues were found in Phase 1 and are detailed in [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md):

- **Home JSON-LD** describes the wrong company, "Stride – A New Way to Connect", with broken URLs.
- **SEO tags:** no OG images on static pages, and several pages with multiple `<h1>`s.
- **Low-contrast labels:** near-invisible eyebrow labels, light text on light grey.
- **Broken content:** a broken table in one blog post; a broken internal link (`/blog/anker`); Glam AI "videos" that are Instagram URLs.
- **Contact form:** both radio groups share one name, so choosing one clears the other.
- **Layout bugs:** the creator profile's portrait covers the content on phones; blog tables overflow on phones.
- **Typos:** "Cretaors", "prenseted", "opportunites".
- **Media weight:** heavy unoptimised media. Case-study videos reach 32 MB, and images are served at original size.

## 5. Summary

| Verdict | What |
|---|---|
| **Reuse as-is** | Build tooling, SEO plumbing, content pipeline, motion utilities, migration provenance, asset manifest. |
| **Reuse with changes** | Tokens/theming, collections (expanded schemas), team, blog, jobs, creator data (re-tagged + enriched), case studies (rewritten to the new structure), logos (subset). |
| **Redesign** | Every page composition, navigation, footer, cards, forms. |
| **Build new** | Group homepage, three division landings, 7 service pages, Our Work archive with filters, searchable roster, talent divisions, Education, History, Sponsorships, Contact hub with four routes, Legal pages. |
| **Blocked on client** | Verified facts and figures, approved logos, photography/video, Samsung and Barsys case study material, Education offering, sponsorship content, legal copy, form destinations. |
