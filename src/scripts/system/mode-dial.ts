// Behaviour for global/ModeDial.astro, the camera mode dial.
// - Turning: pointer drag (mouse or finger, true rotary drag around the centre), mouse wheel or
//   trackpad, and arrow keys. Release carries momentum, then a light spring snaps exactly onto
//   the nearest mode; every mode that passes the marker gives a small "click" (the marker nudges).
// - Dock (desktop): resting on a new mode after a pointer or wheel turn fills the marker for a
//   moment and then opens that mode's page; turning again cancels. Clicking a mode turns to it
//   and opens it. Arrow keys only select (Enter opens), so keyboard focus never changes the page
//   by surprise. The dock tucks to its rim and marker and opens on hover or focus.
// - Menu: turning previews the mode (the menu shows its pages via the `dial:change` event);
//   tapping the selected mode opens it.
// - Each page's dial starts on the mode of the page you came from and turns to its own, so a
//   change of page reads as the dial switching modes. Reduced motion jumps straight there.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE = 'stride:dial-mode';

/** Leave the page with the shared exit (content shifts and blurs), then navigate. */
export function leaveTo(href: string) {
  if (reduced()) return location.assign(href);
  document.documentElement.classList.add('is-leaving');
  window.setTimeout(() => location.assign(href), 200);
}

function initDial(nav: HTMLElement) {
  const variant = nav.dataset.dial as 'dock' | 'menu';
  const disc = nav.querySelector<HTMLElement>('[data-dial-disc]')!;
  const labels = [...nav.querySelectorAll<HTMLAnchorElement>('[data-dial-mode]')];
  const status = nav.querySelector<HTMLElement>('[data-dial-status]');
  const count = labels.length;
  const current = Number(nav.dataset.current ?? 0);
  const step = parseFloat(getComputedStyle(nav).getPropertyValue('--step')) || 26;
  const min = -(count - 1) * step;

  let angle = -current * step;
  let velocity = 0;
  let target: number | null = null;
  let selected = current;
  let raf = 0;
  let lastInput: 'pointer' | 'wheel' | 'key' | 'arrive' | null = null;
  let commitTimer = 0;
  let commitStart = 0;

  const indexOf = (a: number) => Math.min(count - 1, Math.max(0, Math.round(-a / step)));

  const paint = () => nav.style.setProperty('--angle', `${angle}deg`);

  const tick = () => {
    if (reduced()) return;
    nav.classList.remove('is-ticking');
    void nav.offsetWidth;
    nav.classList.add('is-ticking');
    window.setTimeout(() => nav.classList.remove('is-ticking'), 90);
  };

  const select = (i: number, quiet = false) => {
    if (i === selected && !quiet) return;
    selected = i;
    labels.forEach((l, n) => {
      l.classList.toggle('is-selected', n === i);
      l.tabIndex = n === i ? 0 : -1;
    });
    nav.dispatchEvent(new CustomEvent('dial:change', { bubbles: true, detail: { index: i, key: labels[i].dataset.modeKey } }));
    if (!quiet) tick();
  };

  /* ---------- Commit (dock): rest on a new mode, then open it ---------- */
  const cancelCommit = () => {
    window.clearTimeout(commitTimer);
    commitStart = 0;
    nav.style.removeProperty('--commit');
  };

  const commit = (delay: number) => {
    cancelCommit();
    if (selected === current) return;
    const href = labels[selected].href;
    commitStart = performance.now();
    const fill = (now: number) => {
      if (!commitStart) return;
      nav.style.setProperty('--commit', String(Math.min(1, (now - commitStart) / delay)));
      if (now - commitStart < delay) requestAnimationFrame(fill);
    };
    if (!reduced()) requestAnimationFrame(fill);
    commitTimer = window.setTimeout(() => leaveTo(href), delay);
  };

  /* ---------- Motion loop: momentum, then a spring onto the target mode ---------- */
  const settle = () => {
    target = null;
    velocity = 0;
    angle = -selected * step;
    paint();
    const label = labels[selected].textContent ?? '';
    if (status) status.textContent = `${label} selected`;
    if (variant === 'dock' && (lastInput === 'pointer' || lastInput === 'wheel')) commit(650);
  };

  const loop = () => {
    raf = 0;
    if (target === null) {
      // Free spin after a fling: friction until slow, then pick the nearest mode.
      velocity *= 0.9;
      angle += velocity;
      if (angle > 14 || angle < min - 14) velocity *= 0.5;
      if (Math.abs(velocity) < 0.35) target = -indexOf(angle) * step;
    } else {
      // Slightly under-damped: a hint of overshoot, like a detent seating.
      velocity = velocity * 0.68 + (target - angle) * 0.16;
      angle += velocity;
      if (Math.abs(target - angle) < 0.05 && Math.abs(velocity) < 0.05) {
        paint();
        select(indexOf(target));
        return settle();
      }
    }
    paint();
    select(indexOf(angle));
    raf = requestAnimationFrame(loop);
  };

  const run = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const turnTo = (i: number, input: typeof lastInput) => {
    lastInput = input;
    cancelCommit();
    i = Math.min(count - 1, Math.max(0, i));
    if (reduced()) {
      angle = -i * step;
      paint();
      select(i);
      return settle();
    }
    target = -i * step;
    run();
  };

  /* ---------- Pointer drag (mouse and touch) ---------- */
  let dragging = false;
  let moved = 0;
  let lastPointer = 0;
  let lastTime = 0;
  let suppressClick = false;

  const pointerAngle = (e: PointerEvent) => {
    const r = disc.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  disc.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = 0;
    suppressClick = false;
    lastPointer = pointerAngle(e);
    lastTime = performance.now();
    velocity = 0;
    target = null;
    cancelAnimationFrame(raf);
    raf = 0;
    cancelCommit();
    try {
      disc.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer is already gone */
    }
    nav.classList.add('is-dragging');
  });

  disc.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const a = pointerAngle(e);
    let delta = a - lastPointer;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastPointer = a;
    const now = performance.now();
    const dt = Math.max(1, now - lastTime);
    lastTime = now;
    moved += Math.abs(delta);
    // Resist past the first and last modes.
    const out = angle > 0 || angle < min;
    angle += out ? delta * 0.35 : delta;
    velocity = velocity * 0.6 + (delta / dt) * 16 * 0.4;
    paint();
    select(indexOf(angle));
  });

  const release = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    nav.classList.remove('is-dragging');
    if (disc.hasPointerCapture(e.pointerId)) disc.releasePointerCapture(e.pointerId);
    if (moved < 3) return; // a tap: the label's click handler decides
    suppressClick = true;
    lastInput = 'pointer';
    if (reduced()) return turnTo(indexOf(angle), 'pointer');
    target = null;
    run();
  };
  disc.addEventListener('pointerup', release);
  disc.addEventListener('pointercancel', release);

  /* ---------- Wheel and trackpad ---------- */
  let wheelTimer = 0;
  nav.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      cancelCommit();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (e.deltaMode !== 0 || Math.abs(d) >= 40) {
        // A mouse-wheel notch moves exactly one mode.
        return turnTo((target === null ? selected : indexOf(target)) + Math.sign(d), 'wheel');
      }
      // Trackpads scroll in small steps: turn continuously, snap once they stop.
      lastInput = 'wheel';
      target = null;
      velocity = 0;
      angle = Math.min(10, Math.max(min - 10, angle - d * 0.3));
      paint();
      select(indexOf(angle));
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => turnTo(indexOf(angle), 'wheel'), 120);
    },
    { passive: false },
  );

  /* ---------- Clicks and keys ---------- */
  labels.forEach((label, i) => {
    label.addEventListener('click', (e) => {
      if (suppressClick) {
        e.preventDefault();
        suppressClick = false;
        return;
      }
      if (variant === 'menu') {
        // The selected mode opens; any other turns the dial to it first.
        if (i === selected) return;
        e.preventDefault();
        turnTo(i, 'key');
        label.focus({ preventScroll: true });
        return;
      }
      if (i === current) return;
      e.preventDefault();
      turnTo(i, 'arrive');
      window.setTimeout(() => leaveTo(label.href), reduced() ? 0 : 380);
    });
  });

  nav.addEventListener('keydown', (e) => {
    const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    let i: number | null = next !== undefined ? selected + next : null;
    if (e.key === 'Home') i = 0;
    if (e.key === 'End') i = count - 1;
    if (i === null) return;
    e.preventDefault();
    i = Math.min(count - 1, Math.max(0, i));
    turnTo(i, 'key');
    labels[i].focus({ preventScroll: true });
  });

  /* ---------- Dock: tuck while reading ---------- */
  // Open at the top of a page with a full-bleed hero; tucked to its rim everywhere else (CSS
  // opens it again on hover or keyboard focus).
  if (variant === 'dock') {
    const openAtTop = nav.hasAttribute('data-open-at-top');
    const tuck = () => nav.classList.toggle('is-tucked', !(openAtTop && window.scrollY <= 120));
    window.addEventListener('scroll', tuck, { passive: true });
    tuck();
  }

  /* ---------- Arrive: turn from the previous page's mode (dock only) ---------- */
  select(current, true);
  let from: number | null = null;
  if (variant === 'dock') {
    try {
      const stored = sessionStorage.getItem(STORE);
      if (stored !== null) from = Number(stored);
      sessionStorage.setItem(STORE, String(current));
    } catch {
      /* storage unavailable: start on the current mode */
    }
  }
  if (from !== null && from !== current && from >= 0 && from < count && !reduced()) {
    angle = -from * step;
    paint();
    window.setTimeout(() => turnTo(current, 'arrive'), 120);
  } else {
    paint();
  }
}

export function initModeDials() {
  document.querySelectorAll<HTMLElement>('[data-dial]').forEach((nav) => {
    if (nav.dataset.dialReady) return;
    nav.dataset.dialReady = 'true';
    initDial(nav);
  });
  // Coming back through the history cache: never stay on the exit state.
  window.addEventListener('pageshow', () => document.documentElement.classList.remove('is-leaving'));
}
