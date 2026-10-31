// Pinned horizontal sequence: while [data-pinned] scrolls past, its sticky inner stays put and
// [data-pinned-track] moves sideways in step with the scroll. Only on wide screens (≥ 1024px,
// enough height) without reduced motion; otherwise the content stays a normal vertical stack.
// Steps marked [data-step] get .is-current for the chapter nearest the centre.

const enabled = () =>
  window.matchMedia('(min-width: 1024px) and (min-height: 640px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initPinned(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-pinned-track]');
  if (!track) return;
  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  let frame = 0;

  const update = () => {
    frame = 0;
    if (!root.classList.contains('is-pinned')) return;
    const box = root.getBoundingClientRect();
    const travel = root.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -box.top / Math.max(travel, 1)));
    const distance = Math.max(0, track.scrollWidth - window.innerWidth);
    track.style.setProperty('--track-x', `${-progress * distance}px`);
    const current = Math.round(progress * (steps.length - 1));
    steps.forEach((s, i) => s.classList.toggle('is-current', i === current));
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const setMode = () => {
    root.classList.toggle('is-pinned', enabled());
    if (!root.classList.contains('is-pinned')) track.style.removeProperty('--track-x');
    request();
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', setMode);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', setMode);
  setMode();
}

export function initPinnedTracks() {
  document.querySelectorAll<HTMLElement>('[data-pinned]').forEach((root) => {
    if (root.dataset.pinnedReady) return;
    root.dataset.pinnedReady = 'true';
    initPinned(root);
  });
}
