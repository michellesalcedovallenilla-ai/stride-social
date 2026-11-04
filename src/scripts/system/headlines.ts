// Behaviour for group/Headlines.astro: the picture of the headline under the pointer floats in the free space
// to the right of the list, following up and down with a little lag and a lean in the direction of travel,
// crossfading from one article to the next.
import { reduced } from './ambient';

function initList(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>('[data-heads-list]');
  const float = root.querySelector<HTMLElement>('[data-heads-float]');
  const a = root.querySelector<HTMLImageElement>('[data-heads-a]');
  const b = root.querySelector<HTMLImageElement>('[data-heads-b]');
  if (!list || !float || !a || !b || !window.matchMedia('(min-width: 1024px)').matches) return;
  let front = a;
  let back = b;
  let current = '';
  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  let over = false;

  const loop = () => {
    raf = 0;
    const dx = tx - x;
    const dy = ty - y;
    x += dx * (reduced() ? 1 : 0.14);
    y += dy * (reduced() ? 1 : 0.14);
    float.style.setProperty('--fx', `${x.toFixed(1)}px`);
    float.style.setProperty('--fy', `${y.toFixed(1)}px`);
    float.style.setProperty('--fr', `${Math.max(-7, Math.min(7, dy * 0.04)).toFixed(2)}deg`);
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) raf = requestAnimationFrame(loop);
  };
  const run = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const show = (src: string) => {
    if (src === current) return;
    current = src;
    back.src = src;
    back.classList.add('is-on');
    front.classList.remove('is-on');
    [front, back] = [back, front];
  };

  list.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      const link = (e.target as HTMLElement).closest<HTMLElement>('[data-cover]');
      const h = float.offsetHeight;
      const right = list.getBoundingClientRect().right;
      // At the right of the list, drifting a little with the pointer.
      tx = right - float.offsetWidth + (e.clientX - right) * 0.03;
      ty = Math.max(12, Math.min(window.innerHeight - h - 12, e.clientY - h / 2));
      if (!over) {
        x = tx;
        y = ty;
      }
      over = !!link;
      root.classList.toggle('is-previewing', over);
      if (link?.dataset.cover) show(link.dataset.cover);
      run();
    },
    { passive: true },
  );
  list.addEventListener(
    'pointerleave',
    () => {
      over = false;
      root.classList.remove('is-previewing');
    },
    { passive: true },
  );
}

/** The headlines rearranging as the filters change: each flies from where it was, the new ones fade up. */
function initRearrange(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>('[data-heads-list]');
  if (!list || reduced()) return;
  const rows = () => new Map(([...list.children] as HTMLElement[]).filter((li) => !li.hidden).map((li) => [li, li.getBoundingClientRect().top]));
  let before = rows();
  root.addEventListener('input', () => (before = rows()), true);
  root.addEventListener(
    'click',
    (e) => {
      if ((e.target as HTMLElement).closest('[data-value], [data-filter-clear], [data-load-more]')) before = rows();
    },
    true,
  );
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      rows().forEach((top, li) => {
        const was = before.get(li);
        li.animate(
          was === undefined ? [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }] : [{ transform: `translateY(${was - top}px)` }, { transform: 'none' }],
          { duration: 460, easing: 'cubic-bezier(0.2, 1, 0.3, 1)' },
        );
      });
    });
  }).observe(list, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
}

export function initHeadlines() {
  document.querySelectorAll<HTMLElement>('[data-heads]').forEach((root) => {
    if (root.dataset.headsReady) return;
    root.dataset.headsReady = 'true';
    initList(root);
    if (window.matchMedia('(min-width: 1024px)').matches) initRearrange(root);
  });
}
