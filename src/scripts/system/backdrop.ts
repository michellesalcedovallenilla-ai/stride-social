// The page's background as one continuous layer behind everything (SiteLayout), its colour following the
// scroll. Every section says which of the palette's colours it lives in ([data-look]): that colour holds
// while the section fills the screen, and the next one's comes in as it rises. Going between two colours the
// background travels along the palette itself (RAMP), so it never passes through anything off-palette.
// A section with data-to moves slowly to a second colour over its own length.
//
// The whole screen has one background, so the whole screen has one ink: text, hairlines and glass turn from
// white to navy at the point where both still read best (html[data-ink], tokens.css). Anything on a photo
// keeps its own (.on-photo). It's all tied to the scroll position, so it plays both ways at the visitor's own
// speed, and costs nothing between sections.
//
// Anything else that has to match the background at every moment carries [data-backdrop] and reads
// --backdrop. The homepage's pages overlap, so it supplies its own stops (home-portals.ts).

type RGB = [number, number, number];

// The soft light over each light colour (the dark ones take their division's, from tokens.css).
const SOFT: Partial<Record<string, { w: RGB; d: RGB }>> = {
  ice: { w: [255, 255, 255], d: [245, 252, 255] },
  pale: { w: [255, 255, 255], d: [207, 237, 248] },
  frost: { w: [207, 237, 248], d: [233, 250, 253] },
  white: { w: [233, 250, 253], d: [245, 252, 255] },
};

const LOOKS = {
  deep: [6, 20, 43],
  navy: [12, 39, 83],
  slate: [41, 67, 104],
  steel: [120, 146, 171],
  ice: [207, 237, 248],
  pale: [233, 250, 253],
  frost: [245, 252, 255],
  white: [255, 255, 255],
} satisfies Record<string, RGB>;
type LookName = keyof typeof LOOKS;

// The palette from dark to light.
const RAMP: LookName[] = ['deep', 'navy', 'slate', 'steel', 'ice', 'pale', 'frost', 'white'];

/** The palette colours between two looks. */
const between = (a: LookName, b: LookName): RGB[] => {
  if (a === b) return [];
  const [i, j] = [RAMP.indexOf(a), RAMP.indexOf(b)];
  const step = i <= j ? 1 : -1;
  const path: LookName[] = [];
  for (let n = i; n !== j + step; n += step) path.push(RAMP[n]);
  return path.filter((x) => x !== a && x !== b).map((x) => LOOKS[x]);
};

type Look = { look: LookName; c: RGB; w: RGB; d: RGB };
export type Stop = Look & { y: number; via?: RGB[] };
type Scene = Look & { top: number; bottom: number; to: LookName };

const triple = (el: Element, token: string): RGB | null => {
  const parts = getComputedStyle(el).getPropertyValue(token).trim().split(/\s+/).map(Number);
  return parts.length === 3 && parts.every((n) => !Number.isNaN(n)) ? (parts as RGB) : null;
};

export const lookOf = (el: HTMLElement): Look => {
  const look = (el.dataset.look ?? 'deep') as LookName;
  return { look, c: LOOKS[look] ?? LOOKS.deep, w: triple(el, '--tone-wash') ?? LOOKS.steel, d: triple(el, '--tone-depth') ?? LOOKS.slate };
};

/** Sections as scenes, with positions relative to `origin` (a viewport position). */
export function scenesFrom(els: Iterable<HTMLElement>, origin: number): Scene[] {
  const scenes: Scene[] = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.height > 0) {
      const look = lookOf(el);
      scenes.push({ ...look, top: r.top - origin, bottom: r.bottom - origin, to: (el.dataset.to as LookName) ?? look.look });
    }
  }
  return scenes;
}

const outermost = (els: Iterable<HTMLElement>) =>
  [...els].filter((el) => {
    const parent = el.parentElement?.closest('[data-look]');
    return !parent || parent === document.documentElement;
  });

/** The sections inside a page, relative to its top. */
export const scenesIn = (root: HTMLElement) => scenesFrom(outermost(root.querySelectorAll<HTMLElement>('[data-look]')), root.getBoundingClientRect().top);

/** Scenes as scroll positions, with `start` the scroll at which their origin reaches the top of the screen.
 *  A scene holds while it fills the screen; one shorter than the screen is a single moment. */
export function stopsFor(scenes: Scene[], start: number, vh: number): Stop[] {
  const stops: Stop[] = [];
  for (const s of scenes) {
    const a = start + s.top;
    const b = start + s.bottom - vh;
    const { look, c, w, d, to } = s;
    if (b > a) stops.push({ look, c, w, d, y: a }, { look: to, c: LOOKS[to] ?? c, w: SOFT[to]?.w ?? w, d: SOFT[to]?.d ?? d, y: b });
    else stops.push({ look, c, w, d, y: (a + b) / 2 });
  }
  return stops;
}

const root = document.documentElement;
let provider: (() => Stop[]) | null = null;
let stops: Stop[] = [];
let layers: HTMLElement[] = [];
let last = '';
let raf = 0;
let started = false;

const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const text = (c: RGB) => `${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])}`;

const lookAt = (y: number): Pick<Look, 'c' | 'w' | 'd'> | null => {
  if (!stops.length) return null;
  if (y <= stops[0].y) return stops[0];
  for (let i = 1; i < stops.length; i++) {
    const b = stops[i];
    if (y > b.y) continue;
    const a = stops[i - 1];
    const span = b.y - a.y;
    if (span <= 0) return b;
    const t = (y - a.y) / span;
    const k = t * t * (3 - 2 * t);
    // Along the palette: an even share of the way for each colour, and half for those through steel, its one
    // mid-tone, so nothing lingers where text has least contrast.
    const route = [a.c, ...(b.via ?? []), b.c];
    const shares = route.slice(1).map((c, n) => (c === LOOKS.steel || route[n] === LOOKS.steel ? 0.5 : 1));
    let left = k * shares.reduce((sum, x) => sum + x, 0);
    let n = 0;
    while (n < shares.length - 1 && left > shares[n]) left -= shares[n++];
    return { c: mix(route[n], route[n + 1], left / shares[n]), w: mix(a.w, b.w, k), d: mix(a.d, b.d, k) };
  }
  return stops[stops.length - 1];
};

// Where white and navy text are equally clear (4.2:1 each); the ink turns here, with a little margin so it
// can't flicker if the scroll rests right on it.
const CROSSOVER = 0.195;
const luminance = ([r, g, b]: RGB) => {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const TEXT = 'h1,h2,h3,h4,p,a,li,span,dt,dd,label,button,legend,figcaption,strong,em,small,time,input,textarea,select';

/** Turns the ink, with a very short fade on the text in view. */
export function turnInk(ink: string) {
  if (root.dataset.ink === ink) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.dataset.ink = ink;
    return;
  }
  const vh = window.innerHeight;
  const places = [...document.querySelectorAll<HTMLElement>('main [data-look], footer[data-look], [data-chrome], .radial')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh;
  });
  const texts = places.flatMap((p) => [...p.querySelectorAll<HTMLElement>(TEXT)]).filter((el) => {
    if (el.closest('.on-photo')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < vh;
  }).slice(0, 360);
  const from = texts.map((el) => getComputedStyle(el).color);
  root.dataset.ink = ink;
  texts.forEach((el, i) => {
    const to = getComputedStyle(el).color;
    if (to !== from[i]) el.animate([{ color: from[i] }, { color: to }], { duration: 200, easing: 'linear' });
  });
}

const paint = () => {
  raf = 0;
  const look = lookAt(window.scrollY);
  if (!look) return;
  const [c, w, d] = [text(look.c), text(look.w), text(look.d)];
  const value = `${c}/${w}/${d}`;
  if (value === last) return;
  last = value;
  layers.forEach((el) => {
    el.style.setProperty('--backdrop', c);
    el.style.setProperty('--backdrop-wash', w);
    el.style.setProperty('--backdrop-depth', d);
  });
  const l = luminance(look.c);
  const ink = l > CROSSOVER + 0.012 ? 'light' : l < CROSSOVER - 0.012 ? 'dark' : root.dataset.ink;
  if (ink) turnInk(ink);
};

const queue = () => {
  if (!raf) raf = requestAnimationFrame(paint);
};

/** Measures again: on load and resize, and whenever the page's height moves. */
export function refreshBackdrop() {
  if (!started) return;
  layers = [...document.querySelectorAll<HTMLElement>('[data-backdrop]')];
  const vh = window.innerHeight;
  const raw = provider ? provider() : stopsFor(scenesFrom(outermost(document.querySelectorAll<HTMLElement>('main [data-look], footer[data-look]')), 0), window.scrollY, vh);
  // In scroll order, and the last within reach so the page can arrive at its final colour.
  const end = Math.max(0, root.scrollHeight - vh);
  let y = 0;
  stops = raw.map((s, i) => {
    y = Math.max(y, Math.min(s.y, end));
    return { ...s, y, via: i > 0 ? between(raw[i - 1].look, s.look) : undefined };
  });
  last = '';
  paint();
}

/** A page whose sections overlap supplies where its colours fall; null goes back to measuring sections. */
export function setBackdropStops(fn: (() => Stop[]) | null) {
  provider = fn;
  refreshBackdrop();
}

export function initBackdrop() {
  if (started || !document.querySelector('[data-backdrop]')) return;
  started = true;
  window.addEventListener('scroll', queue, { passive: true });
  let settling = 0;
  const later = () => {
    window.clearTimeout(settling);
    settling = window.setTimeout(refreshBackdrop, 120);
  };
  window.addEventListener('resize', later, { passive: true });
  window.addEventListener('load', refreshBackdrop);
  document.fonts?.ready.then(refreshBackdrop);
  new ResizeObserver(later).observe(document.body);
  refreshBackdrop();
}
