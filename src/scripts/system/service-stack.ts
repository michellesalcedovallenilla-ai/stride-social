// Behaviour for social/ServiceStack.astro: the scroll decides which card is on top. Dragging the top card
// far enough, clicking it or the arrows move on by moving the scroll, so the two always agree. A card only
// lets go when thrown past a threshold; otherwise it springs back. Thrown right it goes into the visitor's
// brief, thrown left it stays out (src/scripts/system/shortlist.ts).
import { goToProgress, progressOf, stepOf, stepPoint } from './ambient';
import { addTo, initShortlists, removeFrom } from './shortlist';

const THROW = 110;

function initStack(root: HTMLElement) {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-sstack-card]')];
  const dots = [...root.querySelectorAll<HTMLElement>('[data-sstack-dot]')];
  const messages = [...root.querySelectorAll<HTMLElement>('[data-sstack-message]')];
  const pile = root.querySelector<HTMLElement>('[data-sstack-pile]');
  const total = cards.length;
  const service = root.dataset.service ?? '';
  let now = -1;

  const decide = (i: number, keep: boolean) => {
    const label = cards[i]?.dataset.label;
    if (!label) return;
    const id = `${service}:${i}`;
    if (keep) addTo('brief', { id, label, group: service });
    else removeFrom('brief', id);
  };

  const show = (i: number) => {
    if (i === now) return;
    now = i;
    cards.forEach((c, k) => {
      c.style.setProperty('--d', String(Math.max(0, k - i)));
      c.classList.toggle('is-top', k === i);
      c.classList.toggle('is-gone', k < i);
      c.toggleAttribute('inert', k !== i);
    });
    dots.forEach((d, k) => d.classList.toggle('is-now', k === i));
    const m = Math.min(messages.length - 1, Math.floor((i / Math.max(1, total)) * messages.length));
    messages.forEach((el, k) => {
      el.classList.toggle('is-active', k === m);
      if (k === m) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', 'true');
    });
  };
  const go = (i: number) => {
    const to = Math.min(total - 1, Math.max(0, i));
    show(to);
    goToProgress(root, stepPoint(to, total), true);
  };
  const onScroll = () => {
    root.style.setProperty('--at', progressOf(root).toFixed(3));
    show(stepOf(root, total));
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  root.querySelector('[data-sstack-prev]')?.addEventListener('click', () => go(now - 1));
  root.querySelector('[data-sstack-next]')?.addEventListener('click', () => go(now + 1));
  root.querySelector('[data-sstack-keep]')?.addEventListener('click', () => {
    decide(now, true);
    go(now + 1);
  });
  initShortlists();

  /* ---------- Throwing the top card ---------- */
  if (pile) {
    let held: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;
    let moved = false;
    pile.addEventListener('pointerdown', (e) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.is-top');
      if (e.button !== 0 || !card || (e.target as HTMLElement).closest('a') || now === total - 1) return;
      held = card;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
    });
    window.addEventListener('pointermove', (e) => {
      if (!held) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      held.classList.add('is-held');
      held.style.setProperty('--drag-x', `${dx.toFixed(0)}px`);
      held.style.setProperty('--drag-y', `${(dy * 0.5).toFixed(0)}px`);
      held.style.setProperty('--drag-r', `${(dx * 0.05).toFixed(1)}deg`);
      held.classList.toggle('is-keep', dx > 40);
      held.classList.toggle('is-skip', dx < -40);
    });
    window.addEventListener('pointerup', (e) => {
      if (!held) return;
      const card = held;
      held = null;
      card.classList.remove('is-held', 'is-keep', 'is-skip');
      card.style.removeProperty('--drag-y');
      card.style.removeProperty('--drag-r');
      card.style.removeProperty('--drag-x');
      const dx = e.clientX - startX;
      if (!moved || Math.abs(dx) > THROW) {
        card.style.setProperty('--throw', dx < 0 ? '-1' : '1');
        if (moved) decide(now, dx > 0);
        go(now + 1);
      }
    });
    pile.addEventListener('dragstart', (e) => e.preventDefault());
  }

  show(0);
  onScroll();
}

export function initServiceStacks() {
  document.querySelectorAll<HTMLElement>('[data-sstack]').forEach((root) => {
    if (root.dataset.sstackReady) return;
    root.dataset.sstackReady = 'true';
    initStack(root);
  });
}
