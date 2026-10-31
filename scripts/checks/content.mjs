// Content status report for the Phase 3 collections: what is approved and publishable, and what
// still needs Stride (consent, verification, proposed tags, draft copy, missing data). Also
// checks that every cross-reference points at an existing entry.
// Default: report. --strict (pre-launch gate): exit 1 while anything is not publishable.
// Usage: node scripts/checks/content.mjs [--strict]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const content = path.join(root, 'src/content');
const strict = process.argv.includes('--strict');

const md = (dir) =>
  fs.readdirSync(path.join(content, dir)).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(content, dir, f), 'utf8').replace(/\r\n/g, '\n');
    return { id: f.slice(0, -3), ...YAML.parse(raw.match(/^---\n([\s\S]*?)\n---/)[1]) };
  });
const yamlDir = (dir) => fs.readdirSync(path.join(content, dir)).filter((f) => f.endsWith('.yaml')).map((f) => ({ id: f.slice(0, -5), ...YAML.parse(fs.readFileSync(path.join(content, dir, f), 'utf8')) }));
const yamlList = (file) => YAML.parse(fs.readFileSync(path.join(content, file), 'utf8'));
const count = (items, fn) => items.reduce((m, i) => ((m[fn(i) ?? 'null'] = (m[fn(i) ?? 'null'] ?? 0) + 1), m), {});

const roster = md('roster');
const work = md('work');
const insights = md('insights');
const services = md('services');
const divisions = md('talent-divisions');
const team = yamlDir('team');
const testimonials = yamlDir('testimonials');
const brands = yamlList('brands/brands.yaml');
const categories = yamlList('taxonomies/categories.yaml');
const industries = yamlList('taxonomies/industries.yaml');
const markets = yamlList('taxonomies/markets.yaml');
const topics = yamlList('education/topics.yaml');
const experience = yamlList('education/experience.yaml');

const ids = (list) => new Set(list.map((x) => x.id));
const refs = { categories: ids(categories), industries: ids(industries), services: ids(services), brands: ids(brands), roster: ids(roster), team: ids(team), talentDivisions: ids(divisions) };
const broken = [];
const check = (where, kind, value) => value && !refs[kind].has(value) && broken.push(`${where} → ${kind}:${value}`);
roster.forEach((r) => { check(`roster/${r.id}`, 'categories', r.mainCategory); (r.categories ?? []).forEach((c) => check(`roster/${r.id}`, 'categories', c)); (r.divisions ?? []).forEach((d) => check(`roster/${r.id}`, 'talentDivisions', d)); });
work.forEach((w) => { check(`work/${w.id}`, 'brands', w.client); (w.services ?? []).forEach((s) => check(`work/${w.id}`, 'services', s)); (w.industries ?? []).forEach((s) => check(`work/${w.id}`, 'industries', s)); (w.creators ?? []).forEach((s) => check(`work/${w.id}`, 'roster', s)); });
insights.forEach((p) => check(`insights/${p.id}`, 'team', p.author));

const issues = [];
const flag = (label, n) => n && issues.push([label, n]);
const visibleRoster = roster.filter((r) => r.visible !== false);
flag('Roster: consent not confirmed', visibleRoster.filter((r) => r.consent?.status !== 'confirmed').length);
flag('Roster: category mapping proposed', visibleRoster.filter((r) => r.categoryStatus !== 'approved').length);
flag('Roster: no main category', visibleRoster.filter((r) => !r.mainCategory).length);
flag('Roster: no country', visibleRoster.filter((r) => !r.country).length);
flag('Roster: no portrait', visibleRoster.filter((r) => !r.portrait).length);
flag('Roster: audience figure not verified', visibleRoster.filter((r) => r.audience && r.audience.status !== 'verified').length);
const visibleWork = work.filter((w) => w.visible !== false);
flag('Work: content not complete (brief/strategy/execution)', visibleWork.filter((w) => w.contentStatus !== 'complete').length);
flag('Work: industry/service tags proposed', visibleWork.filter((w) => w.tagStatus !== 'approved').length);
flag('Work: results not verified', visibleWork.reduce((n, w) => n + (w.results ?? []).filter((r) => r.status !== 'verified').length, 0));
flag('Work: quotes not verified', visibleWork.filter((w) => w.quote && w.quote.status !== 'verified').length);
flag('Insights: category proposed', insights.filter((p) => p.categoryStatus !== 'approved').length);
flag('Services: copy not approved', services.filter((s) => s.copyStatus !== 'approved').length);
flag('Divisions: copy not approved', divisions.filter((d) => d.copyStatus !== 'approved').length);
flag('Brands: display not confirmed (shown in logo strips)', brands.filter((b) => b.logo && b.approval?.status !== 'confirmed').length);
flag('Testimonials: consent not confirmed', testimonials.filter((t) => t.consent?.status !== 'confirmed').length);
flag('Education: availability unconfirmed', [...topics, ...experience].filter((i) => i.status === 'unconfirmed').length);
flag('Markets: not verified', markets.filter((m) => m.status !== 'verified').length);

console.log('Phase 3 content');
console.log(`  roster ${roster.length} · work ${work.length} · insights ${insights.length} · services ${services.length} · divisions ${divisions.length} · team ${team.length} · testimonials ${testimonials.length} · brands ${brands.length}`);
console.log(`  roster consent ${JSON.stringify(count(roster, (r) => r.consent?.status))} · work content ${JSON.stringify(count(work, (w) => w.contentStatus))} · brands approval ${JSON.stringify(count(brands, (b) => b.approval?.status))}`);
console.log(broken.length ? `\nBroken references (${broken.length}):\n  ${broken.join('\n  ')}` : '\nReferences: all resolve.');
console.log(issues.length ? `\nNeeds Stride before launch:\n${issues.map(([l, n]) => `  ${String(n).padStart(4)}  ${l}`).join('\n')}` : '\nEverything publishable.');
process.exit(broken.length || (strict && issues.length) ? 1 : 0);
