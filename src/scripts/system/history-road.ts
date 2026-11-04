// Behaviour for group/HistoryRoad.astro: the section is made as tall as the road is long, so vertical
// scrolling carries you sideways. Dragging moves the scroll, so they always agree. Panels lean with your
// speed, years drift behind them, and the one at the centre lights up. Only on desktop with motion.
// Positions are measured once (and on resize), and each frame writes only to what moves, so it stays smooth.
import { clamp, goToProgress, progressOf } from './ambient';

function initRoad(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-road-track]');
  const pin = root.querySelector<HTMLElement>('[data-road-pin]');
  if (!track || !pin) return;
  const progress = root.querySelector<HTMLElement>('.road__progress');
  const fade = root.querySelector<HTMLElement>('.road__fade');
  const jumps = [...root.querySelectorAll<HTMLElement>('[data-road-jump]')];
  const stops = [...root.querySelectorAll<HTMLElement>('[data-road-stop]')].map((el) => ({
    el,
    card: el.querySelector<HTMLElement>('.stop__card'),
    year: el.querySelector<HTMLElement>('.stop__year'),
    mid: 0, // the panel's centre along the track
    away: -1, // how far from the screen's centre it was last frame
  }));
  const live = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  let span = 0; // how far the track travels
  let vw = window.innerWidth;
  let x = 0;
  let lean = 0;
  let raf = 0;
  let here = '';

  const measure = () => {
    if (!live.matches) return;
    vw = window.innerWidth;
    span = Math.max(0, track.scrollWidth - vw);
    root.style.height = `${window.innerHeight + span}px`;
    stops.forEach((s) => {
      s.mid = s.el.offsetLeft + s.el.offsetWidth / 2;
      s.away = -1;
    });
    run();
  };

  const frame = () => {
    raf = 0;
    if (!live.matches) return;
    const target = -progressOf(root) * span;
    const delta = target - x;
    x += delta * 0.16;
    if (Math.abs(delta) < 0.4) x = target;
    lean += (clamp(delta * 0.05, -7, 7) - lean) * 0.18;
    if (Math.abs(lean) < 0.02) lean = 0;
    track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    if (progress) progress.style.transform = `scaleX(${(span ? -x / span : 0).toFixed(4)})`;
    // Panels fade before they reach the wheel at the left; at the start of the road, nothing's there yet.
    if (fade) fade.style.opacity = clamp(-x / 240, 0, 1).toFixed(3);

    let nearest = '';
    let best = 0.42; // beyond this, you're between panels
    stops.forEach((s) => {
      const f = clamp((s.mid + x - vw / 2) / vw, -1, 1);
      const away = Math.abs(f);
      if (away < best) {
        best = away;
        nearest = s.el.dataset.roadStop ?? '';
      }
      if (away === 1 && s.away === 1) return; // still off screen
      s.away = away;
      if (s.card) {
        s.card.style.transform = `skewX(${lean.toFixed(2)}deg) scale(${(1 - away * 0.06).toFixed(4)})`;
        s.card.style.opacity = (1 - away * 0.4).toFixed(3);
      }
      if (s.year) s.year.style.transform = `translate(calc(-50% + ${(f * 22).toFixed(2)}vw), -50%)`;
    });
    if (nearest !== here) {
      here = nearest;
      stops.forEach((s) => s.el.classList.toggle('is-here', s.el.dataset.roadStop === here));
      jumps.forEach((j) => j.classList.toggle('is-here', j.dataset.roadJump === here));
    }
    if (x !== target || lean !== 0) raf = requestAnimationFrame(frame);
  };
  const run = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  window.addEventListener('scroll', run, { passive: true });

  /* ---------- Dragging moves the scroll ---------- */
  let pressed = false;
  let lastX = 0;
  pin.addEventListener('pointerdown', (e) => {
    if (!live.matches || e.button !== 0 || e.pointerType === 'touch') return;
    if ((e.target as HTMLElement).closest('a, .road__years')) return;
    pressed = true;
    lastX = e.clientX;
    root.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (!pressed || !span) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    goToProgress(root, progressOf(root) - dx / span);
  });
  window.addEventListener('pointerup', () => {
    pressed = false;
    root.classList.remove('is-dragging');
  });

  /* ---------- The years along the foot ---------- */
  jumps.forEach((j) =>
    j.addEventListener('click', (e) => {
      e.preventDefault();
      const stop = stops.find((s) => s.el.dataset.roadStop === j.dataset.roadJump);
      if (stop && span) goToProgress(root, (stop.mid - vw / 2) / span, true);
    }),
  );

  /* ---------- Play: the road travels itself, until the visitor takes over ---------- */
  const play = root.querySelector<HTMLButtonElement>('[data-road-play]');
  const JOURNEY = 42; // seconds, end to end
  let playing = false;
  let lastT = 0;
  const halt = () => {
    playing = false;
    play?.setAttribute('aria-pressed', 'false');
    if (play?.dataset.play) play.setAttribute('aria-label', play.dataset.play);
  };
  const travel = (t: number) => {
    if (!playing) return;
    const dt = Math.min(50, t - lastT);
    lastT = t;
    const p = progressOf(root) + dt / 1000 / JOURNEY;
    goToProgress(root, Math.min(1, p));
    if (p >= 1) return halt();
    requestAnimationFrame(travel);
  };
  play?.addEventListener('click', () => {
    if (playing) return halt();
    if (progressOf(root) >= 0.999) goToProgress(root, 0);
    playing = true;
    play.setAttribute('aria-pressed', 'true');
    if (play.dataset.pause) play.setAttribute('aria-label', play.dataset.pause);
    lastT = performance.now();
    requestAnimationFrame(travel);
  });
  window.addEventListener('wheel', () => playing && halt(), { passive: true });
  window.addEventListener('keydown', (e) => {
    if (playing && !(e.target as HTMLElement).closest('[data-road-play]')) halt();
  });
  pin.addEventListener('pointerdown', (e) => {
    if (playing && !(e.target as HTMLElement).closest('[data-road-play]')) halt();
  });

  /* ---------- On or off ---------- */
  const setMode = () => {
    root.classList.toggle('is-live', live.matches);
    if (live.matches) measure();
    else {
      root.style.removeProperty('height');
      track.style.removeProperty('transform');
      stops.forEach((s) => {
        s.card?.style.removeProperty('transform');
        s.card?.style.removeProperty('opacity');
        s.year?.style.removeProperty('transform');
      });
    }
  };
  live.addEventListener('change', setMode);
  window.addEventListener('resize', measure, { passive: true });
  document.fonts?.ready.then(measure);
  window.addEventListener('load', measure);
  setMode();
}

export function initHistoryRoads() {
  document.querySelectorAll<HTMLElement>('[data-road]').forEach((root) => {
    if (root.dataset.roadReady) return;
    root.dataset.roadReady = 'true';
    initRoad(root);
  });
}
