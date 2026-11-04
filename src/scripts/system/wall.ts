// Behaviour for components/experience/Wall.astro. The tiles are placed by hand on a board bigger than the
// screen (each in the shortest column, in a rhythm of heights), and the section is made as tall as the
// board, so ordinary scrolling moves it up and down while it stays pinned. Dragging moves it in any
// direction, with a little throw; a sideways trackpad swipe moves it across. Filters (archive-filter.ts)
// hide tiles, and the rest fly to their new places. Tiles tilt towards the pointer and play their footage
// on hover. Below desktop or with reduced motion none of this runs: the wall is an ordinary grid.
import { initGrow } from './grow';
import { initWallShow } from './wall-show';

type Lenis = { scrollTo(target: number, options?: { immediate?: boolean; force?: boolean; duration?: number }): void };
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;
const jump = (y: number) => {
  const l = lenis();
  if (l) l.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const HEIGHTS = [1.28, 0.92, 1.12, 1.42, 1, 1.2, 0.88];

function initWall(root: HTMLElement) {
  const pin = root.querySelector<HTMLElement>('[data-wall-pin]');
  const board = root.querySelector<HTMLElement>('[data-wall-board]');
  if (!pin || !board) return;
  const tiles = [...board.querySelectorAll<HTMLElement>(':scope > li')];
  const panel = root.querySelector<HTMLElement>('.wall__panel');
  const live = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');

  let x = 0;
  let boardW = 0;
  let suppressClick = false;
  const showcase = root.classList.contains('wall--show');
  initGrow(root, { canOpen: () => !suppressClick, hold: showcase, settle: false });

  const place = () => {
    const rect = root.getBoundingClientRect();
    const minY = Math.min(0, window.innerHeight - root.offsetHeight);
    const y = clamp(rect.top, minY, 0);
    board.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    pin.scrollLeft = 0;
    pin.scrollTop = 0;
  };
  const xRange = () => Math.min(0, window.innerWidth - boardW);

  const layout = () => {
    if (!live.matches) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const shown = tiles.filter((t) => !t.hidden);
    const gap = Math.round(clamp(W * 0.014, 12, 22));
    const tileW = Math.round(clamp(W * 0.17, 200, 300));
    const panelRight = panel ? panel.getBoundingClientRect().right + 40 : 0;
    const cols = Math.max(4, Math.ceil(Math.sqrt(shown.length * 1.5)));
    const heights = new Array<number>(cols).fill(0);
    const top = 90;
    shown.forEach((t, i) => {
      let c = 0;
      for (let k = 1; k < cols; k++) if (heights[k] < heights[c] - 1) c = k;
      const h = Math.round(tileW * HEIGHTS[i % HEIGHTS.length]);
      // Alternate columns start lower, so the rows never line up.
      const start = top + (c % 2 ? tileW * 0.34 : 0);
      t.style.width = `${tileW}px`;
      t.style.height = `${h}px`;
      t.style.transform = `translate3d(${panelRight + c * (tileW + gap)}px, ${Math.round(start + heights[c])}px, 0)`;
      t.style.transitionDelay = root.classList.contains('is-ready') ? '0ms' : `${Math.min(i, 20) * 28}ms`;
      // Columns drift at their own speeds as the wall scrolls (wall-show.ts).
      t.style.setProperty('--r', String([-0.05, 0.07, -0.02, 0.1][c % 4]));
      heights[c] += h + gap;
    });
    const boardH = Math.max(...heights, 0) + top + tileW * 0.34 + 90;
    boardW = panelRight + cols * (tileW + gap) + 90;
    board.style.width = `${boardW}px`;
    board.style.height = `${boardH}px`;
    root.style.height = `${Math.max(H, boardH)}px`;
    x = clamp(x, xRange(), 0);
    place();
    root.dispatchEvent(new CustomEvent('wall:layout'));
  };

  // The map asks to go somewhere, as fractions of the way across and down (wall-show.ts).
  root.addEventListener('wall:go', (e) => {
    const { fx, fy } = (e as CustomEvent<{ fx: number; fy: number }>).detail;
    x = xRange() * fx;
    root.classList.add('has-moved');
    jump(window.scrollY + root.getBoundingClientRect().top + fy * Math.max(0, root.offsetHeight - window.innerHeight));
    place();
  });

  /* ---------- Flying to a tile: Surprise me, and links that point at one (?spotlight=) ---------- */
  const flyTo = (tile: HTMLElement) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const left = panel ? panel.getBoundingClientRect().right + 40 : 0;
    const r = tile.getBoundingClientRect();
    const fromX = x;
    const toX = clamp(x + (left + W) / 2 - (r.left + r.width / 2), xRange(), 0);
    const top = window.scrollY + root.getBoundingClientRect().top;
    const toY = clamp(window.scrollY + r.top + r.height / 2 - H / 2, top, top + root.offsetHeight - H);
    root.classList.add('has-moved');
    lenis()?.scrollTo(toY, { duration: 0.9, force: true });
    tiles.forEach((t) => t.classList.remove('is-spot'));
    const t0 = performance.now();
    const step = (t: number) => {
      const k = clamp((t - t0) / 900, 0, 1);
      x = fromX + (toX - fromX) * (1 - (1 - k) ** 3);
      place();
      if (k < 1) return requestAnimationFrame(step);
      tile.classList.add('is-spot');
      tile.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
      window.setTimeout(() => tile.classList.remove('is-spot'), 2600);
    };
    requestAnimationFrame(step);
  };
  let lastPick: HTMLElement | null = null;
  root.querySelector('[data-wall-surprise]')?.addEventListener('click', () => {
    const pool = tiles.filter((t) => !t.hidden && t !== lastPick);
    if (!pool.length) return;
    lastPick = pool[Math.floor(Math.random() * pool.length)];
    const pick = lastPick;
    if (!showcase) return flyTo(pick);
    // The showcase shuffles the whole wall first: every tile flies to a new place, then to the pick.
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    layout();
    window.setTimeout(() => flyTo(pick), 720);
  });

  /* ---------- Dragging, with a throw ---------- */
  let pressed = false;
  let moved = false;
  let lastX = 0;
  let lastY = 0;
  let vx = 0;
  let vy = 0;
  let lastT = 0;
  let raf = 0;
  const glide = () => {
    raf = 0;
    vx *= 0.94;
    vy *= 0.94;
    if (Math.abs(vx) < 0.2 && Math.abs(vy) < 0.2) return;
    x = clamp(x + vx, xRange(), 0);
    jump(window.scrollY - vy);
    place();
    raf = requestAnimationFrame(glide);
  };
  pin.addEventListener('pointerdown', (e) => {
    if (!live.matches || e.button !== 0 || e.pointerType === 'touch') return;
    if ((e.target as HTMLElement).closest('.wall__panel, .wall__details')) return;
    pressed = true;
    moved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = e.timeStamp;
    vx = vy = 0;
    cancelAnimationFrame(raf);
    raf = 0;
  });
  window.addEventListener('pointermove', (e) => {
    if (!pressed) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    if (!moved) {
      moved = true;
      root.classList.add('is-dragging', 'has-moved');
      try {
        pin.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer is already gone */
      }
    }
    const dt = Math.max(1, e.timeStamp - lastT);
    vx = (dx / dt) * 16;
    vy = (dy / dt) * 16;
    x = clamp(x + dx, xRange(), 0);
    jump(window.scrollY - dy);
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = e.timeStamp;
    place();
  });
  const release = (e: PointerEvent) => {
    if (!pressed) return;
    pressed = false;
    root.classList.remove('is-dragging');
    if (moved) {
      suppressClick = true;
      window.setTimeout(() => (suppressClick = false), 0);
      if (e.timeStamp - lastT < 80) raf = requestAnimationFrame(glide);
    }
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  board.addEventListener(
    'click',
    (e) => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );
  board.addEventListener('dragstart', (e) => e.preventDefault());

  /* ---------- A sideways swipe, and scrolling ---------- */
  pin.addEventListener(
    'wheel',
    (e) => {
      if (!live.matches || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      x = clamp(x - e.deltaX, xRange(), 0);
      root.classList.add('has-moved');
      place();
    },
    { passive: true },
  );
  window.addEventListener(
    'scroll',
    () => {
      if (!live.matches) return;
      if (window.scrollY > 40) root.classList.add('has-moved');
      place();
    },
    { passive: true },
  );

  /* ---------- A tile under the pointer: it tilts, and plays ---------- */
  let tilted: HTMLElement | null = null;
  board.addEventListener('pointermove', (e) => {
    if (pressed || !live.matches) return;
    const link = (e.target as HTMLElement).closest<HTMLElement>('.wtile__link');
    if (tilted && tilted !== link) {
      tilted.style.removeProperty('--rx');
      tilted.style.removeProperty('--ry');
    }
    tilted = link;
    if (!link) return;
    const r = link.getBoundingClientRect();
    link.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(2)}deg`);
    link.style.setProperty('--rx', `${(((e.clientY - r.top) / r.height - 0.5) * -12).toFixed(2)}deg`);
  });
  board.addEventListener('pointerleave', () => {
    tilted?.style.removeProperty('--rx');
    tilted?.style.removeProperty('--ry');
    tilted = null;
  });
  board.querySelectorAll<HTMLElement>('.wtile__link').forEach((link) => {
    const video = link.querySelector('video');
    if (!video) return;
    link.addEventListener('pointerenter', () => video.play().catch(() => {}));
    link.addEventListener('pointerleave', () => video.pause());
  });

  /* ---------- The keyboard: focus brings its tile on screen ---------- */
  board.addEventListener('focusin', (e) => {
    if (!live.matches || !(e.target as HTMLElement).matches(':focus-visible')) return;
    pin.scrollLeft = 0;
    pin.scrollTop = 0;
    const r = (e.target as HTMLElement).getBoundingClientRect();
    const leftEdge = panel ? panel.getBoundingClientRect().right + 40 : 0;
    if (r.left < leftEdge) x = clamp(x + (leftEdge - r.left), xRange(), 0);
    else if (r.right > window.innerWidth - 40) x = clamp(x - (r.right - window.innerWidth + 40), xRange(), 0);
    if (r.top < 90) jump(window.scrollY + r.top - 90);
    else if (r.bottom > window.innerHeight - 40) jump(window.scrollY + r.bottom - window.innerHeight + 40);
    place();
  });

  /* ---------- On or off, and rearranging ---------- */
  const setMode = () => {
    root.classList.toggle('is-live', live.matches);
    if (live.matches) {
      layout();
      requestAnimationFrame(() => root.classList.add('is-ready'));
    } else {
      root.classList.remove('is-ready');
      root.style.removeProperty('height');
      board.removeAttribute('style');
      tiles.forEach((t) => t.removeAttribute('style'));
      x = 0;
    }
  };
  live.addEventListener('change', setMode);
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      // A new filter starts from the left of the wall, so its tiles are never left behind the panel.
      x = 0;
      layout();
    });
  }).observe(board, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
  let resizing = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizing);
    resizing = window.setTimeout(layout, 150);
  }, { passive: true });
  document.fonts?.ready.then(layout);
  setMode();
  if (showcase && live.matches) initWallShow(root);
  const spotlight = new URLSearchParams(location.search).get('spotlight');
  if (spotlight && live.matches) {
    window.setTimeout(() => {
      const tile = tiles.find((t) => t.dataset.key === spotlight);
      if (tile && !tile.hidden) flyTo(tile);
    }, 900);
  }
}

export function initWalls() {
  document.querySelectorAll<HTMLElement>('[data-wall]').forEach((root) => {
    if (root.dataset.wallReady) return;
    root.dataset.wallReady = 'true';
    initWall(root);
  });
}
