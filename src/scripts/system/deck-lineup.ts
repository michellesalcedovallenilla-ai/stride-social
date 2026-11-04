// Stride Talent's deck (components/experience/Deck.astro, variant "lineup", desktop): its cards stand in an
// row in black and white. Moving along it, the one nearest the pointer steps forward in colour and the rest lean
// away. Keyboard focus does the same. Cards walk on from the wing.
import { calm, desktop, firstView, preload, slidePill } from './deck-parts';

export function initLineup(root: HTMLElement, tabs: HTMLButtonElement[], panels: HTMLElement[]) {
  const pill = slidePill(root, tabs);
  preload(root);

  const rows = panels.map((panel) => {
    const row = panel.querySelector<HTMLElement>('.deck__cards')!;
    const items = [...row.querySelectorAll<HTMLElement>(':scope > li')];
    let at = -1;
    const focus = (i: number) => {
      if (i === at) return;
      at = i;
      items.forEach((li, n) => {
        li.style.setProperty('--d', String(n - i));
        li.style.setProperty('--a', String(Math.abs(n - i)));
        li.classList.toggle('is-open', n === i);
      });
    };
    row.addEventListener('pointermove', (e) => {
      const first = items[0];
      if (!first || items.length < 2) return;
      const box = row.getBoundingClientRect();
      const step = (box.width - first.offsetWidth) / (items.length - 1);
      const i = Math.round((e.clientX - box.left - first.offsetWidth / 2) / step);
      focus(Math.max(0, Math.min(items.length - 1, i)));
    });
    items.forEach((li, n) => li.addEventListener('focusin', () => focus(n)));
    focus(Math.floor((items.length - 1) / 2));
    return { items };
  });

  const walkOn = (i: number) => {
    if (calm() || !desktop()) return;
    rows[i].items.forEach((li, n) => {
      li.animate([{ translate: '-110vw 0', opacity: 0 }, { opacity: 1, offset: 0.2 }, { translate: '0 0', opacity: 1 }], {
        duration: 760,
        delay: (rows[i].items.length - 1 - n) * 42,
        easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)',
        fill: 'backwards',
      });
    });
  };
  const current = () => Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  firstView(root, () => walkOn(current()));

  // The shortlist's tray rises while the tabs it would cover are on screen.
  const bar = root.querySelector('.deck__bar');
  const tray = document.querySelector('[data-tray="creators"]');
  if (bar && tray) new IntersectionObserver((e) => tray.classList.toggle('is-up', e[0].isIntersecting)).observe(bar);

  return (i: number) => {
    pill();
    walkOn(i);
  };
}
