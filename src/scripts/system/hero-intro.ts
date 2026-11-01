// Desktop intro for the homepage hero (components/home/HeroMontage.astro). The inline script in
// the hero adds .is-intro-playing (and html.intro-lock) before first paint when the intro should
// play (desktop, motion allowed), on every visit; this module plays it, then lets the hero reveal
// over the montage. While it plays it covers the whole screen and page scrolling stays locked
// (smooth scroll paused too). The intro doubles as a loading screen: once it can play to the
// end, the montage loads behind it, so it starts the moment the intro ends. `hero:intro` tells
// the montage (src/scripts/system/media.ts) to wait, load or start.
// The button skips the intro while it plays and replays it afterwards (WCAG 2.2.2). Keyboard
// focus moving anywhere else, a slow connection or a blocked autoplay all go straight to the page.

type Lenis = { stop(): void; start(): void };
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;

function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle('intro-lock', locked);
  if (locked) lenis()?.stop();
  else lenis()?.start();
}

export function initHeroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero-intro]');
  if (!hero || hero.dataset.introReady) return;
  hero.dataset.introReady = 'true';
  const video = hero.querySelector<HTMLVideoElement>('[data-intro-video]');
  const button = hero.querySelector<HTMLButtonElement>('[data-intro-toggle]');
  if (!video || !button) return;
  const playing = () => hero.classList.contains('is-intro-playing');
  const announce = () => hero.dispatchEvent(new CustomEvent('hero:intro', { bubbles: true }));
  let timer = 0;

  // Sources are added on first play, so phones never download the intro.
  const load = () => {
    if (video.querySelector('source')) return;
    const sources: [string | undefined, string][] = [
      [video.dataset.webm, 'video/webm'],
      [video.dataset.mp4, 'video/mp4'],
    ];
    for (const [src, type] of sources) {
      if (!src) continue;
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      video.append(source);
    }
    if (!video.poster && video.dataset.poster) video.poster = video.dataset.poster;
    video.load();
  };

  const finish = () => {
    clearTimeout(timer);
    video.pause();
    hero.classList.remove('is-intro-playing');
    lockScroll(false);
    button.textContent = 'Replay intro';
    announce();
  };

  const play = () => {
    load();
    video.currentTime = 0;
    hero.classList.add('is-intro-playing');
    lockScroll(true);
    announce();
    button.textContent = 'Skip intro';
    clearTimeout(timer);
    timer = window.setTimeout(finish, 4000); // still not playing: show the hero instead
    video.play().catch(finish);
  };

  // The intro has the connection to itself until it can play through; then the montage loads.
  const buffered = () => {
    if (hero.classList.contains('is-intro-buffered')) return;
    hero.classList.add('is-intro-buffered');
    announce();
  };
  video.addEventListener('canplaythrough', buffered);

  // Once it plays, end on time even if it stalls part-way.
  video.addEventListener('playing', () => {
    window.setTimeout(buffered, 1500); // in case canplaythrough never fires
    clearTimeout(timer);
    const left = (video.duration || 6.2) - video.currentTime;
    timer = window.setTimeout(finish, (left + 2) * 1000);
  });
  video.addEventListener('ended', finish);
  button.addEventListener('click', () => (playing() ? finish() : play()));
  document.addEventListener('focusin', (e) => {
    if (playing() && e.target !== button) finish();
  });
  window.matchMedia('(max-width: 767px)').addEventListener('change', (e) => {
    if (e.matches && playing()) finish();
  });

  if (playing()) play();
}
