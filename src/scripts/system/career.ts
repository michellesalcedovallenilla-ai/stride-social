// Behaviour for talent/CareerBuilder.astro: services switch on and off, the plan fills up, and the link to
// the application form carries what was picked. On desktop the lines nearest the pointer brighten (--near), and
// the one under the pointer or the keyboard explains itself on the left.
export function initCareers() {
  document.querySelectorAll<HTMLElement>('[data-career]').forEach((root) => {
    if (root.dataset.careerReady) return;
    root.dataset.careerReady = 'true';
    const tiles = [...root.querySelectorAll<HTMLButtonElement>('[data-career-tile]')];
    const list = root.querySelector<HTMLElement>('[data-career-list]');
    const empty = root.querySelector<HTMLElement>('[data-career-empty]');
    const count = root.querySelector<HTMLElement>('[data-career-count]');
    const apply = root.querySelector<HTMLAnchorElement>('[data-career-apply]');
    const base = root.dataset.apply ?? '/talent/apply';

    const render = () => {
      const on = tiles.filter((t) => t.getAttribute('aria-pressed') === 'true').map((t) => t.dataset.careerTile ?? '');
      if (list) {
        // Only new ones are added, so only they pop.
        [...list.children].forEach((li) => {
          if (!on.includes(li.textContent ?? '')) li.remove();
        });
        on.forEach((label) => {
          if ([...list.children].some((li) => li.textContent === label)) return;
          const li = document.createElement('li');
          li.textContent = label;
          list.append(li);
        });
      }
      if (empty) empty.hidden = on.length > 0;
      if (count) count.textContent = `${on.length} / ${tiles.length}`;
      root.style.setProperty('--plan', String(on.length / Math.max(1, tiles.length)));
      if (apply) apply.href = on.length ? `${base}?needs=${encodeURIComponent(on.join('|'))}` : base;
    };

    tiles.forEach((t) =>
      t.addEventListener('click', () => {
        t.setAttribute('aria-pressed', String(t.getAttribute('aria-pressed') !== 'true'));
        render();
      }),
    );
    render();

    // ---------- Desktop ----------
    const wall = root.querySelector<HTMLElement>('[data-career-tiles]');
    const peek = root.querySelector<HTMLElement>('[data-career-peek]');
    const REACH = 170; // px, how far from the pointer a line starts to brighten
    const say = (t: HTMLElement | null) => {
      root.classList.toggle('is-peeking', !!t?.dataset.copy);
      if (peek && t?.dataset.copy) peek.textContent = t.dataset.copy;
    };
    let queued = 0;
    let y = 0;
    wall?.addEventListener('pointermove', (e) => {
      y = e.clientY;
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        tiles.forEach((t) => {
          const r = t.getBoundingClientRect();
          const near = Math.max(0, 1 - Math.abs(y - (r.top + r.height / 2)) / REACH);
          t.style.setProperty('--near', (near * near).toFixed(3));
        });
      });
    });
    wall?.addEventListener('pointerleave', () => {
      tiles.forEach((t) => t.style.setProperty('--near', '0'));
      say(null);
    });
    tiles.forEach((t) => {
      t.addEventListener('pointerenter', () => say(t));
      t.addEventListener('focus', () => t.matches(':focus-visible') && say(t));
      t.addEventListener('blur', () => say(null));
    });
  });
}
