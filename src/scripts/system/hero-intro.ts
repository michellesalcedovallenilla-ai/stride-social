// Desktop intro for the homepage hero (components/home/HeroMontage.astro). The inline script in
// the hero adds .is-intro-playing before first paint when the intro should play (desktop, motion
// allowed), on every visit; this module plays it, then lets the hero reveal over the montage.
// `hero:intro` tells the montage (src/scripts/system/media.ts) to wait or start.
// The button skips the intro while it plays and replays it afterwards (WCAG 2.2.2). Keyboard
// focus entering the hero, a slow connection or a blocked autoplay all go straight to the hero.

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
    button.textContent = 'Replay intro';
    announce();
  };

  const play = () => {
    load();
    video.currentTime = 0;
    hero.classList.add('is-intro-playing');
    announce();
    button.textContent = 'Skip intro';
    clearTimeout(timer);
    timer = window.setTimeout(finish, 4000); // still not playing: show the hero instead
    video.play().catch(finish);
  };

  // Once it plays, end on time even if it stalls part-way.
  video.addEventListener('playing', () => {
    clearTimeout(timer);
    const left = (video.duration || 6.2) - video.currentTime;
    timer = window.setTimeout(finish, (left + 2) * 1000);
  });
  video.addEventListener('ended', finish);
  button.addEventListener('click', () => (playing() ? finish() : play()));
  hero.querySelector('.hero__content')?.addEventListener('focusin', () => {
    if (playing()) finish();
  });
  window.matchMedia('(max-width: 767px)').addEventListener('change', (e) => {
    if (e.matches && playing()) finish();
  });

  if (playing()) play();
}
