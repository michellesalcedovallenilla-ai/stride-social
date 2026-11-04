// Helpers for the redesigned pages (components/experience/): the light that follows the pointer
// (Ambient.astro), the tilt and sheen of a held card, and how far through a pinned section the scroll is.

type Lenis = { scrollTo(target: number, options?: { immediate?: boolean; force?: boolean; duration?: number }): void };
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;
export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The light follows the pointer across each ambient's section. */
export function initAmbient() {
  document.querySelectorAll<HTMLElement>('[data-ambient]').forEach((el) => {
    if (el.dataset.ready || reduced()) return;
    el.dataset.ready = 'true';
    let queued = false;
    let x = 0;
    let y = 0;
    window.addEventListener(
      'pointermove',
      (e) => {
        x = e.clientX;
        y = e.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${(x - r.left).toFixed(0)}px`);
          el.style.setProperty('--my', `${(y - r.top).toFixed(0)}px`);
          el.style.setProperty('--spot', '1');
        });
      },
      { passive: true },
    );
    document.documentElement.addEventListener('pointerleave', () => el.style.setProperty('--spot', '0'), { passive: true });
  });
}

/** A card that leans towards the pointer, its sheen following: sets --rx, --ry, --gx, --gy on it. */
export function initTilt(area: HTMLElement, cardOf: () => HTMLElement | null, strength = 14) {
  if (reduced()) return;
  const clear = (el: HTMLElement | null) => {
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  let last: HTMLElement | null = null;
  area.addEventListener(
    'pointermove',
    (e) => {
      const card = cardOf();
      if (last && last !== card) clear(last);
      last = card;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width;
      const fy = (e.clientY - r.top) / r.height;
      const over = fx > -0.15 && fx < 1.15 && fy > -0.15 && fy < 1.15;
      if (!over) return clear(card);
      card.style.setProperty('--ry', `${((fx - 0.5) * strength).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - fy) * strength).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(fx * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(fy * 100).toFixed(1)}%`);
    },
    { passive: true },
  );
  area.addEventListener('pointerleave', () => clear(last), { passive: true });
}

/** How far through a pinned section the scroll is, 0 to 1. */
export const progressOf = (root: HTMLElement) => {
  const travel = root.offsetHeight - window.innerHeight;
  return travel > 0 ? clamp(-root.getBoundingClientRect().top / travel, 0, 1) : 0;
};

/** Scroll to a point in a pinned section. */
export const goToProgress = (root: HTMLElement, f: number, smooth = false) => {
  const travel = root.offsetHeight - window.innerHeight;
  const y = window.scrollY + root.getBoundingClientRect().top + clamp(f, 0, 1) * travel;
  const l = lenis();
  if (l) l.scrollTo(y, smooth && !reduced() ? { duration: 0.8, force: true } : { immediate: true, force: true });
  else window.scrollTo(0, y);
};

/** The step (of `total`) a pinned section is at. */
export const stepOf = (root: HTMLElement, total: number) => Math.min(total - 1, Math.floor(progressOf(root) * total));
/** The middle of a step, to scroll to. */
export const stepPoint = (i: number, total: number) => (total > 1 ? (i + 0.5) / total : 0);
