# Editing the Stride website

All content lives in this repository as text files. You (or Claude Code, working for you) edit a file, run the checks, and open a pull request. A reviewer checks the preview and merges it, and the site rebuilds. Nobody edits the live site directly.

## The workflow

1. Create a branch: `content/<what>` for content, `fix/<what>` or `feature/<what>` for code.
2. Make the change. Asking Claude Code works well, for example: "Add the Samsung case study from this brief", "Change the Talent hero line to …", "Mark Ollie's portrait as approved".
3. Run `npm run ci`. It must pass.
4. Open a pull request using the template. The preview link shows the change, labelled placeholders included.
5. A reviewer approves it, then it's merged.

## Where things are

| To change… | Edit |
|---|---|
| Words on a landing or group page | `src/content/pages/<page>.yaml` (home, social, talent, education, about, history, team, careers, contact, insights, sponsorships, work, system) |
| A case study | `src/content/work/<slug>.md` |
| A creator profile | `src/content/roster/<slug>.md` |
| An article | `src/content/insights/<slug>.md` |
| A service | `src/content/services/<slug>.md` |
| A team member | `src/content/team/<id>.yaml` |
| A testimonial | `src/content/testimonials/<id>.yaml` |
| A brand / logo | `src/content/brands/brands.yaml` |
| A history milestone | `src/content/history/milestones.yaml` |
| A job | `src/content/careers/<slug>.md` |
| A sponsorship | `src/content/sponsorships/<slug>.md` (new file) |
| Education topics and benefits | `src/content/education/topics.yaml`, `experience.yaml` |
| Talent divisions | `src/content/talent-divisions/<id>.md` |
| Legal text | `src/content/legal/{privacy,cookies,terms}.md` |
| Menus and footer | `src/config/navigation.ts` |
| Form options (markets, platforms) | `src/config/forms.ts` |

Field names and allowed values are defined in `src/content.config.ts`. A wrong value fails the build with a message naming the file and field.

## Status fields: what reaches the live site

The site never shows unconfirmed facts. Every piece of content that needs Stride's confirmation has a status, and the production build follows it.

| Content | Field | Live site shows it when |
|---|---|---|
| Page copy sections | `status` | `approved`. `draft` shows a "Draft copy" label in preview and blocks a release. |
| Creator profiles, creator quotes | `consent.status` | `confirmed` |
| Case study results | `results[].status` | `verified` (each figure needs a `source`) |
| Case study quotes | `quote.status` | `verified` |
| Brand logos | `approval.status` | `confirmed` |
| Education topics and benefits | `status` | `available` (shown as "Available now") or `planned` ("Coming soon") |
| History milestones | `status` | `verified` |
| Jobs | `status` | `open` |
| Sponsorships | `approval.status` | `confirmed` |
| Talent divisions | `status` | `active` (otherwise a "coming soon" holding page) |
| Legal pages | `status` | `approved` |
| Services, divisions, education items | `copyStatus` | `approved` |

**Only change a status after Stride confirms it**, and say who confirmed it in the pull request. `npm run check:content` lists everything still waiting; `npm run check:content -- --strict` and `npm run check:placeholders -- --strict` must pass before launch.

## Writing rules

- Never invent creators, follower counts, quotes, results, statistics, clients, logos, awards, offices or team members.
- Every figure needs a `source`. Headlines from the client brief stay word for word.
- Tone: confident, direct, human, brief. No filler ("unlock", "elevate", "seamless", "cutting-edge").
- Every image needs meaningful `alt` text (what's in the picture, not "image of").

## Images and video

- Put images in `public/assets/cms/` and reference them as `/assets/cms/<file>`. Any size works: the build makes WebP copies at 480 to 1800px wide and serves the right one automatically.
- Video: MP4 (H.264), plus WebM if possible, always with a poster image. Keep hero clips under about 4MB. Videos are stored with Git LFS.

## Adding common things

- **Case study:** copy an existing file in `src/content/work/`. Fill in `client` (a brand id), `services`, `industries`, `summary`, `hero`/`card` images, `brief`, `strategy`, `execution` and verified `results` with sources. Set `featuredOn: [home]` or `[social]` to feature it.
- **Creator:** copy a roster file. Set `consent.status: confirmed` with `confirmedBy` and `date` only once consent is recorded. Add them to a case study's `creators` list to show selected work.
- **Article:** copy an insights file; set `category` (company-news, creator-economy, marketing-insights, education), `date`, `standfirst`, `cover` and the body.
- **Job:** copy a careers file; set `status: open` once it's live.

## Old URLs

Old stride-social.com addresses (`/case-studies/…`, `/blog/…`, `/creators/…`, `/jobs/…`, `/zh/…`) redirect automatically. The map is `scripts/redirects/map.mjs`, and `npm run check:redirects` tests every URL from the old sitemap.
