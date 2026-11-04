// Behaviour for education/LevelMap.astro: scrolling climbs the path, level by level; tapping a level goes
// there; a level can be added to your own path, and the link to the enquiry form carries your picks.
// On desktop (.is-world) the climb is continuous: a light follows the road with the scroll, reaching each level
// at the middle of its step, the view rises with it, and the contour lines drift more slowly behind. Hovering a
// level ahead shows the way there.
import { clamp, goToProgress, progressOf, reduced, stepOf, stepPoint } from './ambient';

function initMap(root: HTMLElement) {
  const nodes = [...root.querySelectorAll<HTMLElement>('[data-lmap-node]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-lmap-card]')];
  const adds = [...root.querySelectorAll<HTMLButtonElement>('[data-lmap-add]')];
  const messages = [...root.querySelectorAll<HTMLElement>('[data-lmap-message]')];
  const pop = root.querySelector<HTMLElement>('[data-lmap-pop]');
  const lit = root.querySelector<SVGPathElement>('[data-lmap-lit]');
  const picksEl = root.querySelector<HTMLElement>('[data-lmap-picks]');
  const empty = root.querySelector<HTMLElement>('[data-lmap-empty]');
  const level = root.querySelector<HTMLElement>('[data-lmap-level]');
  const cta = root.querySelector<HTMLAnchorElement>('[data-lmap-cta]');
  const burst = root.querySelector<HTMLElement>('[data-lmap-burst]');
  const total = nodes.length;
  const base = root.dataset.enquire ?? '/education/enquire';
  const levelOf = root.dataset.levelOf ?? 'Level {n} of {total}';
  const picked = new Set<number>();
  let now = -1;
  let message = 0;
  let celebrated = false;

  const celebrate = () => {
    if (celebrated || reduced() || !burst || !nodes[total - 1]) return;
    celebrated = true;
    const x = nodes[total - 1].style.left;
    const y = nodes[total - 1].style.top;
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      const a = (i / 18) * Math.PI * 2;
      const r = 70 + Math.random() * 90;
      s.style.left = x;
      s.style.top = y;
      s.style.setProperty('--bx', `${(Math.cos(a) * r).toFixed(0)}px`);
      s.style.setProperty('--by', `${(Math.sin(a) * r).toFixed(0)}px`);
      burst.append(s);
      s.addEventListener('animationend', () => s.remove());
    }
  };

  const show = (i: number) => {
    if (i === now) return;
    now = i;
    nodes.forEach((n, k) => {
      n.classList.toggle('is-now', k === i);
      n.classList.toggle('is-done', k < i);
    });
    cards.forEach((c, k) => {
      c.classList.toggle('is-active', k === i);
      if (k === i) c.removeAttribute('aria-hidden');
      else c.setAttribute('aria-hidden', 'true');
    });
    root.style.setProperty('--xp', String((i + 1) / total));
    if (level) level.textContent = levelOf.replace('{n}', String(i + 1)).replace('{total}', String(total));
    // The lit road reaches this level's node (the path passes the nodes evenly).
    lit?.style.setProperty('--road', String(1 - i / Math.max(1, total - 1)));
    // The card sits beside the level, on the side with room.
    const x = parseFloat(nodes[i].style.left);
    const y = parseFloat(nodes[i].style.top);
    pop?.style.setProperty('--pop-x', x > 50 ? `calc(${x}% - 44% - 54px)` : `calc(${x}% + 54px)`);
    pop?.style.setProperty('--pop-y', `${Math.min(80, Math.max(20, y))}%`);
    if (i === total - 1) celebrate();
  };

  const renderPicks = () => {
    const order = [...picked].sort((a, b) => a - b);
    if (picksEl) {
      [...picksEl.children].forEach((li) => {
        if (!order.includes(Number((li as HTMLElement).dataset.i))) li.remove();
      });
      order.forEach((i, pos) => {
        if ([...picksEl.children].some((li) => Number((li as HTMLElement).dataset.i) === i)) return;
        const li = document.createElement('li');
        li.dataset.i = String(i);
        li.textContent = nodes[i].dataset.title ?? '';
        picksEl.insertBefore(li, picksEl.children[pos] ?? null);
      });
    }
    if (empty) empty.hidden = order.length > 0;
    nodes.forEach((n, i) => n.classList.toggle('is-picked', picked.has(i)));
    adds.forEach((a, i) => a.setAttribute('aria-pressed', String(picked.has(i))));
    if (cta) cta.href = order.length ? `${base}?topics=${order.map((i) => nodes[i].dataset.id).join(',')}` : base;
  };

  adds.forEach((a, i) =>
    a.addEventListener('click', () => {
      if (picked.has(i)) picked.delete(i);
      else picked.add(i);
      renderPicks();
    }),
  );
  root.querySelectorAll<HTMLButtonElement>('[data-lmap-go]').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.lmapGo);
      show(i);
      goToProgress(root, stepPoint(i, total), true);
    }),
  );

  /* ---------- Find my level: every yes moves you further along the path ---------- */
  const find = root.querySelector<HTMLButtonElement>('[data-lmap-find]');
  const quiz = root.querySelector<HTMLElement>('[data-lmap-quiz]');
  const questions = [...root.querySelectorAll<HTMLElement>('[data-lmap-q]')];
  const result = root.querySelector<HTMLElement>('[data-lmap-result]');
  let yes = 0;
  let asked = 0;
  const closeQuiz = () => {
    if (quiz) quiz.hidden = true;
    find?.setAttribute('aria-expanded', 'false');
  };
  find?.addEventListener('click', () => {
    if (!quiz) return;
    if (!quiz.hidden) return closeQuiz();
    yes = 0;
    asked = 0;
    questions.forEach((q, k) => (q.hidden = k !== 0));
    if (result) result.hidden = true;
    quiz.hidden = false;
    find.setAttribute('aria-expanded', 'true');
    questions[0]?.querySelector('button')?.focus({ preventScroll: true });
  });
  questions.forEach((q) =>
    q.querySelectorAll<HTMLButtonElement>('[data-lmap-answer]').forEach((b) =>
      b.addEventListener('click', () => {
        yes += Number(b.dataset.lmapAnswer);
        asked += 1;
        q.hidden = true;
        const following = questions[asked];
        if (following) {
          following.hidden = false;
          following.querySelector('button')?.focus({ preventScroll: true });
          return;
        }
        const i = Math.round((yes / questions.length) * (total - 1));
        if (result) {
          result.textContent = (quiz?.dataset.result ?? '').replace('{n}', String(i + 1)).replace('{title}', nodes[i]?.dataset.title ?? '');
          result.hidden = false;
        }
        show(i);
        goToProgress(root, stepPoint(i, total), true);
        window.setTimeout(closeQuiz, 3600);
      }),
    ),
  );

  /* ---------- The mountain (desktop) ---------- */
  const desk = window.matchMedia('(min-width: 1024px)');
  const world = root.querySelector<HTMLElement>('[data-lmap-world]');
  const topo = root.querySelector<HTMLElement>('[data-lmap-topo]');
  const board = root.querySelector<HTMLElement>('[data-lmap-board]');
  const pin = root.querySelector<HTMLElement>('.lmap__pin');
  const slot = root.querySelector<HTMLElement>('[data-lmap-slot]');
  const climber = root.querySelector<HTMLElement>('[data-lmap-climber]');
  const route = root.querySelector<SVGPathElement>('[data-lmap-route]');
  const peek = root.querySelector<SVGPathElement>('[data-lmap-peek]');
  let marks: number[] = [];
  let length = 0;

  // How far along the road each level is: the road only ever climbs, so its height finds the place.
  const measure = () => {
    if (!route) return;
    length = route.getTotalLength();
    marks = nodes.map((n) => {
      const y = parseFloat(n.style.top) * 16;
      let lo = 0;
      let hi = length;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2;
        if (route.getPointAtLength(mid).y > y) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    });
  };
  const climb = () => {
    if (!route || !world || !pin || !climber || !marks.length || !length) return;
    const t = clamp(progressOf(root) * total - 0.5, 0, total - 1);
    const i = Math.min(total - 2, Math.floor(t));
    const along = total > 1 ? marks[i] + (marks[i + 1] - marks[i]) * (t - i) : marks[0];
    const point = route.getPointAtLength(along);
    const scale = world.clientWidth / 800;
    const x = point.x * scale;
    const y = point.y * scale;
    climber.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    world.style.setProperty('--climb', (1 - along / length).toFixed(4));
    // The view rises with the climber, who stays a little below the middle until the ends.
    const offset = (board?.getBoundingClientRect().top ?? 0) - pin.getBoundingClientRect().top;
    const low = Math.min(0, pin.clientHeight - offset - world.offsetHeight - 40);
    const rise = clamp(pin.clientHeight * 0.56 - offset - y, low, 0);
    world.style.transform = `translate3d(0, ${rise.toFixed(1)}px, 0)`;
    if (topo) topo.style.transform = `translate3d(0, ${(rise * 0.62).toFixed(1)}px, 0)`;
  };
  // Below desktop the card stays on the map; on desktop it's on the left, and Find my level sits by Enquire.
  const finder = root.querySelector<HTMLElement>('[data-lmap-finder]');
  const actions = root.querySelector<HTMLElement>('[data-lmap-actions]');
  const homeOfFinder = finder?.parentElement;
  const mode = () => {
    root.classList.toggle('is-world', desk.matches);
    if (pop && slot && board) (desk.matches ? slot : board).append(pop);
    if (finder) (desk.matches ? actions : homeOfFinder)?.append(finder);
    if (!desk.matches) return;
    measure();
    climb();
  };
  desk.addEventListener('change', mode);
  window.addEventListener('resize', () => desk.matches && climb(), { passive: true });
  nodes.forEach((n, i) => {
    n.addEventListener('pointerenter', () => {
      if (!desk.matches || !peek || i <= now || !length) return;
      peek.style.strokeDashoffset = (1 - marks[i] / length).toFixed(4);
      peek.classList.add('is-on');
    });
    n.addEventListener('pointerleave', () => peek?.classList.remove('is-on'));
  });
  // The contour lines lean a little away from the pointer.
  pin?.addEventListener('pointermove', (e) => {
    if (!desk.matches || !topo) return;
    topo.style.setProperty('--px', `${((0.5 - e.clientX / window.innerWidth) * 26).toFixed(1)}px`);
    topo.style.setProperty('--py', `${((0.5 - e.clientY / window.innerHeight) * 18).toFixed(1)}px`);
  });

  const onScroll = () => {
    if (total) show(stepOf(root, total));
    if (desk.matches) climb();
    const m = Math.min(messages.length - 1, Math.floor(progressOf(root) * messages.length));
    if (m === message) return;
    message = m;
    messages.forEach((el, i) => {
      el.classList.toggle('is-active', i === m);
      if (i === m) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', 'true');
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  mode();
  document.fonts?.ready.then(mode);
  onScroll();
  renderPicks();
}

export function initLevelMaps() {
  document.querySelectorAll<HTMLElement>('[data-lmap]').forEach((root) => {
    if (root.dataset.lmapReady) return;
    root.dataset.lmapReady = 'true';
    initMap(root);
  });
}
