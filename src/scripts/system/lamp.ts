// Behaviour for talent/StageLamp.astro: the light rests on the front card with a slight sway and follows the
// pointer with a little weight, swinging no further than a real one would. Its pool and the dark around it land
// where it points. Only runs while it's on screen.
const SOURCE = -220; // px, as in the component: where the light comes from, above the screen
const MAX = (40 * Math.PI) / 180; // how far it swings either way
const EASE = 0.085; // how quickly it catches up with where it's aimed

export function initLamps() {
  document.querySelectorAll<HTMLElement>('[data-lamp]').forEach((lamp) => {
    if (lamp.dataset.lampReady) return;
    lamp.dataset.lampReady = 'true';
    const pin = lamp.parentElement;
    const arm = lamp.querySelector<HTMLElement>('[data-lamp-arm]');
    const pool = lamp.querySelector<HTMLElement>('[data-lamp-pool]');
    const dim = lamp.querySelector<HTMLElement>('[data-lamp-dim]');
    if (!pin || !arm || !pool || !dim) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let hx = 0; // the source, across the screen
    let pointer: { x: number; y: number } | null = null;
    const aim = { x: 0, y: 0 };
    let raf = 0;
    let visible = false;

    // Where it rests: on the front card, about where a face is.
    const rest = () => {
      const card = pin.querySelector('.ccard.is-active');
      const box = pin.getBoundingClientRect();
      if (!card) return { x: hx, y: box.height * 0.5 };
      const r = card.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height * 0.36 - box.top };
    };
    // It comes from above the front card.
    const hang = () => {
      const card = pin.querySelector('.ccard.is-active');
      if (!card) return;
      const r = card.getBoundingClientRect();
      hx = r.left + r.width / 2 - pin.getBoundingClientRect().left;
      lamp.style.setProperty('--lamp-x', `${hx.toFixed(1)}px`);
    };

    const draw = (x: number, y: number) => {
      const down = Math.max(240, y - SOURCE);
      const angle = Math.max(-MAX, Math.min(MAX, Math.atan2(x - hx, down)));
      // Where the beam lands at that angle: at the height aimed for.
      const landX = hx + Math.tan(angle) * down;
      const landY = SOURCE + down;
      arm.style.transform = `rotate(${(-angle * 180) / Math.PI}deg)`;
      // Further off to the side, the pool stretches, as light does on a slant.
      const stretch = 1 + Math.abs(Math.sin(angle)) * 0.45;
      pool.style.transform = `translate(${landX.toFixed(1)}px, ${landY.toFixed(1)}px) scaleX(${stretch.toFixed(3)})`;
      dim.style.transform = `translate(${landX.toFixed(1)}px, ${landY.toFixed(1)}px)`;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const goal = pointer ?? rest();
      // At rest it drifts, very slightly, as a hanging light does.
      const sway = pointer ? 0 : Math.sin(now / 1700) * 9;
      aim.x += (goal.x + sway - aim.x) * EASE;
      aim.y += (goal.y - aim.y) * EASE;
      draw(aim.x, aim.y);
      raf = requestAnimationFrame(frame);
    };
    const run = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(frame);
    };
    const settle = () => {
      hang();
      const r = rest();
      aim.x = r.x;
      aim.y = r.y;
      draw(aim.x, aim.y);
    };

    pin.addEventListener('pointermove', (e) => {
      const box = pin.getBoundingClientRect();
      pointer = { x: e.clientX - box.left, y: e.clientY - box.top };
      if (reduced) draw(pointer.x, pointer.y);
    });
    pin.addEventListener('pointerleave', () => {
      pointer = null;
      if (reduced) settle();
    });
    window.addEventListener('resize', settle, { passive: true });
    document.fonts?.ready.then(settle);
    new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) run();
    }).observe(pin);
    settle();
    // The cards settle a moment after loading.
    window.setTimeout(settle, 900);
  });
}
