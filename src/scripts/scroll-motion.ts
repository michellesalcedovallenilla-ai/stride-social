// Scroll-linked motion replacing Webflow IX2 "while scrolling in view" interactions.
//
// data-scroll-x="from,to"   translateX between two CSS lengths (e.g. "25vw,-80vw") while the
//                           closest [data-scroll-scope] (or the element) passes through view.
// data-scroll-scope="start,distance"  progress 0→1 starts when the scope's top reaches
//                           `start` × viewport height and completes `distance` × vh later.
// data-horizontal-track     sticky horizontal scroller: the [data-horizontal-rail] child moves
//                           left by (its width − viewport width); `data-end` (0–1) is the share
//                           of the sticky distance at which it reaches the end.

type Item = { update: () => void };

function parseLength(v: string): number {
  const n = parseFloat(v);
  if (v.endsWith('vw')) return (n * window.innerWidth) / 100;
  if (v.endsWith('vh')) return (n * window.innerHeight) / 100;
  return n;
}

function scrubX(el: HTMLElement): Item {
  const [from, to] = (el.dataset.scrollX ?? '0,0').split(',').map((s) => s.trim());
  const scope = el.closest<HTMLElement>('[data-scroll-scope]') ?? el;
  const [start, distance] = (scope.dataset.scrollScope ?? '1,1').split(',').map(Number);
  return {
    update() {
      const vh = window.innerHeight;
      const top = scope.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (start * vh - top) / (distance * vh)));
      const x = parseLength(from) + (parseLength(to) - parseLength(from)) * p;
      el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    },
  };
}

function horizontalTrack(track: HTMLElement): Item {
  const rail = track.querySelector<HTMLElement>('[data-horizontal-rail]');
  const end = Number(track.dataset.end ?? 1);
  return {
    update() {
      if (!rail) return;
      if (getComputedStyle(track).getPropertyValue('--horizontal-enabled').trim() === '0') {
        rail.style.transform = '';
        return;
      }
      const r = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const sticky = Math.max(1, r.height - vh);
      const p = Math.min(1, Math.max(0, -r.top / (sticky * end)));
      const max = rail.scrollWidth - track.clientWidth;
      rail.style.transform = `translate3d(${(-max * p).toFixed(1)}px, 0, 0)`;
    },
  };
}

export function initScrollMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items: Item[] = [
    ...[...document.querySelectorAll<HTMLElement>('[data-scroll-x]')].map(scrubX),
    ...[...document.querySelectorAll<HTMLElement>('[data-horizontal-track]')].map(horizontalTrack),
  ];
  if (!items.length) return;
  let queued = false;
  const run = () => {
    queued = false;
    items.forEach((i) => i.update());
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(run);
    }
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  run();
}
