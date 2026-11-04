// Behaviour for social/CaseReel.astro: scrolling turns the chapters, and the reels with them; dragging,
// clicking a reel or the arrows turn just the reels. Only the reel in front plays, and only on screen. The
// rail shows how far through the story you are and jumps to any part; verified results count up on arrival.
import { goToProgress, progressOf, reduced, stepOf, stepPoint } from './ambient';

const STEP_PX = 150;

function initReel(root: HTMLElement) {
  const frames = [...root.querySelectorAll<HTMLElement>('[data-reel-frame]')];
  const chapters = [...root.querySelectorAll<HTMLElement>('[data-reel-chapter]')];
  const washes = [...root.querySelectorAll<HTMLElement>('[data-reel-wash]')];
  const area = root.querySelector<HTMLElement>('[data-reel-frames]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-reel-toggle]');
  const jumps = [...root.querySelectorAll<HTMLElement>('[data-reel-jump]')];
  const n = frames.length;
  let front = 0;
  let chapter = 0;
  let inView = false;
  let paused = reduced();

  const syncVideo = () => {
    frames.forEach((f, i) => {
      const v = f.querySelector('video');
      if (!v) return;
      if (i === front && inView && !paused && !root.closest('.is-media-held')) {
        if (v.preload === 'none') v.preload = 'auto';
        v.play().catch(() => {});
      } else v.pause();
    });
    toggle?.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    toggle?.style.setProperty('opacity', paused ? '0.6' : '1');
  };
  const render = () => {
    frames.forEach((f, i) => {
      let d = i - front;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const ad = Math.abs(d);
      f.style.setProperty('--d', String(d));
      f.style.setProperty('--ad', String(ad));
      f.classList.toggle('is-front', d === 0);
      f.classList.toggle('is-far', ad > 3);
    });
    washes.forEach((w) => w.classList.toggle('is-active', w.dataset.reelWash === String(front)));
    syncVideo();
  };
  const turn = (by: number) => {
    if (!n) return;
    front = (front + by + n * 10) % n;
    render();
  };

  // A verified figure counting up to itself, once.
  const count = (el: HTMLElement) => {
    const match = (el.dataset.count ?? '').match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match || el.dataset.counted || reduced()) return;
    el.dataset.counted = 'true';
    const [, before, digits, after] = match;
    const target = Number(digits.replace(/,/g, ''));
    const places = digits.includes('.') ? digits.split('.')[1].length : 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1000);
      const value = (target * (1 - (1 - k) ** 3)).toLocaleString('en-GB', { minimumFractionDigits: places, maximumFractionDigits: places });
      el.textContent = k < 1 ? `${before}${value}${after}` : (el.dataset.count ?? '');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Scroll ---------- */
  const onScroll = () => {
    const at = progressOf(root) * chapters.length;
    jumps.forEach((j, k) => (j.firstElementChild as HTMLElement | null)?.style.setProperty('--fill', Math.min(1, Math.max(0, at - k)).toFixed(3)));
    area?.style.setProperty('--scrub', (at - Math.floor(at) - 0.5).toFixed(3));
    const i = stepOf(root, chapters.length);
    if (i === chapter) return;
    turn(i - chapter);
    chapter = i;
    chapters[i]?.querySelectorAll<HTMLElement>('[data-count]').forEach(count);
    chapters.forEach((c, k) => {
      c.classList.toggle('is-active', k === i);
      if (k === i) c.removeAttribute('aria-hidden');
      else c.setAttribute('aria-hidden', 'true');
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  jumps.forEach((j, k) => j.addEventListener('click', () => goToProgress(root, stepPoint(k, chapters.length), true)));
  root.querySelector('[data-reel-prev]')?.addEventListener('click', () => turn(-1));
  root.querySelector('[data-reel-next]')?.addEventListener('click', () => turn(1));
  toggle?.addEventListener('click', () => {
    paused = !paused;
    syncVideo();
  });

  /* ---------- Dragging and clicking ---------- */
  if (area) {
    let pressed = false;
    let moved = false;
    let startX = 0;
    let last = 0;
    area.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      pressed = true;
      moved = false;
      startX = e.clientX;
      last = 0;
    });
    window.addEventListener('pointermove', (e) => {
      if (!pressed) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 6) return;
      moved = true;
      root.classList.add('is-dragging');
      const at = Math.round(dx / STEP_PX);
      if (at !== last) {
        turn(last - at);
        last = at;
      }
    });
    window.addEventListener('pointerup', () => {
      pressed = false;
      root.classList.remove('is-dragging');
    });
    area.addEventListener('click', (e) => {
      if (moved) return;
      const f = (e.target as HTMLElement).closest<HTMLElement>('[data-reel-frame]');
      if (!f) return;
      front = frames.indexOf(f);
      render();
    });
    area.addEventListener('dragstart', (e) => e.preventDefault());
  }

  root.closest('[data-media-hold]')?.addEventListener('media:hold', syncVideo);
  new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      syncVideo();
    },
    { threshold: 0.05 },
  ).observe(root);
  render();
  onScroll();
}

export function initCaseReels() {
  document.querySelectorAll<HTMLElement>('[data-reel]').forEach((root) => {
    if (root.dataset.reelReady) return;
    root.dataset.reelReady = 'true';
    initReel(root);
  });
}
