// The homepage portals (components/home/Portals.astro, inside the scene of HeroScene.astro): the
// three glass cards of "Three sides of Stride" open, in turn, onto the real Social, Talent and
// Education pages (home/PagePortal.astro).
// - Desktop with motion: once the three sides reach their end (the ticker at the foot of the
//   screen) they hold still, and one GSAP timeline, scrubbed by the scroll in both directions, runs
//   over the portals' length. Social opens: its card comes forward while the other cards and the
//   intro recede, the backdrop takes on its deep blue in step with the opening, the page fades in
//   inside the card's outline and opens to fill the screen (a clip-path, with the card's lit edge
//   following it); what it reveals plays its own entrance as it comes into the window. Then nothing
//   more is animated: the visitor simply scrolls through the page. At its foot it holds and closes back
//   into its card, which steps back as Talent's comes forward and opens the same way, onto its page;
//   then the same into Education, whose foot runs on into the footer. The ticker runs whenever the
//   cards show.
//   Choosing a card plays its opening straight from the three sides, then lands on it.
//   Keyboard focus moving into one opens it; moving back to the cards returns to them.
//   While one fills the screen the hero under it isn't drawn and its video waits; a page's own
//   videos wait until it opens (src/scripts/system/media.ts, .is-media-held).
// - Phones, tablets and reduced motion: nothing moves; these are ordinary stretches of the page.
// Everywhere, choosing a card goes to its page (desktop as above, elsewhere by scrolling there).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lookOf, refreshBackdrop, scenesFrom, scenesIn, setBackdropStops, stopsFor, type Stop } from './backdrop';

gsap.registerPlugin(ScrollTrigger);

const KEYS = ['social', 'talent', 'education'] as const;
const SCALE = 1.08; // how far a card comes forward before it opens
const RADIUS = 26; // the cards' corner radius (components/home/ContentsIndex.astro)
const DIM = { scale: 0.95, opacity: 0.12 }; // a card stepping back
const FORWARD = { scale: SCALE, opacity: 1 };

// The timeline runs in vh of scroll: Social opens over FIRST, then its page scrolls for as long as it
// is; each later step holds for HOLD, closes the last page over CLOSE and opens the next over OPEN, and
// that page scrolls for as long as it is. A chosen card's opening plays over DIRECT seconds instead.
const FIRST = 100;
const HOLD = 30;
const CLOSE = 50;
const OPEN = 130;
const STEP = HOLD + CLOSE + OPEN;
const DIRECT = 1.6;

// Where each part of an opening falls, as shares of its length: under way from the first scroll.
const O = {
  forward: [0, 0.1],
  recede: [0, 0.2],
  intro: [0, 0.2],
  cue: [0, 0.12],
  foot: [0, 0.25],
  tint: [0, 0.86],
  fadeIn: [0.08, 0.16],
  open: [0.12, 0.86],
  edgeOut: [0.8, 0.88],
} as const;
// And a closing's: the edge returns, the clip closes onto the card, it fades.
const C = { edgeIn: [0.1, 0.3], close: [0.1, 0.85], fadeOut: [0.8, 1] } as const;
// The hero that plays its entrance as the opening reaches it (the browser's "in view" can't see the
// clip, so it would otherwise have played unseen), and again if the page is closed and reopened.
const HERO = ':is(.globe__stage, [data-portal-hero]) :is([data-reveal], [data-reveal-lines])';

type Lenis = {
  scrollTo(target: number, options?: { immediate?: boolean; force?: boolean; duration?: number; onComplete?: () => void }): void;
  stop(): void;
  start(): void;
};
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;
const jumpTo = (y: number) => {
  const l = lenis();
  if (l) l.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
};
const glideTo = (y: number, done?: () => void) => {
  const l = lenis();
  const distance = Math.abs(y - window.scrollY);
  if (distance < 2) return done?.();
  if (l) l.scrollTo(y, { duration: Math.min(1.4, 0.4 + distance / 2400), onComplete: done });
  else {
    window.scrollTo({ top: y, behavior: 'smooth' });
    if (done) window.setTimeout(done, 700);
  }
};
const byKeyboard = (e: Event) => (e.target as HTMLElement).matches(':focus-visible');
const plainClick = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);

type Chapter = {
  key: (typeof KEYS)[number];
  el: HTMLElement; // the page
  card: HTMLElement;
  portal: HTMLElement | null;
  hold: HTMLElement | null;
  edge: HTMLElement | null;
  entrance: HTMLElement[];
  open: { k: number };
  from: { t: number; r: number; b: number; l: number };
  clip: string; // the clip last drawn
};

export function initHomePortals() {
  const portals = document.querySelector<HTMLElement>('[data-portals]');
  const scene = portals?.closest<HTMLElement>('[data-scene]');
  const sides = scene?.querySelector<HTMLElement>('.sides');
  const cover = scene?.querySelector<HTMLElement>('.cover');
  if (!portals || !scene || !sides || !cover || portals.dataset.portalsReady) return;
  portals.dataset.portalsReady = 'true';

  const chapters: Chapter[] = [];
  for (const key of KEYS) {
    const el = portals.querySelector<HTMLElement>(`[data-chapter="${key}"]`);
    const card = sides.querySelector<HTMLElement>(`.sides__card--${key}`);
    if (!el || !card) continue;
    const portal = el.closest<HTMLElement>('[data-page-portal]');
    chapters.push({
      key,
      el,
      card,
      portal,
      hold: portal?.querySelector('[data-portal-hold]') ?? null,
      edge: el.querySelector('[data-chapter-edge]'),
      entrance: [...el.querySelectorAll<HTMLElement>(HERO)],
      open: { k: 0 },
      from: { t: 0, r: 0, b: 0, l: 0 },
      clip: '',
    });
  }
  if (!chapters.length) return;

  // Choosing a card goes to its page; on desktop with motion `choose` is replaced below.
  const toSection = (i: number) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const y = chapters[i].el.getBoundingClientRect().top + window.scrollY;
    if (reduced) jumpTo(y);
    else glideTo(y);
  };
  let choose = toSection;
  chapters.forEach((c, i) =>
    c.card.addEventListener('click', (e) => {
      if (!plainClick(e)) return;
      e.preventDefault();
      choose(i);
    }),
  );

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const intro = sides.querySelector<HTMLElement>('.sides__intro');
    const cue = sides.querySelector<HTMLElement>('.sides__cue');
    const tints = chapters.map((c) => portals.querySelector<HTMLElement>(`[data-tint="${c.key}"]`));
    const marks = chapters.map((c) => portals.querySelector<HTMLElement>(`[data-nav-start="${c.key}"]`));
    const cards = chapters.map((c) => c.card);
    const unit = () => window.innerHeight / 100;
    // How long each open page takes to scroll, in vh, and where each one is fully open. The sequence
    // ends where the last has opened: from there on it is only the page, then the footer.
    const runOf = (i: number) => Math.max(0, chapters[i].el.offsetHeight - window.innerHeight) / unit();
    const endOf = (i: number) => {
      let t = FIRST;
      for (let n = 1; n <= i; n++) t += runOf(n - 1) + STEP;
      return t;
    };
    const total = () => endOf(chapters.length - 1);

    chapters.forEach((c, i) => {
      if (c.hold) c.hold.style.height = `${i === 0 ? FIRST : STEP}vh`;
    });
    portals.classList.add('is-live');

    const steps: gsap.core.Timeline[] = []; // each closing and the next opening
    // What has to be in place before ScrollTrigger measures: the holds, the navigation's markers,
    // where each step begins.
    const place = () => {
      scene.style.setProperty('--sides-stick', `${window.innerHeight - sides.offsetHeight}px`);
      chapters.forEach((c) => c.portal?.style.setProperty('--stick', `${window.innerHeight - c.portal.offsetHeight}px`));
      // The navigation counts a chapter as reached when its marker passes 30% down the screen and
      // lands with it 22% down (edge-nav.ts), so a marker 78vh before the open point switches just
      // before the card has opened and lands where it has.
      marks.forEach((m, i) => m && (m.style.top = `${(endOf(i) - 78) * unit()}px`));
      steps.forEach((step, n) => step.startTime(endOf(n + 1) - STEP));
    };
    place();

    // ---------- The opening's clip ----------
    // Its first frame: the card where it rests while the sides hold still (their foot at the
    // bottom of the screen), grown to SCALE about its centre, as insets from the screen's edges.
    // At the last frame the clip goes, so the open page or chapter is an ordinary layer.
    let covered = false;
    const hold = (el: HTMLElement, held: boolean) => {
      if (el.classList.contains('is-media-held') === held) return false;
      el.classList.toggle('is-media-held', held);
      return true;
    };
    const settle = () => {
      let changed = false;
      chapters.forEach((c) => {
        c.el.classList.toggle('is-open', c.open.k >= 0.999);
        changed = hold(c.el, c.open.k < 0.5) || changed;
      });
      const now = chapters.some((c) => c.open.k >= 0.999);
      if (now !== covered) {
        covered = now;
        scene.classList.toggle('is-covered', covered);
      }
      changed = hold(cover, covered) || changed;
      if (changed) scene.dispatchEvent(new Event('media:hold'));
      chapters.forEach((c) => c.entrance.forEach((el) => el.classList.toggle('is-revealed', c.open.k >= 0.5)));
    };
    // Drawn whenever a timeline renders (a jump can pass a whole opening without its tweens
    // reporting), writing only what changed.
    const draw = () => {
      const vh = window.innerHeight;
      const vw = document.documentElement.clientWidth;
      chapters.forEach((c) => {
        const q = 1 - c.open.k;
        if (q <= 0.001) {
          if (c.clip !== 'none') {
            c.clip = 'none';
            c.el.style.clipPath = 'none';
          }
          return;
        }
        // A window on the screen, in the layer's own terms: the page may be well scrolled by now.
        const o = -c.el.getBoundingClientRect().top;
        const [t, r, l] = [c.from.t * q, c.from.r * q, c.from.l * q];
        const top = o + t;
        const bottom = o + vh - c.from.b * q;
        const rad = RADIUS * SCALE * q;
        const clip = `inset(${top.toFixed(1)}px ${r.toFixed(1)}px calc(100% - ${bottom.toFixed(1)}px) ${l.toFixed(1)}px round ${rad.toFixed(1)}px)`;
        if (clip === c.clip) return;
        c.clip = clip;
        c.el.style.clipPath = clip;
        if (c.edge) Object.assign(c.edge.style, { top: `${top}px`, left: `${l}px`, width: `${vw - l - r}px`, height: `${bottom - top}px`, borderRadius: `${rad}px` });
      });
      settle();
    };
    const measure = () => {
      const vh = window.innerHeight;
      const stick = vh - sides.offsetHeight;
      chapters.forEach((c) => {
        let x = 0;
        let y = 0;
        for (let n: HTMLElement | null = c.card; n && n !== sides; n = n.offsetParent as HTMLElement | null) {
          x += n.offsetLeft;
          y += n.offsetTop;
        }
        const w = c.card.offsetWidth * SCALE;
        const h = c.card.offsetHeight * SCALE;
        const top = stick + y - (h - c.card.offsetHeight) / 2;
        const left = x - (w - c.card.offsetWidth) / 2;
        c.from = { t: top, l: left, r: document.documentElement.clientWidth - left - w, b: vh - top - h };
        c.clip = '';
      });
      draw();
      refreshBackdrop();
    };

    measure();

    // ---------- Building blocks ----------
    const span = (T: number, L: number) => ({
      at: (u: number) => T + u * L,
      len: ([a, b]: readonly [number, number] | readonly number[]) => (b - a) * L,
    });

    // Page i opens over [T, T + L]; the cards start from `from` (scale and opacity, in order);
    // `fromSides` when it starts from the three sides as they first arrive (intro and cue showing).
    const opening = (tl: gsap.core.Timeline, i: number, T: number, L: number, from: gsap.TweenVars[], fromSides: boolean) => {
      const c = chapters[i];
      const s = span(T, L);
      cards.forEach((card, j) => {
        const to = j === i ? FORWARD : DIM;
        const f = from[j];
        if (f.scale === to.scale && f.opacity === to.opacity) return;
        const range = j === i ? O.forward : O.recede;
        tl.fromTo(card, { ...f }, { ...to, duration: s.len(range), ease: 'power2.inOut', immediateRender: false }, s.at(range[0]));
      });
      if (fromSides) {
        if (intro) tl.fromTo(intro, { opacity: 1, y: 0 }, { opacity: 0, y: -40, duration: s.len(O.intro), ease: 'power2.in', immediateRender: false }, s.at(O.intro[0]));
        if (cue) tl.fromTo(cue, { opacity: 1 }, { opacity: 0, duration: s.len(O.cue), immediateRender: false }, s.at(O.cue[0]));
        tl.fromTo(sides, { '--foot-a': 1 }, { '--foot-a': 0, duration: s.len(O.foot), immediateRender: false }, s.at(O.foot[0]));
      }
      const tint = tints[i];
      if (tint) tl.fromTo(tint, { opacity: 0 }, { opacity: 1, duration: s.len(O.tint), ease: 'power1.inOut', immediateRender: false }, s.at(O.tint[0]));
      tl.fromTo(c.el, { opacity: 0 }, { opacity: 1, duration: s.len(O.fadeIn), immediateRender: false }, s.at(O.fadeIn[0]));
      tl.fromTo(c.open, { k: 0 }, { k: 1, duration: s.len(O.open), ease: 'power2.inOut', immediateRender: false }, s.at(O.open[0]));
      if (c.edge) tl.fromTo(c.edge, { opacity: 1 }, { opacity: 0, duration: s.len(O.edgeOut), immediateRender: false }, s.at(O.edgeOut[0]));
    };

    // Page i closes back into its card over [T, T + L].
    const closing = (tl: gsap.core.Timeline, i: number, T: number, L: number) => {
      const c = chapters[i];
      const s = span(T, L);
      if (c.edge) tl.fromTo(c.edge, { opacity: 0 }, { opacity: 1, duration: s.len(C.edgeIn), immediateRender: false }, s.at(C.edgeIn[0]));
      tl.fromTo(c.open, { k: 1 }, { k: 0, duration: s.len(C.close), ease: 'power2.inOut', immediateRender: false }, s.at(C.close[0]));
      tl.fromTo(c.el, { opacity: 1 }, { opacity: 0, duration: s.len(C.fadeOut), immediateRender: false }, s.at(C.fadeOut[0]));
    };

    const atSides = cards.map(() => ({ scale: 1, opacity: 1 }));
    const after = (i: number) => cards.map((_, j) => (j === i ? { ...FORWARD } : { ...DIM }));

    // ---------- The scrubbed sequence ----------
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: draw,
      scrollTrigger: {
        trigger: portals,
        start: 'top bottom', // the sides' foot reaches the bottom of the screen
        end: () => `+=${total() * unit()}`,
        scrub: true,
      },
    });
    opening(tl, 0, 0, FIRST, atSides, true);
    // After each page: a timeline of its own, so it can move when the pages' heights do.
    chapters.slice(1).forEach((_, n) => {
      const i = n + 1;
      const step = gsap.timeline({ defaults: { ease: 'none' } });
      closing(step, i - 1, HOLD, CLOSE);
      opening(step, i, HOLD + CLOSE, OPEN, after(i - 1), false);
      step.set({}, {}, STEP);
      steps.push(step);
      tl.add(step, endOf(i) - STEP);
    });
    // Run it through once now, while everything is at rest: each tween records the state it starts
    // from when it first renders, and restores that when scrolled back past. Left to the scroll, a
    // card's direct opening could get there first and be recorded as the resting state.
    tl.progress(1, true).progress(0, true);
    draw();
    const st = tl.scrollTrigger!;
    const yAt = (vh: number) => st.start + (vh * window.innerHeight) / 100;

    // ---------- The background's colour (scripts/system/backdrop.ts) ----------
    // The pages overlap, so where each colour belongs comes from this timeline: a section's holds while
    // it fills the screen, and it moves on to the next page's through each closing and opening.
    setBackdropStops(() => {
      const vh = window.innerHeight;
      const stops: Stop[] = [{ ...lookOf(document.documentElement), y: st.start }];
      chapters.forEach((c, i) => {
        const page = stopsFor(scenesIn(c.el), yAt(endOf(i)), vh);
        if (i > 0 && page.length) stops.push({ ...page[0], y: yAt(endOf(i) - OPEN * 0.8) });
        stops.push(...page);
        const last = stops[stops.length - 1];
        if (i < chapters.length - 1) stops.push({ ...last, y: last.y + (HOLD * vh) / 100 });
      });
      const footer = document.querySelector<HTMLElement>('footer[data-tone]');
      if (footer) stops.push(...stopsFor(scenesFrom([footer], 0), window.scrollY, vh));
      return stops;
    });

    // ---------- Choosing a card ----------
    // From the three sides (or above them), the card's opening plays straight away, with its page
    // brought up from further down for the moment, then the scroll lands where the scrubbed sequence
    // shows the same frame. From further in, the scroll travels there.
    let busy = false;
    choose = (i: number) => {
      if (busy) return;
      const target = yAt(endOf(i));
      if (window.scrollY > st.start + 2) return glideTo(target);
      busy = true;
      const play = () => {
        lenis()?.stop();
        const c = chapters[i];
        c.el.style.transform = `translateY(${-c.el.getBoundingClientRect().top}px)`;
        const direct = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: draw,
          onComplete: () => {
            c.el.style.transform = '';
            jumpTo(target);
            lenis()?.start();
            requestAnimationFrame(() => {
              direct.kill();
              busy = false;
            });
          },
        });
        opening(direct, i, 0, DIRECT, atSides, true);
      };
      glideTo(st.start, play);
    };

    // ---------- Keyboard ----------
    // Moving into one opens it (the page then shows what has focus); moving back to the cards returns
    // to them.
    const intoChapter = chapters.map((_, i) => (e: FocusEvent) => {
      if (!byKeyboard(e)) return;
      const y = window.scrollY;
      const open = endOf(i);
      const last = open + runOf(i);
      if (y >= yAt(open) - 2 && y <= yAt(last) + 2) return;
      jumpTo(yAt(y < yAt(open) ? open : last));
      requestAnimationFrame(() => (e.target as HTMLElement).scrollIntoView({ block: 'center' }));
    });
    const toCards = (e: FocusEvent) => {
      if (byKeyboard(e) && st.progress > 0 && (e.target as HTMLElement).closest('.sides__cards')) jumpTo(st.start);
    };
    chapters.forEach((c, i) => c.el.addEventListener('focusin', intoChapter[i]));
    sides.addEventListener('focusin', toCards);

    // The sides' and the pages' heights move with fonts and images loading: measure again and let
    // ScrollTrigger place the portals again, once it settles.
    const heights = () => [sides, ...chapters.map((c) => c.el)].map((el) => el.offsetHeight).join('/');
    let lastHeights = heights();
    let settling = 0;
    const resized = new ResizeObserver(() => {
      const now = heights();
      if (now === lastHeights) return;
      lastHeights = now;
      window.clearTimeout(settling);
      settling = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    resized.observe(sides);
    chapters.forEach((c) => resized.observe(c.el));
    ScrollTrigger.addEventListener('refreshInit', place);
    ScrollTrigger.addEventListener('refresh', measure);

    return () => {
      setBackdropStops(null);
      resized.disconnect();
      window.clearTimeout(settling);
      ScrollTrigger.removeEventListener('refreshInit', place);
      ScrollTrigger.removeEventListener('refresh', measure);
      chapters.forEach((c, i) => {
        c.el.removeEventListener('focusin', intoChapter[i]);
        c.el.classList.remove('is-open', 'is-media-held');
        c.el.style.clipPath = '';
        c.el.style.transform = '';
        c.edge?.removeAttribute('style');
        c.hold?.style.removeProperty('height');
        c.portal?.style.removeProperty('--stick');
        c.entrance.forEach((el) => el.classList.add('is-revealed'));
        c.open.k = 0;
        c.clip = '';
      });
      sides.removeEventListener('focusin', toCards);
      cover.classList.remove('is-media-held');
      scene.classList.remove('is-covered');
      scene.dispatchEvent(new Event('media:hold'));
      portals.classList.remove('is-live');
      marks.forEach((m) => m?.style.removeProperty('top'));
      scene.style.removeProperty('--sides-stick');
      choose = toSection;
    };
  });
}
