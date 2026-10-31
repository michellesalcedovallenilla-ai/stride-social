// Horizontal rail with previous/next buttons. Markup: [data-rail] root containing
// [data-rail-track] (the scroller) and optional [data-rail-prev] / [data-rail-next] buttons.
// Native scrolling and snap do the work; the buttons page by one tile and disable at the ends.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initRail(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-rail-track]');
  if (!track) return;
  const prev = root.querySelector<HTMLButtonElement>('[data-rail-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-rail-next]');

  const step = () => {
    const item = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return item ? item.offsetWidth + gap : track.clientWidth * 0.8;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max;
  };
  const go = (dir: 1 | -1) => track.scrollBy({ left: dir * step(), behavior: reduced() ? 'auto' : 'smooth' });

  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

export function initRails() {
  document.querySelectorAll<HTMLElement>('[data-rail]').forEach((root) => {
    if (root.dataset.railReady) return;
    root.dataset.railReady = 'true';
    initRail(root);
  });
}
