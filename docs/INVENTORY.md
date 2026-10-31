# Stride Social — Public Site Inventory

Snapshot of https://www.stride-social.com taken 2026-10-31 from the public sitemap (579 URLs), robots.txt and a polite crawl of every English URL plus the Chinese static pages. Machine-readable versions live in `docs/inventory/pages.json` and `docs/inventory/assets.json`.

## Platform and third-party services observed

| Concern | Original implementation | Rebuild |
|---|---|---|
| CMS / hosting | Webflow (site `65e74a029f5d3f85822896b9`), Webflow Localization (en, zh) | Astro static build, content as files in `src/content` |
| Fonts | Inter (self-hosted TTF + Google Fonts), IBM Plex Mono (Google Fonts); Mona Sans / Instrument Serif / Vertigo declared but unused | Self-hosted Inter variable + IBM Plex Mono via @fontsource |
| Smooth scroll | Lenis 1.0.39 | Lenis (npm) |
| Text animation | SplitType + GSAP 3.12 ScrollTrigger (`words-slide-up`, `letters-slide-up`, `letters-fade-in`, `scrub-each-word`) | Small vanilla splitter + IntersectionObserver/scroll handlers |
| Sliders | Swiper 8 (testimonials), Flowbase carousel ticker | Native scroll-snap slider + CSS marquees |
| Interactions | Webflow IX2 (menu, flip cards, horizontal scroll, accordions, footer reveal) | Vanilla TS modules in `src/scripts` |
| Analytics / ads | GA4 G-NECCMW1H80, GTM-TWV5CNN5, Google Ads AW-17522340587 | Not included (add via `src/config/site.ts` analytics slot when going live) |
| Filtering | Jetboost | Static filtering in the page script where needed |
| Live chat | Tidio widget | Not included (optional embed slot) |
| Forms / sign-up | External app join.stride-social.com (brand + creator funnels) | Same external links |

## robots.txt

Cloudflare-managed: `User-agent: * Allow: /` with `Content-Signal: search=yes, ai-train=no, use=reference`; Amazonbot disallowed. The sitemap is at `/sitemap.xml`.

## Page templates

| Template | Live pages | Webflow collection |
|---|---|---|
| `creators/[slug]` | 230 | 65e9ca95f60762c4dd66c8e2 |
| `blog/[slug]` | 42 | 6613ebec792d0d640944b714 |
| `case-studies/[slug]` | 25 | 65eb1a652db2c88d06c957fa |
| `zh/[slug]` | 13 | — |
| `jobs/[slug]` | 2 | 6617000bf49e52ca76b35dd2 |
| `about` | 1 | — |
| `blog` | 1 | — |
| `careers` | 1 | — |
| `case-studies` | 1 | — |
| `contact` | 1 | — |
| `creator-sign-up` | 1 | — |
| `creators` | 1 | — |
| `home` | 1 | — |
| `influencer-seeding` | 1 | — |
| `influencer-strategies` | 1 | — |
| `meet-the-team` | 1 | — |
| `our-services` | 1 | — |
| `zh` | 1 | — |

Sitemap also lists 251 `/zh/...` CMS item URLs (localized creators, blog posts and case studies) that share the English templates. 3 sitemap URLs return 404: `/creators/foodiefunwithus`, `/creators/homewithcolin`, `/creators/iam-brittneyy`.

## Static pages and SEO metadata

| Path | Title | Meta description (start) | H1 | OG image |
|---|---|---|---|---|
| `/zh` | Stride Social / 网红营销和人才中介 | Stride Social是一家总部位于伦敦和曼彻斯特的全新网红管理和网红营销机构，致力于与世界上最优秀的人才合作。 | 勇往直前，借力网红营销 | — |
| `/` | Stride Social / Influencer Advertising & Talent Agency | Stride Social is an influencer Advertising and Talent Agency helping brands grow through p… | iNFLUENCER advertising done right. | — |
| `/zh/creators` | Stride Social / 我们的创作者 | 我们的创作者来自社交媒体营销和UGC领域，我们还与值得信赖的合作伙伴合作，为您保证结果 | Our creators / alchemistlyy | — |
| `/creators` | Stride Social / Our Creators | Our Cretaors come from the world of social media marketing and UGC, we also work with trus… | Our creators / 0fficial.keoree | — |
| `/zh/contact` | Stride Social / 联系我们 | 如果您是内容创作者或想与我们的人才库合作，请联系我们，我们将很乐意与您合作 | 联系我们 | — |
| `/contact` | Stride Social / Contact Us | If you are a content creator or would like to work with our talent roster then get in touc… | contact us | — |
| `/zh/about` | Stride Social / 关于我们的网红营销机构 | Stride Social 提供用户生成的内容和营销服务，详细了解我们以及如何与创作者合作 | About us | — |
| `/about` | Stride Social / About Our Influencer Marketing Agency | Stride social provide user generated content and marketing services, find out more about u… | About us | — |
| `/zh/our-services` | Stride Social / 我们的服务 | 我们提供一系列服务，包括社交媒体营销、人才管理、谷歌媒体购买和广告。在这里了解有关我们服务的更多信息 | Our services | — |
| `/our-services` | Stride Social / Our Services | We provide a range or services from social media marketing, talent management and google m… | Our services | — |
| `/zh/case-studies` | Stride Social / 案例研究 | 在我们最新的用户生成内容和社交媒体营销活动中，我们的代理机构与最好的创作者合作，制作最好的广告 | Case studies / 云鲸 | — |
| `/case-studies` | Stride Social / Case Studies | Some of our latest user-generated content and social media marketing campaigns, our agency… | Case studies / XGIMI | — |
| `/zh/blog` | Stride Social / 我们的博客 | 我们最新的用户生成内容、社交媒体营销活动和行业新闻。我们的代理机构与最优秀的创作者合作，制作最好的广告 | Our blog / Boosting brand success | — |
| `/blog` | Stride Social / Our Blog | Some of our latest user-generated content, social media marketing campaigns and news from … | Our blog / Mobile game influencer marketing: a step-by-step guide | — |
| `/zh/careers` | Stride Social / 招聘 | Stride Social是一家创作者管理和营销机构，专门管理来自世界各地的一些最佳创作者。 | Careers | — |
| `/careers` | Stride Social / Careers | Stride Social is a creator management and marketing agency exclusively managing some of th… | Careers | — |
| `/zh/creator-sign-up` | Stride Social / 联系我们 | 如果您是内容创作者或想与我们的人才库合作，请联系我们，我们将很乐意与您合作 | 联系我们 | — |
| `/creator-sign-up` | Creator Sign up | If you are a content creator and would like to work with us then get in touch and we will … | contact us | — |
| `/zh/meet-the-team` | Stride Social / 我们的服务 | 我们提供一系列服务，包括社交媒体营销、人才管理、谷歌媒体购买和广告。在这里了解有关我们服务的更多信息 | Meet the team | — |
| `/meet-the-team` | Meet The Team at Stride Social | We provide a range or services from social media marketing, talent management and google m… | Meet the team | — |
| `/zh/influencer-seeding` | Stride Social / 关于我们的网红营销机构 | Stride Social 提供用户生成的内容和营销服务，详细了解我们以及如何与创作者合作 | Influencer Seeding | — |
| `/influencer-seeding` | Influencer Seeding | Start influencer seeding with content creators from all industries today, with the help of… | Influencer Seeding | — |
| `/zh/influencer-strategies` | Stride Social / 我们的服务 | 我们提供一系列服务，包括社交媒体营销、人才管理、谷歌媒体购买和广告。在这里了解有关我们服务的更多信息 | Influencer Strategies / Overdub App | — |
| `/influencer-strategies` | Influencer Strategies | We provide a range or services and strategies from social media marketing, talent manageme… | Influencer Strategies / Overdub App | — |
| `/zh/jobs/marketingjobs` | Are you interested in working with influencers as a career?  - Jobs at Stride Social | Are you interested in working with influencers as a career? | Placement Scheme / Influencer Talent Management | — |
| `/zh/jobs/talent-communications-and-partnership-specialist` | Interested in working with Influencers and being an integral part of the Stride Social Talent Team? - Jobs at Stride Social | Interested in working with Influencers and being an integral part of the Stride Social Tal… | Talent Communications and Partnership Specialist | — |

All pages output `og:type`, `twitter:card=summary_large_image`, `og:title`/`og:description` mirroring title/description, a self-referencing canonical, and `hreflang` alternates (`x-default`, `en`, `zh`). The home page also embeds JSON-LD `WebSite`, `Organization` and `WebPage` blocks.

## `case-studies/[slug]` — 25 items

| Path | Title | Has OG image |
|---|---|---|
| `/case-studies/airup` | Airup marketing campaign by Stride Social | yes |
| `/case-studies/aliexpress` | Aliexpress marketing campaign by Stride Social | yes |
| `/case-studies/aliexpress-2` | AliExpress marketing campaign by Stride Social | yes |
| `/case-studies/anker` | Anker marketing campaign by Stride Social | yes |
| `/case-studies/bloom` | Bloom marketing campaign by Stride Social | yes |
| `/case-studies/c2-gripz` | C2 Gripz marketing campaign by Stride Social | yes |
| `/case-studies/comfelie-driving-20k-in-sales` | Comfelie marketing campaign by Stride Social | yes |
| `/case-studies/glam-ai` | Glam AI marketing campaign by Stride Social | yes |
| `/case-studies/govee` | Govee marketing campaign by Stride Social | yes |
| `/case-studies/greene-king` | Greene King marketing campaign by Stride Social | yes |
| `/case-studies/holafly-app---driving-app-downloads-with-travel-influencers` | Holafly App  marketing campaign by Stride Social | yes |
| `/case-studies/jackery` | Jackery marketing campaign by Stride Social | yes |
| `/case-studies/laifen` | Laifen marketing campaign by Stride Social | yes |
| `/case-studies/mars-group` | Mars Group marketing campaign by Stride Social | yes |
| `/case-studies/meta` | Meta marketing campaign by Stride Social | yes |
| `/case-studies/narwal` | Narwal marketing campaign by Stride Social | yes |
| `/case-studies/overdub-app` | Overdub App marketing campaign by Stride Social | yes |
| `/case-studies/papaya-gaming` | Papaya Gaming marketing campaign by Stride Social | yes |
| `/case-studies/rhinoshields` | Rhinoshields marketing campaign by Stride Social | yes |
| `/case-studies/ring` | Ring marketing campaign by Stride Social | yes |
| `/case-studies/temu-scaling-paid-social-with-500-ugc-videos` | Temu marketing campaign by Stride Social | yes |
| `/case-studies/tooletries` | Tooletries marketing campaign by Stride Social | yes |
| `/case-studies/trainpal` | TrainPal marketing campaign by Stride Social | yes |
| `/case-studies/true-classic` | True Classic marketing campaign by Stride Social | yes |
| `/case-studies/xgimi` | XGIMI marketing campaign by Stride Social | yes |

## `blog/[slug]` — 42 items

| Path | Title | Has OG image |
|---|---|---|
| `/blog/10-essential-steps-to-create-a-successful-influencer-marketing-strategy` | 10 Essential Steps to Create a Successful Influencer Marketing Strategy | yes |
| `/blog/7-step-influencer-outreach-checklist-e-commerce-brands-en` | 7-Step Influencer Outreach Checklist for E-Commerce Brands | yes |
| `/blog/benefits-of-influencer-marketing-ecommerce-brands-en` | 7 Key Benefits of Influencer Marketing for E-Commerce Brands | yes |
| `/blog/best-influencer-marketing-platforms-6-en` | Top 6 Best Influencer Marketing Platforms 2026 | yes |
| `/blog/boosting-brand-success` | Boosting Brand Success: A Case Study on Govee's Influencer Marketing Campaign with Stride Social | yes |
| `/blog/brand-influencer-collaboration-process-guide-en` | Master the Brand Influencer Collaboration Process for Results | yes |
| `/blog/campaign-management-influencer-marketing-en` | Campaign Management in Influencer Marketing: Driving ROI | yes |
| `/blog/global-influencer-networks-impact-en` | Global Influencer Networks: Impact on Brand Growth | yes |
| `/blog/harness-storytelling-boost-influencer-marketing-impact-en` | Harness storytelling to boost influencer marketing impact | yes |
| `/blog/how-stride-social-can-transform-your-influencer-marketing-campaigns` | How Stride Social Can Transform Your Influencer Marketing Campaigns | yes |
| `/blog/how-to-launch-influencer-campaigns-brand-growth-en` | How to Launch Influencer Campaigns for Measurable Brand Growth | yes |
| `/blog/how-to-launch-pet-influencer-campaign-2026-en` | How to launch a pet influencer campaign in 2026 | yes |
| `/blog/influencer-gifting-brand-loyalty-en` | Influencer Gifting: Building Brand Loyalty Authentically | yes |
| `/blog/influencer-marketing-strategy-explained-en` | Influencer Marketing Strategy Explained: Driving ROI | yes |
| `/blog/influencer-marketing-trends-2026-en` | Influencer Marketing Trends 2026: Driving Measurable ROI | yes |
| `/blog/influencer-marketing-workflow-guide-strategic-campaigns-en` | Influencer Marketing Workflow Guide for Strategic Campaigns | yes |
| `/blog/influencer-selection-explained-tech-ecommerce-success-en` | Influencer selection explained for tech e-commerce success | yes |
| `/blog/influencer-strategy-checklist-7-steps-master-en` | 7 Steps to Master an Influencer Strategy Checklist | yes |
| `/blog/influencer-talent-management-explained-en` | Influencer Talent Management Explained: Driving ROI | yes |
| `/blog/influencermarketinghub-com-alternatives-7-en` | Top 7 Influencermarketinghub.com Alternatives 2026 for Effective Marketing Insights | yes |
| `/blog/key-influencer-marketing-terms-explained-boost-roi-2026-en` | Key Influencer Marketing Terms Explained: Boost 60% ROI in 2026 | yes |
| `/blog/launch-influencer-campaigns-22x-roi-success-boost-en` | Launch Influencer Campaigns: 22x ROI & 40% Success Boost | yes |
| `/blog/launch-travel-influencer-campaign-2026-en` | How to launch a travel influencer campaign in 2026 | yes |
| `/blog/measuring-influencer-marketing-roi-comprehensive-guide-en` | Measuring influencer marketing ROI: comprehensive guide | yes |
| `/blog/mobile-game-influencer-marketing-step-by-step-guide-en` | Mobile game influencer marketing: a step-by-step guide | yes |
| `/blog/role-of-data-influencer-marketing-en` | Role of Data in Influencer Marketing ROI | yes |
| `/blog/role-of-data-influencer-marketing-en-ecc7e` | Role of Data in Influencer Marketing ROI | yes |
| `/blog/role-of-influencers-tech-marketing-en` | Role of Influencers in Tech Marketing Success | yes |
| `/blog/social-media-engagement-tips-for-ecommerce-brands-en` | 6 Social Media Engagement Tips for E-Commerce Brands | yes |
| `/blog/step-by-step-influencer-outreach-brands-en` | Step by Step Influencer Outreach for Brands Success | yes |
| `/blog/the-power-of-user-generated-content-boosting-sales-through-authenticity` | The Power of User-Generated Content: Boosting Sales Through Authenticity | yes |
| `/blog/the-ultimate-guide-to-influencer-marketing` | The Ultimate Guide to Influencer Marketing: Boost Your Brand's Presence in 2024 | yes |
| `/blog/tiktok-role-brand-growth-en` | Role of TikTok in Brand Growth Today | yes |
| `/blog/top-7-benefits-ugc-food-brands-2026-en` | Top 7 benefits of UGC for food brands in 2026 | yes |
| `/blog/types-of-influencer-marketing-7-key-examples-en` | 7 Key Types of Influencer Marketing for Brand Success | yes |
| `/blog/user-generated-content-explained-en` | User-Generated Content Explained: Brand Trust Unlocked | yes |
| `/blog/user-generated-content-workflow-engagement-en` | Master User-Generated Content Workflow for Engagement | yes |
| `/blog/user-generated-content-workflow-engagement-en-f48dc` | Master User-Generated Content Workflow for Engagement | yes |
| `/blog/why-choose-tiktok-influencers-en` | Why Choose TikTok Influencers for Brand ROI | yes |
| `/blog/why-nano-influencers-drive-67-higher-engagement-2026-en` | Why nano influencers drive 67% higher engagement in 2026 | yes |
| `/blog/why-travel-brands-need-influencers-en` | Why Travel Brands Need Influencers for Success | yes |
| `/blog/work-with-tiktok-shop-creators-sales-impact-en` | Work with TikTok Shop Creators for Maximum Sales Impact | yes |

## `jobs/[slug]` — 2 items

| Path | Title | Has OG image |
|---|---|---|
| `/jobs/marketingjobs` | Are you interested in working with influencers as a career?  - Jobs at Stride Social | — |
| `/jobs/talent-communications-and-partnership-specialist` | Interested in working with Influencers and being an integral part of the Stride Social Talent Team? - Jobs at Stride Social | — |

## `creators/[slug]` — 230 items

| Path | Title | Has OG image |
|---|---|---|
| `/creators/0fficial-keoree` | 0fficial.keoree is managed by Stride Social | — |
| `/creators/alchemistlyy` | alchemistlyy is managed by Stride Social | — |
| `/creators/alementary` | Alementary is managed by Stride Social | — |
| `/creators/alex-david44` | Alex_david44 is managed by Stride Social | — |
| `/creators/allie-thomas` | Allie Thomas is managed by Stride Social | — |
| `/creators/amandaagy` | Amandaagy is managed by Stride Social | — |
| `/creators/amari-butler` | amari_butler is managed by Stride Social | — |
| `/creators/ambsholly` | ambsholly is managed by Stride Social | — |
| `/creators/amina5` | _amina5 is managed by Stride Social | — |
| `/creators/angela-homes` | angela.homes is managed by Stride Social | — |
| `/creators/appledsign` | Appledsign is managed by Stride Social | — |
| `/creators/aqsaxiqbal` | Aqsaxiqbal is managed by Stride Social | — |
| `/creators/arielletaraa` | Arielletaraa is managed by Stride Social | — |
| `/creators/arielviewzs` | Arielviewzs is managed by Stride Social | — |
| `/creators/ariffathulhakim` | Ariffathulhakim is managed by Stride Social | — |
| `/creators/artandplanstudio` | ArtAndPlanStudio is managed by Stride Social | — |
| `/creators/asempe` | Asempe is managed by Stride Social | — |
| `/creators/ashleyrosep` | ashleyrosep is managed by Stride Social | — |
| `/creators/asiapaoloni` | asiapaoloni is managed by Stride Social | — |
| `/creators/athomewithdidi` | athomewithdidi is managed by Stride Social | — |
| `/creators/athomewithtash-xo` | Athomewithtash_xo is managed by Stride Social | — |
| `/creators/baileyone` | Baileyone is managed by Stride Social | — |
| `/creators/bakeandglow` | bakeandglow is managed by Stride Social | — |
| `/creators/bamgamesofc` | bamgamesofc is managed by Stride Social | — |
| `/creators/beautyoftechnology` | BeautyOfTechnology is managed by Stride Social | — |
| `/creators/beingamina` | beingamina_ is managed by Stride Social | — |
| `/creators/bettergifts` | bettergifts is managed by Stride Social | — |
| `/creators/borisgtech` | BorisGTech is managed by Stride Social | — |
| `/creators/boujeeebeee` | BoujeeeBeee is managed by Stride Social | — |
| `/creators/bramdmedia` | BramDMedia is managed by Stride Social | — |
| `/creators/cadz-ovo` | Cadz.ovo is managed by Stride Social | — |
| `/creators/camera-bro` | camera_bro_ is managed by Stride Social | — |
| `/creators/camilla-gimenez` | Camilla Gimenez is managed by Stride Social | — |
| `/creators/carlosdia` | _carlosdia is managed by Stride Social | — |
| `/creators/chanellawallace` | Chanellawallace is managed by Stride Social | — |
| `/creators/cita4k` | Cita4k is managed by Stride Social | — |
| `/creators/cleaningwithgabie` | cleaningwithgabie is managed by Stride Social | — |
| `/creators/cleaningwithgabie-2` | CleaningWithGabie is managed by Stride Social | — |
| `/creators/cleanwith-kiraa` | cleanwith_kiraa is managed by Stride Social | — |
| `/creators/coffee-and-notions` | coffee.and.notions is managed by Stride Social | — |
| `/creators/colefrasher` | Colefrasher is managed by Stride Social | — |
| `/creators/corallistablog` | corallistablog is managed by Stride Social | — |
| `/creators/courtneycovino` | courtneycovino is managed by Stride Social | — |
| `/creators/cowbombgadgets` | cowbombgadgets is managed by Stride Social | — |
| `/creators/cozyjack-0` | Cozyjack_0 is managed by Stride Social | — |
| `/creators/crocatech` | Crocatech is managed by Stride Social | — |
| `/creators/cryptocita` | CryptoCita is managed by Stride Social | — |
| `/creators/dadrianca` | dadrianca is managed by Stride Social | — |
| `/creators/danakowalski` | danakowalski is managed by Stride Social | — |
| `/creators/dannish` | Its danzy is managed by Stride Social | — |
| `/creators/danquinny100` | danquinny100 is managed by Stride Social | — |
| `/creators/darion-hughes` | darion.hughes is managed by Stride Social | — |
| `/creators/dedman` | _dedman is managed by Stride Social | — |
| `/creators/designanything` | _designanything is managed by Stride Social | — |
| `/creators/destinykauffman` | destinykauffman is managed by Stride Social | — |
| `/creators/dev` | Dev does reviews is managed by Stride Social | — |
| `/creators/diariesofacodedgirl` | Diariesofacodedgirl is managed by Stride Social | — |
| `/creators/diariesofmyhome` | diariesofmyhome is managed by Stride Social | — |
| `/creators/dielenka` | dielenka is managed by Stride Social | — |
| `/creators/dsqueeze` | Dsqueeze is managed by Stride Social | — |
| `/creators/duztn` | duztn is managed by Stride Social | — |
| `/creators/eboniqueluxe` | eboniqueluxe is managed by Stride Social | — |
| `/creators/edenfaith` | _edenfaith is managed by Stride Social | — |
| `/creators/erhatheexplorer` | erhatheexplorer is managed by Stride Social | — |
| `/creators/ethan-tatum` | ethan.tatum is managed by Stride Social | — |
| `/creators/evaciland` | _evaciland is managed by Stride Social | — |
| `/creators/every1luvsiz` | every1luvsiz is managed by Stride Social | — |
| `/creators/farah-hawaa` | Farah_hawaa is managed by Stride Social | — |
| `/creators/farmhouselovehome` | FarmHouseLoveHome is managed by Stride Social | — |
| `/creators/fenloninteriors` | fenloninteriors_ is managed by Stride Social | — |
| `/creators/grizztech` | grizztech is managed by Stride Social | — |
| `/creators/guyywithglasses` | guyywithglasses is managed by Stride Social | — |
| `/creators/hamajineo` | HamajiNeo is managed by Stride Social | — |
| `/creators/hammarie-10` | hammarie.10 is managed by Stride Social | — |
| `/creators/hay-mitch-tv` | _hay_mitch_tv_ is managed by Stride Social | — |
| `/creators/hellochibuzor` | hellochibuzor is managed by Stride Social | — |
| `/creators/hiraaubaid` | hiraaubaid is managed by Stride Social | — |
| `/creators/hitomidocameraroll` | hitomidocameraroll is managed by Stride Social | — |
| `/creators/holyshabazz` | holyshabazz is managed by Stride Social | — |
| `/creators/home-cleaningtips` | home.cleaningtips is managed by Stride Social | — |
| `/creators/homewithaziza` | homewithaziza is managed by Stride Social | — |
| `/creators/honestlybridget` | honestlybridget is managed by Stride Social | — |
| `/creators/hoppshouse` | hoppshouse is managed by Stride Social | — |
| `/creators/house-becomes-home` | House.Becomes.Home is managed by Stride Social | — |
| `/creators/iamsaraybailey` | Iamsaraybailey is managed by Stride Social | — |
| `/creators/idilmilyuun` | Idilmilyuun is managed by Stride Social | — |
| `/creators/im-mya` | im.mya is managed by Stride Social | — |
| `/creators/imaeternal` | Imaeternal is managed by Stride Social | — |
| `/creators/infinitetech` | InfiniteTech is managed by Stride Social | — |
| `/creators/issathicknation` | Issathicknation is managed by Stride Social | — |
| `/creators/itslaurenamanda` | Itslaurenamanda is managed by Stride Social | — |
| `/creators/itstimiduhh` | Itstimiduhh is managed by Stride Social | — |
| `/creators/jackmjchalmers` | jackmjchalmers is managed by Stride Social | — |
| `/creators/jay-saipe12` | jay.saipe12 is managed by Stride Social | — |
| `/creators/jeorgepaolo` | Jeorgepaolo_ is managed by Stride Social | — |
| `/creators/jezreelmaee` | jezreelmaee is managed by Stride Social | — |
| `/creators/jodie-lynnofficial` | jodie_lynnofficial is managed by Stride Social | — |
| `/creators/joelledesigner` | Joelledesigner is managed by Stride Social | — |
| `/creators/joeshulk` | joeshulk is managed by Stride Social | — |
| `/creators/joshhughes` | .joshhughes is managed by Stride Social | — |
| `/creators/josie-may` | _josie_may is managed by Stride Social | — |
| `/creators/journeyof-maisonmorgan` | Journeyof_maisonmorgan is managed by Stride Social | — |
| `/creators/julian-hagins` | Julian Hagins is managed by Stride Social | — |
| `/creators/julianassada` | Julianassada is managed by Stride Social | — |
| `/creators/juliehaneline` | Juliehaneline is managed by Stride Social | — |
| `/creators/justicebuys` | justicebuys is managed by Stride Social | — |
| `/creators/katy-mac-x` | Katy.mac.x is managed by Stride Social | — |
| `/creators/kimkcx` | kimkcx is managed by Stride Social | — |
| `/creators/kingdeewight` | kingdeewight is managed by Stride Social | — |
| `/creators/kirstenwhite1995` | kirstenwhite1995 is managed by Stride Social | — |
| `/creators/klailea` | Klailea is managed by Stride Social | — |
| `/creators/koded-ib` | Koded-ib is managed by Stride Social | — |
| `/creators/kofi-travels` | kofi.travels is managed by Stride Social | — |
| `/creators/koliamishka` | koliamishka is managed by Stride Social | — |
| `/creators/krisvoide` | Krisvoide is managed by Stride Social | — |
| `/creators/ladyparadoxx` | LadyParadoxx is managed by Stride Social | — |
| `/creators/lancetann` | lancetann is managed by Stride Social | — |
| `/creators/laura` | cleaning_at83 is managed by Stride Social | — |
| `/creators/laura-the-explorerrr` | laura_the_explorerrr is managed by Stride Social | — |
| `/creators/lauraeletel` | Lauraeletel is managed by Stride Social | — |
| `/creators/leaf-content` | leaf.content is managed by Stride Social | — |
| `/creators/lefranks` | lefranks is managed by Stride Social | — |
| `/creators/lewistoh` | LewisToh is managed by Stride Social | — |
| `/creators/lexraye` | Lexraye is managed by Stride Social | — |
| `/creators/lifeonhawlane` | lifeonhawlane is managed by Stride Social | — |
| `/creators/linnea-turner` | linnea.turner is managed by Stride Social | — |
| `/creators/luci-dcarpio` | luci.dcarpio is managed by Stride Social | — |
| `/creators/lucymassad` | lucymassad is managed by Stride Social | — |
| `/creators/maciej-mp` | maciej.mp is managed by Stride Social | — |
| `/creators/maholasss` | maholasss is managed by Stride Social | — |
| `/creators/makenalynnn` | makenalynnn is managed by Stride Social | — |
| `/creators/mamasavesmoney` | mamasavesmoney is managed by Stride Social | — |
| `/creators/mariaurangaa` | Mariaurangaa is managed by Stride Social | — |
| `/creators/maskitmati` | MaskitMati is managed by Stride Social | — |
| `/creators/masonwatts` | Masonwatts is managed by Stride Social | — |
| `/creators/mathildebarker` | mathildebarker is managed by Stride Social | — |
| `/creators/meakcodes` | Meakcodes is managed by Stride Social | — |
| `/creators/meggieferrerhome` | meggieferrerhome is managed by Stride Social | — |
| `/creators/meraki-kiwi` | meraki.kiwi is managed by Stride Social | — |
| `/creators/mialicewu` | mialicewu is managed by Stride Social | — |
| `/creators/missj-life` | missj_life is managed by Stride Social | — |
| `/creators/misstechy` | misstechy is managed by Stride Social | — |
| `/creators/mochiiimarie` | mochiiimarie is managed by Stride Social | — |
| `/creators/moonlitmaddyx` | moonlitmaddyx is managed by Stride Social | — |
| `/creators/more-thanjustamother` | more.thanjustamother is managed by Stride Social | — |
| `/creators/moworldofficial` | moworldofficial is managed by Stride Social | — |
| `/creators/mrs-ds-cleaning-reviews` | mrs.ds.cleaning.reviews is managed by Stride Social | — |
| `/creators/mryeester` | mryeester is managed by Stride Social | — |
| `/creators/mtgproductions` | mtgproductions is managed by Stride Social | — |
| `/creators/nalae-co` | nalae.co is managed by Stride Social | — |
| `/creators/naseemspeach` | naseemspeach is managed by Stride Social | — |
| `/creators/nath-arm` | Nath_Arm is managed by Stride Social | — |
| `/creators/nelotechie` | NeloTechie is managed by Stride Social | — |
| `/creators/nicole-dyerofficial` | Nicole.dyerofficial is managed by Stride Social | — |
| `/creators/nikl0w` | Nikl0w is managed by Stride Social | — |
| `/creators/noaamaaria` | noaamaaria is managed by Stride Social | — |
| `/creators/officaljuanmena` | Officaljuanmena is managed by Stride Social | — |
| `/creators/ohhhayitstay` | Ohhhayitstay is managed by Stride Social | — |
| `/creators/ourcornishsanctuary` | ourcornishsanctuary is managed by Stride Social | — |
| `/creators/ourfavoritefinds` | ourfavoritefinds is managed by Stride Social | — |
| `/creators/owenreeman` | owenreeman is managed by Stride Social | — |
| `/creators/ozobooze` | Ozobooze is managed by Stride Social | — |
| `/creators/paigesechrist` | paigesechrist is managed by Stride Social | — |
| `/creators/panellingperfect-uk` | panellingperfect_uk is managed by Stride Social | — |
| `/creators/papachestyp` | papachestyp is managed by Stride Social | — |
| `/creators/paritolkks` | paritolkks is managed by Stride Social | — |
| `/creators/petermkle` | Petermkle is managed by Stride Social | — |
| `/creators/pickyaudio` | pickyaudio is managed by Stride Social | — |
| `/creators/poppy-hairstyles` | poppy_hairstyles is managed by Stride Social | — |
| `/creators/queenofcleanhome` | queenofcleanhome is managed by Stride Social | — |
| `/creators/radoslavbali` | radoslavbali is managed by Stride Social | — |
| `/creators/rdmcaps` | RdmCaps is managed by Stride Social | — |
| `/creators/rebekah-pumphrey` | Rebekah Pumphrey is managed by Stride Social | — |
| `/creators/relz-tech` | relz_tech is managed by Stride Social | — |
| `/creators/rinseraphina` | Rinseraphina is managed by Stride Social | — |
| `/creators/rittenhouseart` | Rittenhouseart is managed by Stride Social | — |
| `/creators/rosiemayq` | rosiemayq is managed by Stride Social | — |
| `/creators/sagephillipshome` | sagephillipshome is managed by Stride Social | — |
| `/creators/sam-shan-shops` | Sam.shan.shops is managed by Stride Social | — |
| `/creators/sarah-colussi` | sarah.colussi is managed by Stride Social | — |
| `/creators/sarailorenn` | sarailorenn is managed by Stride Social | — |
| `/creators/savage` | savage is managed by Stride Social | — |
| `/creators/shoppingwkay` | shoppingwkay is managed by Stride Social | — |
| `/creators/sidney` | Sidney diongzon is managed by Stride Social | — |
| `/creators/sidneydiongzon` | sidneydiongzon is managed by Stride Social | — |
| `/creators/sofcreedfit` | Sofcreedfit is managed by Stride Social | — |
| `/creators/spencer-sebastian-yang` | spencer.sebastian.yang is managed by Stride Social | — |
| `/creators/steviegayparade` | Steviegayparade is managed by Stride Social | — |
| `/creators/stylebyaliya` | stylebyaliya is managed by Stride Social | — |
| `/creators/sueomani` | Sueomani is managed by Stride Social | — |
| `/creators/t-aylorgarrod` | t.aylorgarrod is managed by Stride Social | — |
| `/creators/tarabianco` | tarabianco is managed by Stride Social | — |
| `/creators/taylorr-monroe` | taylorr_monroe is managed by Stride Social | — |
| `/creators/techdropp` | techdropp is managed by Stride Social | — |
| `/creators/techjoyce` | techjoyce is managed by Stride Social | — |
| `/creators/technicallyalex` | _technicallyalex is managed by Stride Social | — |
| `/creators/the-slow-nomads` | the.slow.nomads is managed by Stride Social | — |
| `/creators/thegreyindian` | Thegreyindian is managed by Stride Social | — |
| `/creators/theheartbreaks` | theheartbreaks is managed by Stride Social | — |
| `/creators/themarklandhome` | themarklandhome is managed by Stride Social | — |
| `/creators/theshufflefluff` | theshufflefluff is managed by Stride Social | — |
| `/creators/thevaglefamily` | TheVagleFamily is managed by Stride Social | — |
| `/creators/thisdudejordan` | thisdudejordan is managed by Stride Social | — |
| `/creators/thislittlehouse` | thislittlehouse is managed by Stride Social | — |
| `/creators/thomashuang` | thomashuang is managed by Stride Social | — |
| `/creators/tiffanydaviesfx` | tiffanydaviesfx is managed by Stride Social | — |
| `/creators/tobesfinds` | TobesFinds is managed by Stride Social | — |
| `/creators/tocbtech` | tocbtech is managed by Stride Social | — |
| `/creators/tocbtech-2` | TocbTech is managed by Stride Social | — |
| `/creators/tsbcomedy` | Tsbcomedy is managed by Stride Social | — |
| `/creators/tyteachestech` | tyteachestech is managed by Stride Social | — |
| `/creators/ugcliza` | ugcliza is managed by Stride Social | — |
| `/creators/umuhaniabdullah` | Umuhaniabdullah is managed by Stride Social | — |
| `/creators/userabbzyyy` | Userabbzyyy is managed by Stride Social | — |
| `/creators/uxui-shrut` | uxui_shrut is managed by Stride Social | — |
| `/creators/valeji` | Valeji is managed by Stride Social | — |
| `/creators/ventureout` | ventureout__ is managed by Stride Social | — |
| `/creators/venusenergyy` | venusenergyy is managed by Stride Social | — |
| `/creators/veteran-joystick` | Veteran.Joystick is managed by Stride Social | — |
| `/creators/w-greta` | W.greta is managed by Stride Social | — |
| `/creators/washy-wash` | washy_wash is managed by Stride Social | — |
| `/creators/weir-home` | weir_home is managed by Stride Social | — |
| `/creators/what-sophie-does` | what.sophie.does is managed by Stride Social | — |
| `/creators/williamharvey92` | williamharvey92 is managed by Stride Social | — |
| `/creators/winkguys` | winkguys is managed by Stride Social | — |
| `/creators/withgeorgy` | WithGeorgy is managed by Stride Social | — |
| `/creators/xoxoashlvy` | Xoxoashlvy_ is managed by Stride Social | — |
| `/creators/yaush1ng` | yaush1ng is managed by Stride Social | — |
| `/creators/yoitslari` | yoitslari is managed by Stride Social | — |
| `/creators/youngbeautyglow` | Youngbeautyglow is managed by Stride Social | — |

## Public assets

| Type | Unique URLs |
|---|---|
| image | 1209 |
| font | 25 |
| video | 14 |
| icon | 2 |

Image counts include Webflow's responsive `-p-500/-p-800/-p-1080` variants. The rebuild stores the original of every image and video under `public/assets/` and keeps a URL-to-file map in `public/assets/manifest.json`.

### Videos

- `6724ac5d97ed60471236e597_1029-transcode.mp4` — used on /zh, /
- `6724ac5d97ed60471236e597_1029-transcode.webm` — used on /zh, /
- `6724ae921fca92c8926f3517_1029(1)-transcode.mp4` — used on /zh, /
- `6724ae921fca92c8926f3517_1029(1)-transcode.webm` — used on /zh, /
- `68adc990b70599f4f2fc912c_Video1-transcode.mp4` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68adc990b70599f4f2fc912c_Video1-transcode.webm` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68adc9bf97774505c5e52ea3_Video 2-transcode.mp4` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68adc9bf97774505c5e52ea3_Video 2-transcode.webm` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68addef7592c71c8975b7aac_vid 6-transcode.mp4` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68addef7592c71c8975b7aac_vid 6-transcode.webm` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68adc9d4b6ae6edcd70d322e_video4-transcode.mp4` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68adc9d4b6ae6edcd70d322e_video4-transcode.webm` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68adc9dac8e19135fccbe600_video 5-transcode.mp4` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies
- `68adc9dac8e19135fccbe600_video 5-transcode.webm` — used on /zh/influencer-seeding, /influencer-seeding, /zh/influencer-strategies, /influencer-strategies

