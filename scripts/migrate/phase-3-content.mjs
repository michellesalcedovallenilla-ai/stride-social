// One-off Stage 2 migration: builds the Phase 3 collections from the Phase 1 (legacy) content.
// Nothing is invented. Mappings that need Stride's approval are written with a `proposed`
// status, and facts copied from the old site are marked `legacy` (re-confirm before launch).
// Outputs: src/content/{services,brands,team,testimonials,roster,work,insights}
// Usage: node scripts/migrate/phase-3-content.mjs
// After Stage 2, edit the new files by hand; re-running overwrites them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const content = path.join(root, 'src/content');
const LEGACY_SOURCE = 'Published on the previous stride-social.com (migrated October 2026)';

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

function readEntries(dir) {
  return fs.readdirSync(path.join(content, dir)).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(content, dir, f), 'utf8').replace(/\r\n/g, '\n');
    const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    return { id: f.replace(/\.md$/, ''), data: YAML.parse(fm), body: body.trim() };
  });
}
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));

function reset(dir) {
  const d = path.join(content, dir);
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
  return d;
}
const yaml = (o) => YAML.stringify(o, { lineWidth: 0 }).trimEnd();
const writeMd = (dir, id, data, body = '') => fs.writeFileSync(path.join(content, dir, `${id}.md`), `---\n${yaml(data)}\n---\n${body ? body + '\n' : ''}`);
const writeYaml = (dir, id, data) => fs.writeFileSync(path.join(content, dir, `${id}.yaml`), yaml(data) + '\n');

/* ---------- Services (7, PDF §4) ---------- */
const strategies = readJson('src/data/offering-strategies.json');
const homeServices = readJson('src/content/data/services.json');
const tab = (title) => strategies.tabs.find((t) => t.title.toLowerCase().startsWith(title.toLowerCase()));
const services = [
  { id: 'influencer-activations', name: 'Influencer Activations', descriptor: 'Influencer partnerships with creators of all sizes.', source: tab('Influencer Activations'), label: 'previous site: Influencer Strategies → Influencer Activations' },
  { id: 'influencer-seeding', name: 'Influencer Seeding', descriptor: 'Product gifting and creator activation at scale.', source: tab('Influencer SEEDING'), label: 'previous site: Influencer Strategies → Influencer Seeding' },
  { id: 'ugc-production', name: 'UGC Production', descriptor: 'Creator-produced content for organic and paid advertising.', source: tab('Content Creation'), label: 'previous site: Influencer Strategies → Content Creation for Paid & Organic socials (UGC)' },
  { id: 'tiktok-shop', name: 'TikTok Shop', descriptor: 'Affiliate creator campaigns and social commerce.', source: tab('Influencer Affiliate'), label: 'previous site: Influencer Strategies → Influencer Affiliate program (closest match; confirm it covers TikTok Shop)' },
  { id: 'tiktok-shop-livestreams', name: 'TikTok Shop Livestreams', descriptor: 'Live selling, presenters, and production.', source: { html: homeServices.find((s) => /livestream/i.test(s.title))?.description }, label: 'previous site: homepage services → TikTok shop Livestreams' },
  { id: 'influencer-events', name: 'Influencer Events', descriptor: 'Creator events, PR experiences, and activations.', source: tab('Brand Influencer Events'), label: 'previous site: Influencer Strategies → Brand Influencer Events' },
  { id: 'podcast-activations', name: 'Podcast Activations', descriptor: 'Creator-led advertising through podcasts.', source: null, label: null },
];
reset('services');
services.forEach((s, i) => {
  const html = s.source?.html?.trim();
  writeMd('services', s.id, { name: s.name, number: i + 1, descriptor: s.descriptor, copyStatus: html ? 'draft' : 'needed' },
    html ? `<!-- Draft body: copied verbatim from the ${s.label}. Rewrite or approve. -->\n${html}` : '<!-- No existing copy. Needs writing from Stride input. -->');
});

/* ---------- Brands ---------- */
const logoNames = ['Student Minds', 'Blitz', null, 'Genshin Impact', 'Voodoo', 'Azar', 'Fairy', 'Anker', 'Bloom', 'Zovoo', 'AliExpress', 'Tooletries', 'Tinder', 'Bulldog Skincare', 'ACE', 'NordVPN', 'Bolt', 'Manscaped', 'Cash App', 'Merge Gardens'];
const logos = readJson('src/content/data/client-logos.json');
const brands = new Map();
logos.forEach((l, i) => {
  const name = logoNames[i] ?? `Unidentified logo ${l.id}`;
  brands.set(slug(name), { id: slug(name), name, logo: l.src, approval: { status: 'legacy' } });
});
const legacyCases = readEntries('case-studies');
const clientName = (c) => ({ 'aliexpress-2': 'AliExpress', 'holafly-app---driving-app-downloads-with-travel-influencers': 'Holafly', 'temu-scaling-paid-social-with-500-ugc-videos': 'Temu', 'comfelie-driving-20k-in-sales': 'Comfelie', 'mars-group': 'Mars', 'overdub-app': 'Overdub' })[c.id] ?? c.data.title;
for (const c of legacyCases) {
  const name = clientName(c);
  if (!brands.has(slug(name))) brands.set(slug(name), { id: slug(name), name, logo: null, approval: { status: 'none' } });
}
// Named as partners in the client brief (PDF §3.5 and §4); logos and approval still needed (Q5).
for (const name of ['Samsung', 'Barsys', 'Adobe', 'P&G']) if (!brands.has(slug(name))) brands.set(slug(name), { id: slug(name === 'P&G' ? 'procter-gamble' : name), name, logo: null, approval: { status: 'none' } });
reset('brands');
fs.writeFileSync(path.join(content, 'brands/brands.yaml'),
  '# Brand partners. approval.status: confirmed (Stride approved display) · legacy (logo shown on the old site) · none.\n' +
  yaml([...brands.values()].sort((a, b) => a.name.localeCompare(b.name))) + '\n');

/* ---------- Team ---------- */
const departmentOf = (role) =>
  /founder/i.test(role) ? 'leadership' : /head of/i.test(role) ? 'leadership' : /talent/i.test(role) ? 'talent' : /campaign|influencer marketing|seeding/i.test(role) ? 'campaigns' : /social media/i.test(role) ? 'social' : /sales|business/i.test(role) ? 'sales' : 'operations';
const teamJson = readJson('src/content/data/company-team.json');
reset('team');
const teamIds = new Map();
teamJson.forEach((m, i) => {
  const id = slug(m.name);
  teamIds.set(m.name.toLowerCase(), id);
  const entry = { name: m.name, role: m.role, department: departmentOf(m.role), photo: { src: m.photo, alt: `${m.name}, ${m.role} at Stride` }, order: i + 1 };
  if (m.hoverPhoto) entry.photoAlt = { src: m.hoverPhoto, alt: `${m.name}, ${m.role} at Stride` };
  writeYaml('team', id, entry);
});

/* ---------- Testimonials ---------- */
const legacyQuotes = readJson('src/content/data/testimonials.json');
reset('testimonials');
legacyQuotes.forEach((q) => {
  const creator = /creator|talent/i.test(q.role);
  writeYaml('testimonials', `${slug(q.name)}`, {
    quote: q.quote, name: q.name, role: q.role, type: creator ? 'creator' : 'brand', division: creator ? 'talent' : 'social',
    image: { src: q.avatar, alt: q.name }, consent: { status: 'legacy' }, featured: false,
  });
});

/* ---------- Roster ---------- */
const categoryMap = { Lifestyle: 'lifestyle', Entertainment: 'other', 'Tech reviews': 'technology', 'Amazon finds': 'lifestyle', Beauty: 'beauty', Fashion: 'fashion', Gaming: 'technology', Cleaning: 'lifestyle', Comedy: 'other', Family: 'lifestyle', Home: 'lifestyle', Travel: 'travel', 'Food review': 'lifestyle' };
const platformKey = (k) => ({ tiktok: 'tiktok', instagram: 'instagram', youtube: 'youtube', twitch: 'twitch', x: 'x', website: 'website' })[k];
reset('roster');
for (const c of readEntries('creators')) {
  const d = c.data;
  const platforms = {};
  for (const [k, v] of Object.entries(d.socials ?? {})) if (platformKey(k)) platforms[platformKey(k)] = v;
  writeMd('roster', c.id, {
    name: d.name,
    portrait: d.image ? { src: d.image, alt: `Portrait of ${d.name}` } : null,
    mainCategory: d.category ? (categoryMap[d.category] ?? 'other') : null,
    categories: [],
    categoryStatus: 'proposed',
    legacyCategory: d.category ?? null,
    divisions: [],
    country: null,
    platforms,
    relationship: d.relationship === 'managed' ? 'managed' : 'partner',
    audience: d.followers ? { figure: d.followers, platform: d.biggestChannel ?? null, source: LEGACY_SOURCE, status: 'legacy' } : null,
    order: d.order,
    consent: { status: 'legacy' },
    ...(d.seo ? { seo: { title: d.seo.title, description: d.seo.description } } : {}),
  }, c.body);
}

/* ---------- Work (case studies) ---------- */
const industriesFor = {
  airup: ['lifestyle'], aliexpress: ['lifestyle'], 'aliexpress-2': ['lifestyle'], anker: ['technology'], bloom: ['lifestyle'], 'c2-gripz': [],
  'comfelie-driving-20k-in-sales': ['fashion'], 'glam-ai': ['technology'], govee: ['home', 'technology'], 'greene-king': ['lifestyle'],
  'holafly-app---driving-app-downloads-with-travel-influencers': ['travel'], jackery: ['technology'], laifen: ['beauty', 'technology'], 'mars-group': ['lifestyle'],
  meta: ['technology'], narwal: ['home', 'technology'], 'overdub-app': ['technology'], 'papaya-gaming': ['technology'], rhinoshields: ['technology'],
  ring: ['home', 'technology'], 'temu-scaling-paid-social-with-500-ugc-videos': ['lifestyle'], tooletries: ['home'], trainpal: ['travel'], 'true-classic': ['fashion'], xgimi: ['technology', 'home'],
};
// Service tags Stride itself published on the old Influencer Strategies page.
const publishedServices = {};
for (const t of strategies.tabs) {
  const svc = /activation/i.test(t.title) ? 'influencer-activations' : /content creation/i.test(t.title) ? 'ugc-production' : null;
  if (svc) for (const id of t.caseStudies ?? []) publishedServices[id] = svc;
}
const homeOrder = { laifen: 3, govee: 4, xgimi: 5 }; // PDF §3.5 order: Samsung, Barsys, Laifen, Govee, XGIMI
const genericQuotes = new Set(legacyQuotes.map((q) => q.quote.trim()));

function splitSections(html) {
  const out = { brief: [], strategy: [], execution: [], results: [] };
  let found = false;
  for (const p of html.match(/<p>[\s\S]*?<\/p>/g) ?? []) {
    const m = p.match(/^<p><strong>([^<:]+):?\s*<\/strong>\s*([\s\S]*)<\/p>$/);
    if (!m) continue;
    const label = m[1].trim().toLowerCase();
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (/background|objective|brief|challenge/.test(label)) out.brief.push(text);
    else if (/strategy|approach/.test(label)) out.strategy.push(text);
    else if (/execution/.test(label)) out.execution.push(text);
    else if (/result/.test(label)) out.results.push(text);
    else continue;
    found = true;
  }
  const join = (a) => (a.length ? a.join('\n\n') : null);
  return { found, brief: join(out.brief), strategy: join(out.strategy), execution: join(out.execution), resultsSummary: join(out.results) };
}

reset('work');
for (const c of legacyCases) {
  const d = c.data;
  const s = splitSections(c.body);
  const contentStatus = !s.found ? 'needs-rewrite' : s.brief && s.strategy && s.execution ? 'complete' : 'needs-input';
  const client = slug(clientName(c));
  const quoteText = d.quote?.trim();
  writeMd('work', c.id, {
    title: d.title,
    client,
    summary: d.summary,
    services: [publishedServices[c.id] ?? (/ugc/i.test(d.category ?? '') ? 'ugc-production' : 'influencer-activations')],
    industries: industriesFor[c.id] ?? [],
    tagStatus: 'proposed',
    markets: [],
    year: null,
    hero: d.heroImage ? { src: d.heroImage, alt: `${d.title} campaign image` } : null,
    card: { src: d.cardImage, alt: `${d.title} campaign` },
    homeTile: d.home ? { front: { src: d.home.front, alt: `${d.title} campaign` }, back: { src: d.home.back, alt: `${d.title} campaign` }, blurb: d.home.blurb } : null,
    videos: (d.videos ?? []).map((src) => ({ src })),
    brief: s.brief,
    strategy: s.strategy,
    execution: s.execution,
    resultsSummary: s.resultsSummary,
    results: (d.stats ?? []).map((r) => ({ label: r.label, value: r.value, source: LEGACY_SOURCE, status: 'legacy' })),
    creators: [],
    // The old site attached general testimonials to campaigns; those are not campaign quotes.
    quote: quoteText ? { text: quoteText, status: genericQuotes.has(quoteText) ? 'unverified' : 'legacy' } : null,
    featuredOn: homeOrder[c.id] ? ['home'] : [],
    featuredOrder: homeOrder[c.id] ?? null,
    contentStatus,
    order: d.order,
    ...(d.seo ? { seo: { title: d.seo.title, description: d.seo.description } } : {}),
  }, `<!-- Original case study copy from the previous site, kept for the editorial rewrite. -->\n${c.body}`);
}

/* ---------- Insights (blog) ---------- */
const insightCategory = { News: 'marketing-insights', Industry: 'creator-economy', 'Our work': 'company-news' };
reset('insights');
for (const p of readEntries('blog')) {
  const d = p.data;
  // Link to a team profile only on an exact full-name match. The team list holds first names
  // only, so "Alex Hendy" is not assumed to be team member "Alex".
  const author = teamIds.get((d.author ?? '').toLowerCase()) ?? null;
  const entry = {
    title: d.title,
    category: insightCategory[d.category] ?? 'marketing-insights',
    categoryStatus: 'proposed',
    date: d.date ?? null,
    author,
    authorName: d.author ?? null,
    standfirst: d.summary,
    cover: { src: d.cardImage, alt: d.title },
    aside: d.asideImage && d.asideImage !== d.cardImage ? { src: d.asideImage, alt: d.title } : null,
    featured: d.featured,
    order: d.order,
    ...(d.cardTitle ? { cardTitle: d.cardTitle } : {}),
    ...(d.listDate ? { listDate: d.listDate } : {}),
    ...(d.seo ? { seo: { title: d.seo.title, description: d.seo.description } } : {}),
  };
  writeMd('insights', p.id, entry, p.body);
}

console.log({
  services: services.length, brands: brands.size, team: teamJson.length, testimonials: legacyQuotes.length,
  roster: fs.readdirSync(path.join(content, 'roster')).length, work: legacyCases.length, insights: fs.readdirSync(path.join(content, 'insights')).length,
});
