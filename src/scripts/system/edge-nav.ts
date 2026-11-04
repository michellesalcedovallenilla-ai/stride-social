// Behaviour for the site navigation: the radial scroll navigation on the left
// (components/global/EdgeNav.astro) and its expanded form, the glass menu panel that grows from
// the header's Menu button (components/global/SiteHeader.astro). Both share one active area and
// one way of moving between areas.
// - Home page: the scroll gives the active area (the last one whose section has been reached; only
//   ever one). The arc turns to it on a soft spring and always settles exactly on it, its label
//   resting level inside the glass capsule, which reshapes to the width of the label passing
//   through it. Crossing into a new area tints the screen faintly in its colours.
// - Choosing an area (arc or panel): the arc and the capsule head for it straight away; a soft
//   gradient wash in its colours covers the screen, the page moves there underneath, and the wash
//   fades away (elsewhere it covers the jump to the page). Meanwhile the scroll doesn't steer the
//   arc, and a new choice cancels the last one, so repeated clicks never fight.
// - Dragging the arc with the mouse (desktop): it follows the pointer, and on release settles on the
//   nearest area and goes there, as if chosen; let go where it started and it just springs back.
// - Menu: opens and closes the glass bar beside it; it also closes with Escape, a click outside
//   or a choice. Left/Right (or Up/Down) move between its areas.
// - Keyboard: focusing an area on the arc turns the arc to it; Up/Down/Home/End move between areas.
//   (Pointer focus doesn't: turning under a press would slide the label away before the click.)
// - Reduced motion: no wash or easing; the arc and the page jump.

type Lenis = { scrollTo(target: number, options?: { immediate?: boolean }): void };

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Where each area lives on the home page: Group is the hero and the three sides; Social, Talent and
// Education are what their cards open onto (components/home/Portals.astro). On desktop with
// motion each is reached at a marker placed so that the switch comes as its card finishes opening,
// and choosing it lands where it has; elsewhere at the chapter itself. Work, About, Contact and Our
// Sponsoring open their pages.
const portal = (key: string) => `.portals.is-live [data-nav-start="${key}"], .portals:not(.is-live) [data-chapter="${key}"]`;
const homeSections: Record<string, string> = {
  group: '.cover',
  social: portal('social'),
  talent: portal('talent'),
  education: portal('education'),
};

const STEP = 12; // degrees between areas on the arc
const DRAG_STEP = 75; // pixels of dragging per area, about the labels' spacing on the arc
const DRAG_START = 4; // pixels before a press counts as a drag rather than a click
const LINE = 0.3; // an area is reached when its top passes 30% of the way down the screen
// The arc's spring: settles in about a third of a second with the slightest overshoot (about 1%).
const STIFFNESS = 190;
const DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.82;

export function initEdgeNav() {
  const nav = document.querySelector<HTMLElement>('[data-radial]');
  if (!nav || nav.dataset.radialReady) return;
  nav.dataset.radialReady = 'true';
  const wash = document.querySelector<HTMLElement>('[data-wash]');
  const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
  const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const items = [...nav.querySelectorAll<HTMLAnchorElement>('[data-radial-item]')];
  const panelItems = panel ? [...panel.querySelectorAll<HTMLAnchorElement>('[data-menu-item]')] : [];
  const slots = items.map((a) => a.parentElement as HTMLElement);
  const home = nav.hasAttribute('data-home');
  const last = items.length - 1;
  const keyOf = (i: number) => items[i].dataset.radialItem ?? '';
  const docTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
  const sectionOf = (i: number) => {
    const selector = homeSections[keyOf(i)];
    return selector ? document.querySelector<HTMLElement>(selector) : null;
  };
  const own = Number(nav.dataset.current ?? 0); // this page's own area

  let target = own; // where the arc is heading (always a whole area)
  let shown = target; // where it is drawn
  let speed = 0;
  let focusIndex: number | null = null; // keyboard focus on the arc overrides the scroll
  let active = -1;
  let raf = 0;
  let then = 0; // the last frame's time
  let moving = false; // a chosen area is on its way: the scroll doesn't steer the arc meanwhile
  let dragging = false; // the pointer is turning the arc: neither the spring nor the scroll does
  let timers: number[] = [];

  // Each label's box, for the capsule.
  let widths: number[] = [];
  const measure = () => {
    widths = items.map((a) => a.offsetWidth);
    nav.style.setProperty('--glass-h', `${items[0]?.offsetHeight ?? 0}px`);
    draw();
  };

  const draw = () => {
    slots.forEach((slot, i) => {
      const d = i - shown;
      slot.style.setProperty('--a', `${(d * STEP).toFixed(2)}deg`);
      // Clear beside the active area, fading out two areas away.
      slot.style.setProperty('--o', Math.max(0, 1 - Math.abs(d) * 0.2 - d * d * 0.045).toFixed(3));
      slot.classList.toggle('is-far', Math.abs(d) > 2.6);
    });
    // The capsule takes the width of the label passing through it, so it reshapes as the arc turns.
    if (!widths.length) return;
    const lo = Math.max(0, Math.min(last, Math.floor(shown)));
    const hi = Math.min(last, lo + 1);
    const f = Math.max(0, Math.min(1, shown - lo));
    nav.style.setProperty('--glass-w', `${(widths[lo] + (widths[hi] - widths[lo]) * f).toFixed(1)}px`);
  };

  const setActive = (i: number) => {
    if (i === active) return;
    const before = active;
    active = i;
    [items, panelItems].forEach((list) =>
      list.forEach((a, j) => {
        a.classList.toggle('is-active', j === i);
        if (!home) return;
        if (j === i) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      }),
    );
    // A faint tint as the page crosses into a new chapter (not on the first reading).
    if (home && before !== -1 && wash && !reduced() && !dragging && !wash.classList.contains('is-on')) {
      wash.dataset.tone = keyOf(i);
      wash.classList.add('is-tint');
      window.setTimeout(() => wash.classList.remove('is-tint'), 520);
    }
  };

  // One spring step per frame (timed, so it runs the same at any frame rate), until it is at rest
  // exactly on the goal.
  const tick = (now: number) => {
    const goal = focusIndex ?? target;
    const dt = then ? Math.min(0.034, (now - then) / 1000) : 1 / 60;
    then = now;
    if (reduced()) {
      shown = goal;
      speed = 0;
    } else {
      speed += (STIFFNESS * (goal - shown) - DAMPING * speed) * dt;
      shown += speed * dt;
      if (Math.abs(goal - shown) < 0.0005 && Math.abs(speed) < 0.005) {
        shown = goal;
        speed = 0;
      }
    }
    draw();
    if (shown === goal) {
      raf = 0;
      then = 0;
    } else {
      raf = requestAnimationFrame(tick);
    }
  };
  const run = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const read = () => {
    if (!home || moving || dragging) return;
    const starts = items.map((_, i) => {
      const el = sectionOf(i);
      if (i === 0) return 0;
      return el ? docTop(el) - window.innerHeight * LINE : Infinity; // no place here: never reached
    });
    const y = window.scrollY;
    let i = 0;
    for (let j = 1; j <= last; j++) if (y >= starts[j]) i = j;
    target = i;
    setActive(i);
    run();
  };

  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      read();
    });
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    queue();
  }, { passive: true });
  window.addEventListener('load', queue);
  setActive(target);
  measure();
  document.fonts?.ready.then(measure);
  read();

  /* ---------- The menu panel ---------- */
  const isOpen = () => !!panel?.classList.contains('is-open');
  const setOpen = (open: boolean, returnFocus = true) => {
    if (!panel || open === isOpen()) return;
    panel.classList.toggle('is-open', open);
    panel.toggleAttribute('inert', !open);
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) (panelItems.find((a) => a.classList.contains('is-active')) ?? panelItems[0])?.focus({ preventScroll: true });
    else if (returnFocus && panel.contains(document.activeElement)) menuButton?.focus({ preventScroll: true });
  };
  menuButton?.addEventListener('click', () => setOpen(!isOpen()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });
  document.addEventListener('pointerdown', (e) => {
    const t = e.target as Node;
    if (isOpen() && !panel?.contains(t) && !menuButton?.contains(t)) setOpen(false, false);
  });
  panel?.addEventListener('keydown', (e) => {
    const i = panelItems.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    panelItems[Math.min(last, Math.max(0, next))].focus();
  });

  /* ---------- Choosing an area ---------- */
  // The chapter transition: wash in, move, wash out. Its timers are kept, so a new choice can
  // cancel one still under way.
  const transition = (key: string, move: () => void) => {
    if (!wash || reduced()) return move();
    wash.dataset.tone = key;
    wash.classList.remove('is-tint');
    wash.classList.add('is-on');
    timers.push(
      window.setTimeout(() => {
        move();
        timers.push(window.setTimeout(() => wash.classList.remove('is-on'), 140));
      }, 430),
    );
  };

  const go = (i: number, href: string) => {
    const key = keyOf(i);
    const el = home ? sectionOf(i) : null;
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    focusIndex = null;
    setOpen(false, false);
    // The arc and the capsule head for the choice straight away; the scroll waits until the page
    // is there, then takes over again.
    moving = true;
    target = i;
    setActive(i);
    run();
    const arrived = () => {
      moving = false;
      read();
    };
    if (home && el) {
      const y = i === 0 ? 0 : Math.max(0, docTop(el) - window.innerHeight * (LINE - 0.08));
      transition(key, () => {
        const lenis = (window as unknown as { lenis?: Lenis }).lenis;
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
        arrived();
      });
    } else if (!home && i === own) {
      transition(key, () => {
        window.scrollTo(0, 0);
        arrived();
      });
    } else {
      transition(key, () => location.assign(href));
    }
  };

  [items, panelItems].forEach((list) =>
    list.forEach((a, i) => {
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        a.blur();
        go(i, a.href);
      });
    }),
  );

  /* ---------- Dragging the arc ---------- */
  const nearest = (v: number) => Math.min(last, Math.max(0, Math.round(v)));
  let suppressClick = false; // the click that ends a drag isn't a choice
  nav.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || moving || !window.matchMedia('(min-width: 1024px)').matches) return;
    const startY = e.clientY;
    const from = shown;
    const startArea = target;
    const source = e.target as HTMLElement;
    let lastY = startY;
    let lastT = e.timeStamp;
    let velocity = 0; // areas per second
    suppressClick = false;

    const move = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.abs(ev.clientY - startY) < DRAG_START) return;
        dragging = true;
        suppressClick = true;
        source.setPointerCapture(ev.pointerId);
        document.documentElement.classList.add('is-radial-dragging');
        cancelAnimationFrame(raf);
        raf = 0;
        then = 0;
        speed = 0;
      }
      // Pulling down brings the area above to the capsule. Past either end it gives, but only a little.
      const pulled = from - (ev.clientY - startY) / DRAG_STEP;
      shown = pulled < 0 ? pulled * 0.25 : pulled > last ? last + (pulled - last) * 0.25 : pulled;
      const dt = ev.timeStamp - lastT;
      if (dt > 0) velocity = (-(ev.clientY - lastY) / DRAG_STEP / dt) * 1000;
      lastY = ev.clientY;
      lastT = ev.timeStamp;
      setActive(nearest(shown));
      draw();
    };
    const end = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      document.removeEventListener('selectstart', noSelect);
      if (!dragging) return;
      dragging = false;
      document.documentElement.classList.remove('is-radial-dragging');
      // A pause before letting go means no flick.
      if (ev.timeStamp - lastT > 80) velocity = 0;
      velocity = Math.max(-8, Math.min(8, velocity));
      speed = velocity;
      const chosen = ev.type === 'pointerup' ? nearest(shown + velocity * 0.12) : startArea;
      if (chosen === startArea) {
        target = startArea;
        setActive(startArea);
        run();
        queue();
      } else {
        go(chosen, items[chosen].href);
      }
      // A click only follows if the press and release share an element; otherwise don't eat the next.
      window.setTimeout(() => (suppressClick = false), 0);
    };
    const noSelect = (ev: Event) => ev.preventDefault();
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    document.addEventListener('selectstart', noSelect);
  });
  nav.addEventListener('dragstart', (e) => e.preventDefault()); // the browser's own dragging of links
  nav.addEventListener('click', (e) => {
    if (!suppressClick) return;
    suppressClick = false;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  // Keyboard focus turns the arc to the focused area; a pointer press doesn't (the label would
  // slide out from under it before the click lands).
  items.forEach((a, i) => {
    a.addEventListener('focus', () => {
      if (!a.matches(':focus-visible')) return;
      focusIndex = i;
      run();
    });
    a.addEventListener('blur', () => {
      if (focusIndex !== i) return;
      focusIndex = null;
      run();
    });
  });

  nav.addEventListener('keydown', (e) => {
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    const next = { ArrowDown: i + 1, ArrowUp: i - 1, ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    items[Math.min(last, Math.max(0, next))].focus();
  });

  // Back from another page (bfcache): never leave the wash or the panel up, and show this page's
  // own area again, already in place.
  window.addEventListener('pageshow', (e) => {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    moving = false;
    wash?.classList.remove('is-on', 'is-tint');
    setOpen(false, false);
    if (!e.persisted) return;
    focusIndex = null;
    if (home) {
      read();
    } else {
      target = own;
      setActive(own);
    }
    shown = target;
    speed = 0;
    draw();
  });
}
