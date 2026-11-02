// Pointer motion for the Stride motion language (src/styles/system/motion.css): a subtle parallax
// for [data-parallax] elements and a magnetic lean for [data-magnetic] ones. Fine pointers only,
// and nothing at all under reduced motion. Both use the CSS `translate` property, so they compose
// with any transform a reveal or hover already applies.

const allowed = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** [data-parallax="12"]: drifts up to 12px against the pointer (eased; only while on screen). */
export function initParallax() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
  if (!els.length || !allowed()) return;
  const onScreen = new Set<HTMLElement>();
  const io = new IntersectionObserver((entries) =>
    entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target as HTMLElement) : onScreen.delete(e.target as HTMLElement))),
  );
  els.forEach((el) => io.observe(el));

  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  const frame = () => {
    raf = 0;
    x += (tx - x) * 0.07;
    y += (ty - y) * 0.07;
    onScreen.forEach((el) => {
      const s = parseFloat(el.dataset.parallax ?? '') || 10;
      el.style.translate = `${(-x * s).toFixed(2)}px ${(-y * s * 0.6).toFixed(2)}px`;
    });
    if (Math.abs(tx - x) > 0.0005 || Math.abs(ty - y) > 0.0005) raf = requestAnimationFrame(frame);
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true },
  );
}

/** [data-magnetic="0.3"]: leans towards the pointer by that share of the offset while hovered. */
export function initMagnetic() {
  if (!allowed()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    if (el.dataset.magneticReady) return;
    el.dataset.magneticReady = 'true';
    const pull = parseFloat(el.dataset.magnetic ?? '') || 0.25;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = Math.max(-14, Math.min(14, (e.clientX - (r.left + r.width / 2)) * pull));
      const dy = Math.max(-10, Math.min(10, (e.clientY - (r.top + r.height / 2)) * pull));
      el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
    el.addEventListener('pointerleave', () => (el.style.translate = ''));
  });
}
