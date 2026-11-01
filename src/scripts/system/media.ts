// Video behaviour for core/Media.astro.
// - data-video="auto": plays muted while on screen; the toggle button pauses/resumes and the
//   visitor's choice is respected. Under reduced motion videos start paused.
// - data-video="hover": plays while the nearest [data-media-hover] is hovered (fine pointers only).
// - Inside a hero whose intro is playing (.is-intro-playing), auto videos wait; the hero sends
//   `hero:intro` when the intro starts or ends (src/scripts/system/hero-intro.ts).

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const visible = (v: HTMLVideoElement) => v.offsetParent !== null;

function setPaused(wrapper: HTMLElement, paused: boolean) {
  wrapper.classList.toggle('is-paused', paused);
  const btn = wrapper.querySelector<HTMLButtonElement>('[data-video-toggle]');
  btn?.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
}

function initAuto(wrapper: HTMLElement) {
  const videos = [...wrapper.querySelectorAll<HTMLVideoElement>('video[data-video="auto"]')];
  let userPaused = reduced();
  let inView = false;
  const active = () => videos.find(visible);
  const held = () => !!wrapper.closest('.is-intro-playing');

  const sync = () => {
    const v = active();
    videos.forEach((other) => other !== v && other.pause());
    if (!v) return;
    if (inView && !userPaused && !held()) {
      if (v.preload === 'none') v.preload = 'auto';
      v.play().catch(() => setPaused(wrapper, true));
      setPaused(wrapper, false);
    } else {
      v.pause();
      setPaused(wrapper, userPaused);
    }
  };

  wrapper.querySelector('[data-video-toggle]')?.addEventListener('click', () => {
    userPaused = !userPaused;
    sync();
  });
  new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    sync();
  }, { threshold: 0.15 }).observe(wrapper);
  window.matchMedia('(max-width: 767px)').addEventListener('change', sync);
  wrapper.closest('[data-hero-intro]')?.addEventListener('hero:intro', sync);
  setPaused(wrapper, userPaused);
}

function initHover(video: HTMLVideoElement) {
  const host = video.closest<HTMLElement>('[data-media-hover]');
  if (!host || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  host.addEventListener('pointerenter', () => {
    if (reduced() || !visible(video)) return;
    if (video.preload === 'none') video.preload = 'auto';
    video.play().catch(() => {});
  });
  host.addEventListener('pointerleave', () => {
    video.pause();
    video.currentTime = 0;
  });
}

export function initMedia() {
  document.querySelectorAll<HTMLElement>('.media').forEach((wrapper) => {
    if (wrapper.dataset.mediaReady) return;
    wrapper.dataset.mediaReady = 'true';
    if (wrapper.querySelector('video[data-video="auto"]')) initAuto(wrapper);
    wrapper.querySelectorAll<HTMLVideoElement>('video[data-video="hover"]').forEach(initHover);
  });
}
