// One-off migration: converts crawled public HTML from stride-social.com into content
// collection entries under src/content/. Rich text is kept as HTML (one block, no blank
// lines) inside Markdown files so it renders exactly and can be edited as Markdown later.
//
// Usage: node scripts/migrate/extract-content.mjs <crawlDir>
//   <crawlDir> holds <slug>.html files named like `case-studies__meta.html` (see crawl
//   notes in docs/INVENTORY.md) plus `creators__page2.html` / `creators__page3.html`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const crawlDir = process.argv[2];
if (!crawlDir) throw new Error('Pass the crawl directory');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/manifest.json'), 'utf8'));
const contentDir = path.join(root, 'src/content');
const missing = new Set();

const load = (name) => cheerio.load(fs.readFileSync(path.join(crawlDir, `${name}.html`), 'utf8'));
const exists = (name) => fs.existsSync(path.join(crawlDir, `${name}.html`)) && fs.statSync(path.join(crawlDir, `${name}.html`)).size > 0;
const text = ($el) => $el.text().replace(/\s+/g, ' ').replace(/‍/g, '').trim();
const visible = ($, sel, ctx) => (ctx ? ctx.find(sel) : $(sel)).filter((_, e) => !$(e).closest('.w-condition-invisible').length);

export function localAsset(url) {
  if (!url) return null;
  if (url.startsWith('/assets/')) return url;
  let key;
  try { key = decodeURI(new URL(url.replace(/%2F/g, '/')).href); } catch { return url; }
  key = key.replace(/-p-\d+(\.\w+)$/, '$1');
  if (manifest[key]) return `/assets/${manifest[key]}`;
  missing.add(key);
  return url;
}

// Cloudflare email obfuscation: first byte of data-cfemail is the XOR key for the rest.
function decodeCfEmail(hex) {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

function cleanRichText($, $el, { keepLeadingEmpty = false } = {}) {
  const $c = $el.clone();
  $c.find('[class*="w-condition-invisible"], script, style').remove();
  $c.find('[data-cfemail]').each((_, e) => {
    const email = decodeCfEmail($(e).attr('data-cfemail'));
    const $a = $(e).closest('a').length ? $(e).closest('a') : $(e);
    $a.replaceWith(`<a href="mailto:${email}">${email}</a>`);
  });
  $c.find('*').each((_, e) => {
    const $e = $(e);
    for (const attr of Object.keys(e.attribs || {})) {
      if (['href', 'src', 'alt', 'id', 'colspan', 'rowspan', 'target', 'rel'].includes(attr)) continue;
      $e.removeAttr(attr);
    }
    if (e.tagName === 'img') {
      $e.attr('src', localAsset($e.attr('src')));
      $e.attr('loading', 'lazy');
    }
    if (e.tagName === 'a') {
      const href = $e.attr('href') || '';
      $e.attr('href', href.replace(/^https?:\/\/(www\.)?stride-social\.com/i, '') || '/');
    }
  });
  // Webflow wraps figures in extra divs; unwrap empty divs.
  $c.find('div').each((_, e) => { $(e).replaceWith($(e).html()); });
  let html = $c.html() || '';
  // Webflow editors use paragraphs holding only a zero-width joiner as spacers; keep them.
  const leadingEmpty = keepLeadingEmpty && /^<p>\s*<\/p>/.test(html.trim());
  html = html
    .replace(/<p>\s*‍\s*<\/p>/g, '<p>&nbsp;</p>')
    .replace(/‍/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  // Most blog bodies open with an empty paragraph whose margin is part of the live layout.
  return leadingEmpty ? `<p></p>${html}` : html;
}

function yamlValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    return '\n' + v.map((x) => (typeof x === 'object' ? '  - ' + Object.entries(x).map(([k, val], i) => `${i ? '    ' : ''}${k}: ${yamlValue(val)}`).join('\n') : `  - ${yamlValue(x)}`)).join('\n');
  }
  if (typeof v === 'object') return '\n' + Object.entries(v).map(([k, val]) => `  ${k}: ${yamlValue(val)}`).join('\n');
  return JSON.stringify(String(v));
}

function writeEntry(collection, slug, data, body = '') {
  const dir = path.join(contentDir, collection);
  fs.mkdirSync(dir, { recursive: true });
  const fm = Object.entries(data).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${yamlValue(v)}`).join('\n');
  fs.writeFileSync(path.join(dir, `${slug}.md`), `---\n${fm}\n---\n${body ? body + '\n' : ''}`);
}

function writeJson(file, data) {
  fs.mkdirSync(path.join(contentDir, 'data'), { recursive: true });
  fs.writeFileSync(path.join(contentDir, 'data', file), JSON.stringify(data, null, 2) + '\n');
}

function rows($, $ctx) {
  return visible($, '.row-item', $ctx).map((_, r) => {
    const label = text($(r).find('.text-title').first());
    const value = text($(r).find('.text-answer').first());
    return label && value ? { label, value } : null;
  }).get().filter(Boolean);
}

function seo($) {
  const meta = (k) => $(`meta[name="${k}"], meta[property="${k}"]`).attr('content') || null;
  return { title: $('title').text().trim(), description: meta('description'), ogImage: localAsset(meta('og:image')) };
}

function cardInfo($, $a) {
  return {
    tag: text($a.find('.talent-type').first()) || null,
    metric: text($a.find('.followers .text-tiny').first()) || null,
    image: localAsset($a.find('img.talent-image').attr('src')),
  };
}

// ---------- Case studies ----------
const csIndex = load('case-studies');
const csOrder = [];
csIndex('.creators-grid').each((_, list) => {
  const featured = csIndex(list).hasClass('hero');
  csIndex(list).find('a.talent-image-wrapper').each((i, a) => {
    csOrder.push({ slug: csIndex(a).attr('href').split('/').pop(), featured, card: cardInfo(csIndex, csIndex(a)) });
  });
});
const home = load('home');
const homeCubes = home('.flip-cube a').map((i, a) => ({
  slug: home(a).attr('href').split('/').pop(),
  front: localAsset(home(a).find('.f-cube-01 img').attr('src')),
  back: localAsset(home(a).find('.f-cube-03 img').attr('src')),
  blurb: text(home(a).find('.inner-cube-p')),
  order: i,
})).get();

const flowdriveVideos = [];
csOrder.forEach(({ slug, featured, card }, order) => {
  const $ = load(`case-studies__${slug}`);
  const cube = homeCubes.find((c) => c.slug === slug);
  // Only Flowdrive-hosted files are real videos; some entries hold Instagram reel URLs,
  // which cannot play in a <video> element (they render empty on the live site too).
  const videos = visible($, '.section-videos .social-vid source').map((_, s) => $(s).attr('src')).get().filter((src) => /flowdrivecdn\.com/.test(src));
  videos.forEach((src) => flowdriveVideos.push({ slug, src }));
  const quote = text(visible($, '.section-quote h5').not('.bold').first());
  const bodies = visible($, '.case-study-body .rich-text-block');
  writeEntry('case-studies', slug, {
    title: text($('h1.talent-text').first()),
    category: text($('.case-study-hero .talent-type').first()) || null,
    summary: text($('.case-study-hero h2').first()),
    order,
    featured,
    cardImage: card.image,
    cardMetric: card.metric,
    heroImage: localAsset(visible($, '.case-study-body ._2x-grid img').first().attr('src')),
    stats: rows($, $('.case-study-content').first()),
    quote: quote || null,
    videos: videos.map((src) => `/assets/video/flowdrive-${src.split('/').pop()}.mp4`),
    home: cube ? { order: cube.order, front: cube.front, back: cube.back, blurb: cube.blurb } : null,
    seo: seo($),
  }, bodies.map((_, b) => cleanRichText($, $(b))).get().join('\n'));
});

// ---------- Blog ----------
const blogIndex = load('blog');
const blogOrder = [];
blogIndex('.creators-grid').each((_, list) => {
  const featured = blogIndex(list).hasClass('hero');
  blogIndex(list).find('a.talent-image-wrapper').each((_, a) => {
    blogOrder.push({ slug: blogIndex(a).attr('href').split('/').pop(), featured, card: cardInfo(blogIndex, blogIndex(a)), name: text(blogIndex(a).find('.talent-name')), date: text(blogIndex(a).find('.followers .text-tiny').eq(1)) });
  });
});
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
blogOrder.forEach(({ slug, featured, card, name, date: listLabel }, order) => {
  const $ = load(`blog__${slug}`);
  const meta = visible($, '.case-study-body .row-item .text-title').map((_, t) => text($(t))).get();
  const date = meta[0] || null;
  const author = meta.slice(1).join(' ').replace(/^Author -\s*/, '') || null;
  const parsed = date ? new Date(date + ' 12:00 UTC') : null;
  const aside = visible($, '.case-study-body .grid-2x > :not(.blog-container) img').first().attr('src');
  const title = text($('h1.talent-text').first());
  const iso = parsed && !isNaN(parsed) ? parsed.toISOString().slice(0, 10) : null;
  const shortLabel = iso ? `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : null;
  writeEntry('blog', slug, {
    title,
    // Index cards of a few legacy posts show a short CMS name / month that differ from the post.
    cardTitle: name && name !== title ? name : undefined,
    listDate: !featured && listLabel && listLabel !== shortLabel ? listLabel : undefined,
    category: text($('.case-study-hero .talent-type').first()) || null,
    summary: text($('.case-study-hero h2').first()),
    date: parsed && !isNaN(parsed) ? parsed.toISOString().slice(0, 10) : null,
    dateLabel: date,
    author,
    order,
    featured,
    cardImage: card.image,
    asideImage: localAsset(aside) || card.image,
    seo: seo($),
  }, cleanRichText($, visible($, '.blog-container .rich-text-block').first(), { keepLeadingEmpty: true }));
});

// ---------- Creators ----------
const creatorOrder = [];
for (const page of ['creators', 'creators__page2', 'creators__page3']) {
  const $ = load(page);
  $('.collection-item-4 a.talent-image-wrapper').each((_, a) => {
    creatorOrder.push({ slug: $(a).attr('href').split('/').pop(), card: cardInfo($, $(a)), name: text($(a).find('.talent-name')) });
  });
}
// Profiles without a photo still carry the Webflow template's stock picture, which the live
// site hides; store null so no stranger's face is shown.
const PLACEHOLDER_PHOTO = '/assets/site/8228980c-team-04.jpg';
const photoOrNull = (src) => (!src || src === PLACEHOLDER_PHOTO ? null : src);
const creatorSlugs = new Set();
creatorOrder.forEach(({ slug, card, name }, order) => {
  creatorSlugs.add(slug);
  if (!exists(`creators__${slug}`)) {
    // Listed on the index but the profile page 404s on the live site; keep a card-only entry.
    writeEntry('creators', slug, { name, type: null, category: card.tag, followers: card.metric, order, image: photoOrNull(card.image), profile: false });
    return;
  }
  const $ = load(`creators__${slug}`);
  const socials = {};
  visible($, '.social-links a.social-link').each((_, a) => {
    const href = $(a).attr('href');
    if (!href || href === '#') return;
    const host = new URL(href, 'https://x.y').hostname.replace('www.', '');
    const key = host.includes('tiktok') ? 'tiktok' : host.includes('instagram') ? 'instagram' : host.includes('youtube') || host.includes('youtu.be') ? 'youtube' : host.includes('twitch') ? 'twitch' : host.includes('x.com') || host.includes('twitter') ? 'x' : 'website';
    socials[key] = href;
  });
  const rowsList = visible($, '.talent-content-wrapper .row-item').map((_, r) => ({ label: text($(r).find('.info, .row-title-wrapper').first()), value: text($(r).find('.text-answer').first()) })).get();
  const managed = visible($, 'h3.heading-3').first().text().includes('managed');
  writeEntry('creators', slug, {
    name: text($('h1.talent-text').first()) || name,
    type: text($('.talent-heading .talent-type').first()) || null,
    category: rowsList.find((r) => /category/i.test(r.label))?.value || card.tag,
    followers: rowsList.find((r) => /followers/i.test(r.label))?.value || card.metric,
    biggestChannel: rowsList.find((r) => /biggest channel/i.test(r.label))?.value || null,
    relationship: managed ? 'managed' : 'ugc-partner',
    socials,
    order,
    image: photoOrNull(localAsset($('.talent-hero img').attr('src')) || card.image),
    profile: true,
    seo: seo($),
  }, cleanRichText($, visible($, '.talent-content-wrapper .rich-text-block').first()));
});

// ---------- Jobs ----------
const careers = load('careers');
careers('a[href^="/jobs/"]').each((order, a) => {
  const slug = careers(a).attr('href').split('/').pop();
  const $ = load(`jobs__${slug}`);
  const meta = visible($, '.row-item .row-item-h3').map((_, h) => text($(h))).get().filter(Boolean);
  writeEntry('jobs', slug, {
    title: text($('h1.talent-text').first()),
    tag: text($('.case-study-hero .talent-type').first()) || null,
    summary: text($('.case-study-hero h2').first()),
    location: meta[0] || null,
    salary: (meta.find((m) => /salary/i.test(m)) || '').replace(/^Salary -\s*/, '') || null,
    order,
    seo: seo($),
  }, cleanRichText($, visible($, '.jobs-wrapper .rich-text-block').first()));
});

// ---------- Shared page data ----------
writeJson('testimonials.json', home('.quote_slide').map((i, s) => ({
  id: String(i + 1).padStart(2, '0'),
  quote: text(home(s).find('.text-size-xl')),
  name: text(home(s).find('.text-size-large-2')),
  role: text(home(s).find('.text-size-small-2')),
  avatar: localAsset(home(s).find('img').attr('src')),
})).get());

writeJson('client-logos.json', home('.ticker-wrapper').first().find('img.logo').map((n, i) => ({
  id: String(n + 1).padStart(2, '0'),
  src: localAsset(home(i).attr('src')),
  alt: home(i).attr('alt') || '',
})).get());

fs.writeFileSync(path.join(root, 'scripts/migrate/flowdrive-videos.json'), JSON.stringify(flowdriveVideos, null, 2));
console.log({ caseStudies: csOrder.length, blog: blogOrder.length, creators: creatorOrder.length, flowdriveVideos: flowdriveVideos.length, missingAssets: missing.size });
if (missing.size) console.log([...missing].slice(0, 20).join('\n'));
