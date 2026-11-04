// Stride Education's deck (components/experience/Deck.astro, variant "stairs", desktop): the cards are a
// staircase, rising left to right. A line runs along the tops, like the road on the level map, lit as far as
// the step under the pointer or the keyboard, with a dot standing on it. Steps rise from the floor one by one.
import { calm, desktop, firstView, slidePill } from './deck-parts';

export function initStairs(root: HTMLElement, tabs: HTMLButtonElement[], panels: HTMLElement[]) {
  const pill = slidePill(root, tabs);
  const ABOVE = 16; // px, the line above the tops

  const stairs = panels.map((panel) => {
    const items = [...panel.querySelectorAll<HTMLElement>('.deck__cards > li')];
    const svg = panel.querySelector<SVGSVGElement>('[data-stair-line]');
    const base = svg?.querySelector<SVGPathElement>('.deck__stair-base');
    const lit = svg?.querySelector<SVGPathElement>('.deck__stair-lit');
    const climber = panel.querySelector<HTMLElement>('[data-stair-climber]');
    let at = 0;
    const show = () => {
      if (panel.hidden || !base || !lit || !climber || !items.length) return;
      const box = panel.getBoundingClientRect();
      const steps = items.map((li) => {
        const r = li.getBoundingClientRect();
        return { left: r.left - box.left, right: r.right - box.left, top: r.top - box.top - ABOVE };
      });
      let d = `M ${steps[0].left} ${steps[0].top}`;
      steps.forEach((s, n) => (d += `${n ? ` H ${s.left} V ${s.top}` : ''} H ${s.right}`));
      base.setAttribute('d', d);
      lit.setAttribute('d', d);
      // How far along the line the middle of this step is.
      let walked = 0;
      let total = 0;
      steps.forEach((s, n) => {
        const before = n ? s.left - steps[n - 1].right + Math.abs(s.top - steps[n - 1].top) : 0;
        total += before + (s.right - s.left);
        if (n < at) walked += before + (s.right - s.left);
        if (n === at) walked += before + (s.right - s.left) / 2;
      });
      lit.style.strokeDashoffset = String(1 - walked / total);
      const s = steps[at];
      climber.style.transform = `translate(${(s.left + s.right) / 2}px, ${s.top}px)`;
    };
    const focus = (i: number) => {
      at = i;
      items.forEach((li, n) => {
        li.classList.toggle('is-open', n === i);
        li.classList.toggle('is-climbed', n < i);
      });
      show();
    };
    items.forEach((li, n) => {
      li.addEventListener('pointerenter', () => focus(n));
      li.addEventListener('focusin', () => focus(n));
    });
    focus(0);
    const rise = () => {
      if (calm() || !desktop()) return;
      items.forEach((li, n) => {
        li.animate([{ clipPath: 'inset(100% 0 0 0 round 22px)' }, { clipPath: 'inset(0 0 0 0 round 22px)' }], {
          duration: 620,
          delay: n * 80,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards',
        });
      });
      [svg, climber].forEach((el) => el?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: items.length * 80 + 200, fill: 'backwards' }));
    };
    return { show, rise };
  });

  const current = () => Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  firstView(root, () => {
    stairs[current()].show();
    stairs[current()].rise();
  });
  new ResizeObserver(() => stairs[current()].show()).observe(root);

  return (i: number) => {
    pill();
    stairs[i].show();
    stairs[i].rise();
  };
}
