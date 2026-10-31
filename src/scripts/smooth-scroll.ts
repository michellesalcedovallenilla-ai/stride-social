import Lenis from 'lenis';

// Same feel as the live site (lerp 0.1, wheel 0.7). Touch keeps native scrolling.
export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.7, gestureOrientation: 'vertical' });
  (window as unknown as { lenis: Lenis }).lenis = lenis;
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}
