// Behaviour for group/TimeDial.astro: the scroll carries the story, the ruler shows where you are, and
// dragging or clicking the ruler (or the arrow keys on it) moves the scroll, so they always agree.
import { clamp, goToProgress, progressOf, stepOf, stepPoint } from './ambient';

function initDial(root: HTMLElement) {
  const marks = [...root.querySelectorAll<HTMLElement>('[data-dial-mark]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-dial-card]')];
  const ticks = [...root.querySelectorAll<HTMLElement>('[data-dial-tick]')];
  const ruler = root.querySelector<HTMLElement>('[data-dial-ruler]');
  const track = root.querySelector<HTMLElement>('.dial__track');
  const total = cards.length;
  let now = -1;

  const show = (i: number) => {
    if (i === now) return;
    now = i;
    marks.forEach((m, k) => {
      m.classList.toggle('is-active', k === i);
      m.classList.toggle('is-past', k < i);
    });
    cards.forEach((c, k) => {
      c.classList.toggle('is-active', k === i);
      c.classList.toggle('is-past', k < i);
      if (k === i) c.removeAttribute('aria-hidden');
      else c.setAttribute('aria-hidden', 'true');
    });
    ticks.forEach((t, k) => t.classList.toggle('is-now', k === i));
    ruler?.setAttribute('aria-valuenow', String(i + 1));
  };
  const onScroll = () => {
    root.style.setProperty('--at', progressOf(root).toFixed(4));
    show(stepOf(root, total));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Desktop: each mark is sized to run the full width, as tall as the screen allows.
  const stage = root.querySelector<HTMLElement>('.dial__marks');
  const fit = () => {
    const desk = window.matchMedia('(min-width: 1024px)').matches;
    marks.forEach((m) => {
      m.style.removeProperty('font-size');
      if (!desk || !stage) return;
      m.style.fontSize = '100px';
      const last = m.lastElementChild as HTMLElement;
      const first = m.firstElementChild as HTMLElement;
      const wide = last.offsetLeft + last.offsetWidth - first.offsetLeft;
      const size = Math.min((stage.clientWidth / wide) * 100, window.innerHeight * 0.38);
      m.style.fontSize = `${size.toFixed(1)}px`;
    });
  };
  fit();
  document.fonts?.ready.then(fit);
  window.addEventListener('resize', fit, { passive: true });

  /* ---------- Play: the story moves on by itself, until the visitor takes over ---------- */
  const play = root.querySelector<HTMLButtonElement>('[data-dial-play]');
  let timer = 0;
  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
    play?.setAttribute('aria-pressed', 'false');
    if (play?.dataset.play) play.setAttribute('aria-label', play.dataset.play);
  };
  const advance = () => {
    if (now >= total - 1) return stop();
    goToProgress(root, stepPoint(now + 1, total), true);
  };
  play?.addEventListener('click', () => {
    if (timer) return stop();
    if (now >= total - 1) goToProgress(root, stepPoint(0, total), true);
    play.setAttribute('aria-pressed', 'true');
    if (play.dataset.pause) play.setAttribute('aria-label', play.dataset.pause);
    timer = window.setInterval(advance, 3400);
  });
  window.addEventListener('wheel', () => timer && stop(), { passive: true });
  window.addEventListener('keydown', (e) => {
    if (timer && !(e.target as HTMLElement).closest('[data-dial-play]')) stop();
  });
  root.addEventListener('pointerdown', (e) => {
    if (timer && !(e.target as HTMLElement).closest('[data-dial-play]')) stop();
  });

  if (!ruler || !track) return;
  let pressed = false;
  const toPointer = (x: number, smooth: boolean) => {
    const r = track.getBoundingClientRect();
    goToProgress(root, clamp((x - r.left) / r.width, 0, 1), smooth);
  };
  ruler.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    pressed = true;
    root.classList.add('is-dragging');
    toPointer(e.clientX, true);
  });
  window.addEventListener('pointermove', (e) => {
    if (pressed) toPointer(e.clientX, false);
  });
  window.addEventListener('pointerup', () => {
    pressed = false;
    root.classList.remove('is-dragging');
  });
  ruler.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    let i: number | null = step !== undefined ? now + step : null;
    if (e.key === 'Home') i = 0;
    if (e.key === 'End') i = total - 1;
    if (i === null) return;
    e.preventDefault();
    goToProgress(root, stepPoint(clamp(i, 0, total - 1), total), true);
  });
}

export function initTimeDials() {
  document.querySelectorAll<HTMLElement>('[data-dial]').forEach((root) => {
    if (root.dataset.dialReady) return;
    root.dataset.dialReady = 'true';
    initDial(root);
  });
}
