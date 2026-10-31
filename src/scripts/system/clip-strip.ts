// Several muted clips behind one pause control (Social hero). Clips play only while the section
// is on screen and only if they are displayed (phones show one). The visitor's pause choice is
// kept; under reduced motion everything starts paused (WCAG 2.2.2).

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initStrip(root: HTMLElement) {
  const videos = [...root.querySelectorAll<HTMLVideoElement>('video')];
  const toggle = root.querySelector<HTMLButtonElement>('[data-strip-toggle]');
  let userPaused = reduced();
  let inView = false;

  const render = (paused: boolean) => {
    root.classList.toggle('is-paused', paused);
    toggle?.setAttribute('aria-label', paused ? 'Play background videos' : 'Pause background videos');
  };

  const sync = () => {
    const play = inView && !userPaused;
    for (const v of videos) {
      if (play && v.offsetParent !== null) {
        if (v.preload === 'none') v.preload = 'auto';
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    }
    render(userPaused);
  };

  toggle?.addEventListener('click', () => {
    userPaused = !userPaused;
    sync();
  });
  new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    sync();
  }, { threshold: 0.15 }).observe(root);
  window.matchMedia('(max-width: 767px)').addEventListener('change', sync);
  render(userPaused);
}

export function initClipStrips() {
  document.querySelectorAll<HTMLElement>('[data-clip-strip]').forEach((root) => {
    if (root.dataset.stripReady) return;
    root.dataset.stripReady = 'true';
    initStrip(root);
  });
}
