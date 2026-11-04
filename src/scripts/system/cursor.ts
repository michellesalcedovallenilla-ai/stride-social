// Behaviour for global/CursorBuddy.astro. A fine point sits exactly on the pointer; a bead of glass follows it on a
// spring, stretching along its direction of travel. Over anything pressable that's small enough, the bead melts into a
// capsule around it; a press squeezes it and sends out a ripple. Text fields keep their own cursor, and walls with
// their own lens (wall-show.ts) take over. Only with a real mouse on a desktop-sized screen. What a visitor picks is
// kept on this device only, and the page works the same without it.
type Choice = { finish: string; size: string; ripple: boolean; on: boolean };

const KEY = 'stride:glass-cursor';
const FINISHES = ['clear', 'ice', 'steel', 'ink'];
const SIZES: Record<string, number> = { small: 20, medium: 30, large: 42 };
const PRESSABLE = 'a, button, [role="button"], [role="tab"], [role="slider"], label, summary, [data-grow-card]';
const TYPING = 'input:not([type="checkbox"], [type="radio"], [type="range"]), textarea, select, [contenteditable="true"]';
const OWN_CURSOR = '.wall--show.is-live .wall__board';
const WRAP_W = 340; // px, anything wider than this keeps a bead rather than being wrapped
const WRAP_H = 96;
const PAD = 5; // px, the room the capsule leaves round what it wraps
const SPRING = 0.24;
const STRETCH = 0.012; // how much it stretches per pixel of speed
const MAX_STRETCH = 0.42;

const load = (): Choice => {
  const start: Choice = { finish: 'clear', size: 'medium', ripple: true, on: true };
  try {
    return { ...start, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return start;
  }
};
const save = (c: Choice) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* no storage here: it lasts for this page */
  }
};

export function initCursorBuddy() {
  const bead = document.querySelector<HTMLElement>('[data-bead]');
  const point = document.querySelector<HTMLElement>('[data-bead-point]');
  const pick = document.querySelector<HTMLElement>('[data-bead-pick]');
  if (!bead || !point || !pick || bead.dataset.ready) return;
  bead.dataset.ready = 'true';
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const html = document.documentElement;
  const mini = pick.querySelector<HTMLElement>('[data-bead-mini]');
  const panel = pick.querySelector<HTMLElement>('[data-bead-panel]');
  const open = pick.querySelector<HTMLButtonElement>('[data-bead-open]');
  const ripple = pick.querySelector<HTMLButtonElement>('[data-bead-ripple]');
  const off = pick.querySelector<HTMLButtonElement>('[data-bead-off]');
  const finishes = [...pick.querySelectorAll<HTMLButtonElement>('[data-bead-set-finish]')];
  const sizes = [...pick.querySelectorAll<HTMLButtonElement>('[data-bead-set-size]')];
  const swatches = [...pick.querySelectorAll<HTMLElement>('[data-swatch]')];
  const choice = load();
  let size = SIZES.medium;

  /* ---------- What it looks like ---------- */
  const apply = () => {
    const finish = FINISHES.includes(choice.finish) ? choice.finish : 'clear';
    const sized = SIZES[choice.size] ? choice.size : 'medium';
    size = SIZES[sized];
    bead.dataset.finish = finish;
    if (mini) mini.dataset.finish = finish;
    swatches.forEach((s) => (s.dataset.finish = finish));
    finishes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.beadSetFinish === finish)));
    sizes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.beadSetSize === sized)));
    ripple?.setAttribute('aria-pressed', String(choice.ripple));
    off?.setAttribute('aria-pressed', String(!choice.on));
    html.classList.toggle('has-bead', choice.on && mouse.matches);
    run();
  };
  const choose = (change: Partial<Choice>) => {
    Object.assign(choice, change);
    save(choice);
    apply();
  };
  finishes.forEach((b) => b.addEventListener('click', () => choose({ finish: b.dataset.beadSetFinish ?? 'clear', on: true })));
  sizes.forEach((b) => b.addEventListener('click', () => choose({ size: b.dataset.beadSetSize ?? 'medium', on: true })));
  ripple?.addEventListener('click', () => choose({ ripple: !choice.ripple }));
  off?.addEventListener('click', () => choose({ on: !choice.on }));

  /* ---------- The picker ---------- */
  const setOpen = (show: boolean) => {
    if (panel) panel.hidden = !show;
    open?.setAttribute('aria-expanded', String(show));
  };
  open?.addEventListener('click', () => setOpen(!!panel?.hidden));
  document.addEventListener('pointerdown', (e) => {
    if (panel && !panel.hidden && !pick.contains(e.target as Node)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel && !panel.hidden) {
      setOpen(false);
      open?.focus({ preventScroll: true });
    }
  });

  /* ---------- Following the pointer ---------- */
  let x = -100;
  let y = -100;
  const now = { cx: -100, cy: -100, w: size, h: size, r: size / 2 };
  let vx = 0;
  let vy = 0;
  let over: HTMLElement | null = null;
  let down = false;
  let raf = 0;
  let placed = false;

  const frame = () => {
    raf = 0;
    let goal = { cx: x, cy: y, w: size, h: size, r: size / 2 };
    let wrapped = false;
    if (over && over.isConnected) {
      const b = over.getBoundingClientRect();
      if (b.width <= WRAP_W && b.height <= WRAP_H && b.width > 0) {
        wrapped = true;
        const w = b.width + PAD * 2;
        const h = b.height + PAD * 2;
        const radius = parseFloat(getComputedStyle(over).borderTopLeftRadius) || 8;
        goal = { cx: b.left + b.width / 2, cy: b.top + b.height / 2, w, h, r: Math.min(radius + PAD, h / 2) };
      } else {
        goal.w = goal.h = size * 1.35;
        goal.r = goal.w / 2;
      }
    }
    bead.classList.toggle('is-over', wrapped);
    point.classList.toggle('is-over', wrapped);
    if (down) {
      goal.w *= 0.9;
      goal.h *= 0.9;
    }
    const k = calm.matches || !placed ? 1 : SPRING;
    placed = true;
    const dx = (goal.cx - now.cx) * k;
    const dy = (goal.cy - now.cy) * k;
    now.cx += dx;
    now.cy += dy;
    now.w += (goal.w - now.w) * k;
    now.h += (goal.h - now.h) * k;
    now.r += (goal.r - now.r) * k;
    vx += (dx - vx) * 0.35;
    vy += (dy - vy) * 0.35;
    // It stretches along its way and narrows across it, as a drop does. Not while it's a capsule.
    const speed = Math.hypot(vx, vy);
    const pull = wrapped || calm.matches ? 0 : Math.min(MAX_STRETCH, speed * STRETCH);
    const angle = Math.atan2(vy, vx);
    bead.style.width = `${now.w.toFixed(1)}px`;
    bead.style.height = `${now.h.toFixed(1)}px`;
    bead.style.setProperty('--r', `${now.r.toFixed(1)}px`);
    bead.style.transform = `translate3d(${(now.cx - now.w / 2).toFixed(1)}px, ${(now.cy - now.h / 2).toFixed(1)}px, 0) rotate(${angle.toFixed(3)}rad) scale(${(1 + pull).toFixed(3)}, ${(1 - pull * 0.7).toFixed(3)}) rotate(${(-angle).toFixed(3)}rad)`;
    point.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const moving = Math.abs(goal.cx - now.cx) + Math.abs(goal.cy - now.cy) + Math.abs(goal.w - now.w) + Math.abs(goal.h - now.h) > 0.2 || speed > 0.04;
    // Over something it keeps checking, since that thing can move as the page scrolls.
    if (moving || over) raf = requestAnimationFrame(frame);
  };
  function run() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  const setAway = (gone: boolean) => {
    bead.classList.toggle('is-away', gone);
    point.classList.toggle('is-away', gone);
  };
  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      const t = e.target as Element;
      const away = !!t.closest?.(`${TYPING}, ${OWN_CURSOR}`);
      setAway(away);
      over = away ? null : (t.closest?.<HTMLElement>(PRESSABLE) ?? null);
      run();
    },
    { passive: true },
  );
  document.addEventListener('pointerdown', (e) => {
    down = true;
    run();
    if (e.pointerType !== 'mouse' || !choice.ripple || !choice.on || calm.matches || !mouse.matches) return;
    const s = document.createElement('span');
    s.className = 'bead-ripple';
    document.body.append(s);
    s.animate(
      [
        { transform: `translate(${e.clientX}px, ${e.clientY}px) scale(1)`, opacity: 0.9 },
        { transform: `translate(${e.clientX}px, ${e.clientY}px) scale(5.5)`, opacity: 0 },
      ],
      { duration: 620, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    ).finished.finally(() => s.remove());
  });
  window.addEventListener('pointerup', () => {
    down = false;
    run();
  });
  html.addEventListener('pointerleave', () => setAway(true));
  html.addEventListener('pointerenter', () => setAway(false));

  /* ---------- On a screen with a mouse only ---------- */
  const fit = () => {
    pick.hidden = !mouse.matches;
    if (!mouse.matches) setOpen(false);
    apply();
  };
  mouse.addEventListener('change', fit);
  fit();
}
