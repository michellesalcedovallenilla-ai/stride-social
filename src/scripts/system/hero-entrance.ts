// The homepage hero's cinematic entrance (components/home/CoverHero.astro): the desktop intro.
// One GSAP timeline, about 3.4s, simple 2D motion (move, turn, scale, fade); the camera stays still:
//   0.00–0.30s  a small headline above the hero, its letters a flickering collage of campaign
//               footage (CSS); the footage behind is heavily blurred.
//   0.18–0.30s  the letters lift a touch, as if drawing breath, then let go from the centre of the
//               word outwards (a ripple, not a slab).
//   0.30–1.4s   the big word falls, accelerating hard and growing to full size as it comes; on the
//               way down its letters drift apart and turn, trailing motion streaks.
//   ~1.3s       they hit the fine rule above the band (the group line and the awards, on screen from
//               the start): each squashes on impact, bounces, then a second smaller bounce, sliding a
//               little. The rule flares, the band gives under the hit and the whole stage jolts, then
//               everything springs back.
//   ~1.6s       "Built around", let go a moment later, lands on top of them: a second, smaller hit.
//   1.85–3.35s  left to right, each letter is guided back to its exact place in the headline,
//               fading from footage to solid white on the way; the footage behind comes into focus
//               over the same stretch.
// Every letter is set in the headline's own type and measured from it, so it lands exactly where the
// real letter rests ("Built around" straight), and the real headline takes over invisibly at the end.
// Escape (`hero:skip`, from hero-intro.ts) or resizing the window go straight to the
// finished hero. The inline script in the hero decides whether it plays (.is-entrance); reduced
// motion, phones and tablets, returning visits and browsers without it get the plain hero.

import { gsap } from 'gsap'; // bundled with the hero's script, so the intro can start with the page

const SMALL = 0.3; // the headline's size above the hero
const SPACING = 1.08; // the falling letters sit a little apart, so they come apart freely
const FALL_AT = 0.3; // s, the fall begins
const FALL = 1.0; // s, each letter's fall (varied a little per letter)
const THEN = 0.3; // s, "Built around" lets go this long after the word, so it lands on it
const LIFT = 0.14; // s, the breath before letting go
const RIPPLE = 0.16; // s, the release spreads from the centre of a line to its ends
const UP = 0.17; // s, the bounce up
const DOWN = 0.2; // s, and back down
const UP2 = 0.1; // s, the second, smaller bounce
const DOWN2 = 0.12;
const GATHER_AT = 1.85; // s, the first letter starts back to its place
const GATHER = 1.05; // s, each letter's way back
const STAGGER = 0.022; // s between letters, left to right
const SEED = 7; // the same fall every time

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// A small seeded random generator, so the fall is art-directed rather than different every time.
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STRETCH: [number, string][] = [[75, 'condensed'], [87.5, 'semi-condensed'], [100, 'normal'], [112.5, 'semi-expanded'], [125, 'expanded'], [150, 'extra-expanded']];

// The glyph's ink box inside its letter box (canvas metrics plus the baseline's place in the box),
// so a turned letter can be set down with its ink exactly on the ground line.
function inkBox(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const ctx = document.createElement('canvas').getContext('2d')!;
  const stretch = parseFloat(cs.getPropertyValue('font-stretch')) || 100;
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.fontStretch = STRETCH.reduce((a, b) => (Math.abs(b[0] - stretch) < Math.abs(a[0] - stretch) ? b : a))[1] as CanvasFontStretch;
  const m = ctx.measureText(el.textContent!.trim().slice(0, 1).toUpperCase());
  const probe = document.createElement('i');
  probe.style.cssText = 'display:inline-block;width:0;height:0';
  el.querySelector('.cover__s-img')!.append(probe);
  const baseline = probe.getBoundingClientRect().top - el.getBoundingClientRect().top;
  probe.remove();
  const left = -m.actualBoundingBoxLeft;
  const right = m.actualBoundingBoxRight;
  const top = baseline - m.actualBoundingBoxAscent;
  const bottom = baseline + m.actualBoundingBoxDescent;
  return { w: right - left, h: bottom - top, ox: (left + right) / 2 - el.offsetWidth / 2, oy: (top + bottom) / 2 - el.offsetHeight / 2 };
}

// The type is preloaded, so this is normally immediate; never wait long for it.
const fontsReady = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 500))]);

export function initHeroEntrance() {
  const hero = document.querySelector<HTMLElement>('.cover');
  const stage = hero?.querySelector<HTMLElement>('[data-hero-stage]');
  if (!hero || !stage || hero.dataset.entranceReady) return;
  if (!hero.classList.contains('is-entrance') || reduced() || !window.matchMedia('(min-width: 1024px)').matches) {
    hero.classList.remove('is-entrance', 'is-cinematic');
    stage.remove();
    return;
  }
  hero.dataset.entranceReady = 'true';

  let state: 'waiting' | 'running' | 'done' = 'waiting';
  let timeline: gsap.core.Timeline | null = null;
  const media = hero.querySelector<HTMLElement>('.cover__media');

  // The finished hero: the real headline, the footage sharp, the stage gone.
  const end = () => {
    if (state === 'done') return;
    state = 'done';
    timeline?.kill();
    media?.style.removeProperty('filter');
    gsap.set(hero.querySelectorAll('.cover__rule, .cover__description, .cover__awards'), { clearProps: 'transform,backgroundColor,boxShadow' });
    hero.classList.add('is-settling');
    hero.classList.remove('is-entrance');
    hero.querySelectorAll('.cover__title .is-landed').forEach((el) => el.classList.remove('is-landed'));
    stage.remove();
    window.setTimeout(() => hero.classList.remove('is-settling'), 800);
    window.removeEventListener('resize', end);
  };

  const play = () => {
    const box = stage.getBoundingClientRect();
    const W = box.width;
    const H = box.height;
    const turn = parseFloat(getComputedStyle(hero.querySelector('.cover__kicker')!).rotate) || 0;
    const finals = new Map([...hero.querySelectorAll<HTMLElement>('.cover__title [data-ch]')].map((el) => [el.dataset.ch, el]));

    // Each letter: its box, its glyph's ink, and its exact place in the real headline.
    const letters = [...stage.querySelectorAll<HTMLElement>('.cover__s')].map((el) => {
      const key = el.dataset.ch!;
      const r = finals.get(key)!.getBoundingClientRect();
      const word = key.startsWith('w');
      return { el, word, bw: el.offsetWidth, bh: el.offsetHeight, ink: inkBox(el), tx: r.left + r.width / 2 - box.left, ty: r.top + r.height / 2 - box.top, ta: word ? 0 : turn };
    });
    type Letter = (typeof letters)[number];

    // The ground line: the rule above the band, which the letters land on (without it, where the
    // word's letters stand in the headline).
    const rule = hero.querySelector('.cover__rule')?.getBoundingClientRect();
    const ground = rule?.height ? rule.top - box.top : Math.max(...letters.filter((l) => l.word).map((l) => l.ty + l.ink.oy + l.ink.h / 2));
    // How far a letter's ink, turned by `deg`, reaches from its centre across and down.
    const reachOf = (l: Letter, deg: number) => {
      const a = (deg * Math.PI) / 180;
      return {
        x: (Math.abs(l.ink.w * Math.cos(a)) + Math.abs(l.ink.h * Math.sin(a))) / 2,
        y: (Math.abs(l.ink.w * Math.sin(a)) + Math.abs(l.ink.h * Math.cos(a))) / 2,
      };
    };
    // Where a letter's box centre sits when its ink, turned by `deg`, just touches the floor.
    const standY = (l: Letter, deg: number, floor = ground) => {
      const a = (deg * Math.PI) / 180;
      return floor - reachOf(l, deg).y - (Math.sin(a) * l.ink.ox + Math.cos(a) * l.ink.oy);
    };
    // GSAP moves the box from the stage's top-left corner; these turn a centre into that offset.
    const X = (l: Letter, cx: number) => cx - l.bw / 2;
    const Y = (l: Letter, cy: number) => cy - l.bh / 2;

    // The headline, spread a little rightwards from the start of each line (so nothing is pressed
    // against the radial navigation), as it would arrive; and the same, small, above the hero.
    const startOf = (word: boolean) => Math.min(...letters.filter((l) => l.word === word).map((l) => l.tx));
    const lineStart = { word: startOf(true), kicker: startOf(false) };
    const spread = letters.map((l) => {
      const from = l.word ? lineStart.word : lineStart.kicker;
      return { x: from + (l.tx - from) * SPACING, y: ground + (l.ty - ground) * SPACING };
    });
    const midOf = (word: boolean) => {
      const xs = spread.filter((_, i) => letters[i].word === word).map((p) => p.x);
      return (Math.min(...xs) + Math.max(...xs)) / 2;
    };
    const lineMid = { word: midOf(true), kicker: midOf(false) };
    const hx = lineMid.word;
    const top = Math.min(...spread.map((p, i) => p.y - letters[i].bh / 2));
    const start = spread.map((p) => ({ x: W / 2 + (p.x - hx) * SMALL, y: 0.1 * H + (p.y - top) * SMALL }));
    const halfSpan = Math.max(1, ...spread.map((p) => Math.abs(p.x - hx)));
    const left = 176; // clear of the radial navigation
    const right = W - 40;

    // The order back: left to right across both lines.
    const order = letters.map((l, i) => [l.tx, i]).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
    const rank = new Array<number>(letters.length);
    order.forEach((i, r) => (rank[i] = r));

    const rand = random(SEED);
    const tl = gsap.timeline({ paused: true });
    timeline = tl;
    let lastEnd = 0;
    let wordHit = Infinity; // when the first of each line lands
    let kickerHit = Infinity;
    // The word's letters as they come to rest (they come first), for "Built around" to land on.
    const pile: { x: number; half: number; top: number }[] = [];
    const surface = (l: Letter, x: number, deg: number) => {
      const across = reachOf(l, deg).x * 0.6;
      const under = pile.filter((p) => Math.abs(p.x - x) < p.half + across).map((p) => p.top);
      return under.length ? under.reduce((a, b) => a + b, 0) / under.length + l.bh * 0.12 : ground;
    };

    letters.forEach((l, i) => {
      const mid = l.word ? lineMid.word : lineMid.kicker;
      const side = Math.sign(spread[i].x - mid) || (rand() < 0.5 ? -1 : 1);
      const flip = rand() < 0.5 ? -1 : 1;
      // How it comes down: when it lets go, how long it takes, where and how turned it lands.
      const release = FALL_AT + (l.word ? 0 : THEN) + (Math.abs(spread[i].x - mid) / halfSpan) * RIPPLE + rand() * 0.02;
      const fall = FALL + (rand() - 0.5) * 0.1;
      const land = release + fall;
      const lean = flip * (l.word ? 6 + rand() * 14 : 10 + rand() * 24);
      const half = l.bw / 2;
      // Near its own place, so the word stays spread evenly along the rule rather than in clumps.
      const landX = clamp(spread[i].x + ((spread[i].x - mid) / halfSpan) * 16 + (rand() - 0.5) * (l.word ? 36 : 40), left + half, right - half);
      // One bounce, a little slide and a little more turn as it settles.
      const hop = (l.word ? 0.28 : 0.45) * l.bh * (0.7 + 0.3 * rand());
      const rest = lean + flip * (3 + rand() * 6);
      const restX = clamp(landX + side * (4 + rand() * 12), left + half, right - half);
      const back = Math.max(GATHER_AT + rank[i] * STAGGER, land + UP + DOWN + UP2 + DOWN2 + 0.03);
      lastEnd = Math.max(lastEnd, back + GATHER);
      // The word lands on the rule, "Built around" on the letters under it.
      const floor = l.word ? ground : surface(l, restX, rest);
      if (l.word) {
        const r = reachOf(l, rest);
        pile.push({ x: restX, half: r.x, top: ground - 2 * r.y });
        wordHit = Math.min(wordHit, land);
      } else {
        kickerHit = Math.min(kickerHit, land);
      }

      gsap.set(l.el, { x: X(l, start[i].x), y: Y(l, start[i].y), scale: SMALL, rotation: l.ta, transformOrigin: '50% 50%', force3D: true });
      tl.to(l.el, { opacity: 1, duration: 0.25, ease: 'power1.out' }, 0);
      tl.to(l.el, { y: '+=5', duration: release - LIFT, ease: 'sine.out' }, 0); // hanging, settling a touch
      tl.to(l.el, { y: '-=8', duration: LIFT, ease: 'power2.out' }, release - LIFT); // the breath before the drop
      // The fall: accelerating hard, growing steadily, coming apart and starting to turn.
      tl.to(l.el, { y: Y(l, standY(l, lean, floor)), duration: fall, ease: 'power3.in' }, release);
      tl.to(l.el, { x: X(l, landX), scale: 1, duration: fall, ease: 'power1.in' }, release);
      tl.to(l.el, { rotation: lean, duration: fall, ease: 'power1.in' }, release);
      // The landing: the letter squashes on the ground, bounces, bounces again smaller, sliding and
      // turning a little until it is called back.
      const body = l.el.querySelectorAll('.cover__s-img, .cover__s-white');
      tl.to(body, { scaleY: 0.84, scaleX: 1.09, transformOrigin: '50% 100%', duration: 0.07, ease: 'power2.out' }, land);
      tl.to(body, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, land + 0.07);
      tl.to(l.el, { y: Y(l, standY(l, lean, floor)) - hop, duration: UP, ease: 'power2.out' }, land + 0.03);
      tl.to(l.el, { y: Y(l, standY(l, rest, floor)), duration: DOWN, ease: 'power2.in' }, land + 0.03 + UP);
      tl.to(l.el, { y: Y(l, standY(l, rest, floor)) - hop * 0.32, duration: UP2, ease: 'power2.out' }, land + 0.03 + UP + DOWN);
      tl.to(l.el, { y: Y(l, standY(l, rest, floor)), duration: DOWN2, ease: 'power2.in' }, land + 0.03 + UP + DOWN + UP2);
      tl.to(l.el, { x: X(l, restX), rotation: rest, duration: back - land, ease: 'power3.out' }, land);
      // Back to its exact place, straight, turning from footage to white on the way.
      tl.to(l.el, { x: X(l, l.tx), y: Y(l, l.ty), rotation: l.ta, duration: GATHER, ease: 'sine.inOut' }, back);
      const img = l.el.querySelector('.cover__s-img');
      tl.to(
        l.el.querySelector('.cover__s-white'),
        {
          opacity: 1,
          duration: GATHER * 0.75,
          ease: 'power1.inOut',
          onComplete: () => img?.getAnimations().forEach((a) => a.pause()), // stop the hidden footage cutting
        },
        back + GATHER * 0.15,
      );
      // The motion streak, while it falls fast (not on the full stop: it would read as "!").
      if (/[A-Z]/i.test(l.el.textContent!)) {
        const trail = l.el.querySelector('.cover__s-trail');
        tl.fromTo(trail, { opacity: 0.001, scaleY: 1 }, { opacity: 0.55, scaleY: 2.6, duration: fall * 0.85, ease: 'power2.in' }, release);
        tl.to(trail, { opacity: 0, scaleY: 1, duration: 0.15, ease: 'power1.out' }, land - 0.05);
      }
    });

    // The hits: the rule flares and the band gives under the weight, then springs back. A big one for
    // the word, a smaller one as "Built around" lands on it.
    const band = hero.querySelectorAll('.cover__rule, .cover__description, .cover__awards');
    const impact = (at: number, dip: number, flare: number) => {
      tl.to(band, { y: dip, duration: 0.07, ease: 'power2.out' }, at);
      tl.to(band, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, at + 0.07);
      // The ground shakes: the whole stage jolts down and springs back.
      tl.to(stage, { y: dip * 0.5, duration: 0.06, ease: 'power2.out' }, at);
      tl.to(stage, { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, at + 0.06);
      tl.to('.cover__rule', { backgroundColor: `rgba(255, 255, 255, ${flare})`, boxShadow: `0 0 ${Math.round(26 * flare)}px rgba(195, 242, 251, ${flare * 0.75})`, duration: 0.06, ease: 'power2.out' }, at);
      tl.to('.cover__rule', { backgroundColor: 'rgba(255, 255, 255, 0.28)', boxShadow: '0 0 0px rgba(195, 242, 251, 0)', duration: 0.7, ease: 'power2.out' }, at + 0.06);
    };
    if (rule?.height) {
      impact(wordHit, 6, 0.95);
      impact(kickerHit, 2, 0.55);
    }

    // The footage behind comes into focus while the letters find their places, landing exactly on
    // its resting colour grade (components/home/CoverHero.astro, .cover__media).
    if (media) {
      const grade = 'contrast(1.1) saturate(1.18)';
      tl.fromTo(media, { filter: `${grade} brightness(0.72) blur(26px)` }, { filter: `${grade} brightness(0.94) blur(0px)`, duration: lastEnd - GATHER_AT, ease: 'sine.inOut' }, GATHER_AT);
    }
    // The real headline takes over.
    tl.call(
      () => {
        hero.querySelectorAll('.cover__title [data-ch]').forEach((el) => el.classList.add('is-landed'));
        requestAnimationFrame(end);
      },
      [],
      lastEnd + 0.05,
    );

    // Start on the next frame, once the work above is done.
    requestAnimationFrame(() => state === 'running' && tl.play());
  };

  // Skipping or resizing: straight to the finished hero.
  hero.addEventListener('hero:skip', end);
  window.addEventListener('resize', end);

  // Start as soon as the type is ready, so the letters measure true.
  fontsReady()
    .then(() => {
      if (state !== 'waiting') return;
      state = 'running';
      requestAnimationFrame(() => {
        try {
          play();
        } catch {
          end(); // never leave the headline hidden
        }
      });
    })
    .catch(end);
}
