// Behaviour for group/TeamField.astro: faces swell near the pointer, a tag names the nearest one, a face
// grows into its big card, and filtering or shuffling sends the faces flying to their new places.
import { reduced } from './ambient';
import { initGrow } from './grow';

const REACH = 230; // how far the swell reaches, in pixels
const SWELL = 0.8;

function initField(root: HTMLElement) {
  const grid = root.querySelector<HTMLElement>('[data-tfield-grid]');
  const tag = root.querySelector<HTMLElement>('[data-tfield-tag]');
  const tagName = root.querySelector<HTMLElement>('[data-tfield-tag-name]');
  const tagRole = root.querySelector<HTMLElement>('[data-tfield-tag-role]');
  if (!grid) return;
  const faces = [...grid.querySelectorAll<HTMLElement>(':scope > li')];
  const grow = initGrow(root);
  // Clicking the dimmed field puts the card away.
  root.addEventListener('click', (e) => {
    if (root.classList.contains('has-big-card') && !(e.target as HTMLElement).closest('[data-grow-card], .bigcard')) grow.close();
  });

  /* ---------- The swell ---------- */
  let x = 0;
  let y = 0;
  let queued = false;
  let nearest: HTMLElement | null = null;
  const swell = () => {
    queued = false;
    let best = Infinity;
    nearest = null;
    faces.forEach((f) => {
      if (f.hidden) return;
      const r = f.getBoundingClientRect();
      const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
      const k = Math.max(0, 1 - d / REACH);
      const s = 1 + SWELL * k * k;
      const link = f.firstElementChild as HTMLElement;
      link.style.setProperty('--s', s.toFixed(3));
      f.style.zIndex = String(Math.round(s * 10));
      if (d < best) {
        best = d;
        nearest = f;
      }
    });
    const n = nearest as HTMLElement | null;
    if (n && tagName && tagRole && tagName.textContent !== n.dataset.name) {
      tagName.textContent = n.dataset.name ?? '';
      tagRole.textContent = n.dataset.role ?? '';
    }
    // The tag sits beside the pointer, on the side with room.
    const w = tag?.offsetWidth ?? 0;
    tag?.style.setProperty('--tx', `${x + 22 + w > window.innerWidth ? x - w - 22 : x + 22}px`);
    tag?.style.setProperty('--ty', `${y + 18}px`);
  };
  const rest = () => {
    root.classList.remove('is-over');
    faces.forEach((f) => {
      (f.firstElementChild as HTMLElement).style.setProperty('--s', '1');
      f.style.removeProperty('z-index');
    });
  };
  if (!reduced()) {
    grid.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType === 'touch') return;
        x = e.clientX;
        y = e.clientY;
        root.classList.add('is-over');
        if (!queued) {
          queued = true;
          requestAnimationFrame(swell);
        }
      },
      { passive: true },
    );
    grid.addEventListener('pointerleave', rest, { passive: true });
    grid.addEventListener('click', rest);
  }

  /* ---------- Faces flying to new places ---------- */
  const rects = () => new Map(faces.filter((f) => !f.hidden).map((f) => [f, f.getBoundingClientRect()]));
  let before = rects();
  const fly = () => {
    const after = rects();
    if (!reduced()) {
      after.forEach((r, f) => {
        const was = before.get(f);
        f.animate(
          was
            ? [{ transform: `translate(${was.left - r.left}px, ${was.top - r.top}px)` }, { transform: 'none' }]
            : [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }],
          { duration: 620, easing: 'cubic-bezier(0.2, 1.15, 0.3, 1)' },
        );
      });
    }
    before = after;
  };
  let waiting = false;
  new MutationObserver(() => {
    if (waiting) return;
    waiting = true;
    requestAnimationFrame(() => {
      waiting = false;
      fly();
    });
  }).observe(grid, { subtree: true, attributes: true, attributeFilter: ['hidden'] });

  /* ---------- Who you'd work with: they light up and move to the front ---------- */
  const needs = [...root.querySelectorAll<HTMLButtonElement>('[data-tfield-need]')];
  needs.forEach((b) =>
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      needs.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
      const teams = on ? (b.dataset.tfieldNeed ?? '').split(' ') : [];
      before = rects();
      const lit = (f: HTMLElement) => teams.includes(f.dataset.filterDepartment ?? '');
      faces.forEach((f) => {
        f.classList.toggle('is-lit', on && lit(f));
        f.classList.toggle('is-dim', on && !lit(f));
      });
      (on ? [...faces.filter(lit), ...faces.filter((f) => !lit(f))] : faces).forEach((f) => grid.append(f));
      fly();
    }),
  );

  root.querySelector('[data-tfield-shuffle]')?.addEventListener('click', () => {
    before = rects();
    const order = [...faces];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.forEach((f) => grid.append(f));
    fly();
  });
  window.addEventListener('resize', () => (before = rects()), { passive: true });
  window.addEventListener('scroll', () => (before = rects()), { passive: true });
}

export function initTeamFields() {
  document.querySelectorAll<HTMLElement>('[data-tfield]').forEach((root) => {
    if (root.dataset.tfieldReady) return;
    root.dataset.tfieldReady = 'true';
    initField(root);
  });
}
