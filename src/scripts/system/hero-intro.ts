// Opening for the homepage hero (components/home/HeroMontage.astro, IntroReveal.astro). The inline
// script in the hero adds .is-intro-playing (and html.intro-lock) before first paint whenever
// motion is allowed, on every visit and every device. This module waits for the lockup's fonts (at
// most 1.5s, so the wordmark never swaps font mid-animation), centres the mark for its entrance and
// starts the animation (.is-intro-run); when the progress line completes, the hero reveals over
// the montage. While it plays it covers the whole screen and page scrolling stays locked (smooth
// scroll paused too). The montage loads behind it from the start (.is-intro-buffered); `hero:intro`
// tells it (src/scripts/system/media.ts) to wait, load or start.
// The button skips the intro while it plays and replays it afterwards (WCAG 2.2.2). Keyboard focus
// moving anywhere else also goes straight to the page.

type Lenis = { stop(): void; start(): void };
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;

function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle('intro-lock', locked);
  if (locked) lenis()?.stop();
  else lenis()?.start();
}

const fontsReady = () =>
  Promise.race([
    Promise.all([document.fonts.load('850 1em "Archivo Variable"'), document.fonts.load('500 1em "IBM Plex Mono"')]),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]).catch(() => {});

export function initHeroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero-intro]');
  if (!hero || hero.dataset.introReady) return;
  hero.dataset.introReady = 'true';
  const lockup = hero.querySelector<HTMLElement>('[data-reveal-lockup]');
  const mark = hero.querySelector<SVGElement>('[data-reveal-mark]');
  const progress = hero.querySelector<HTMLElement>('[data-reveal-progress]');
  const button = hero.querySelector<HTMLButtonElement>('[data-intro-toggle]');
  if (!lockup || !mark || !progress || !button) return;
  const playing = () => hero.classList.contains('is-intro-playing');
  const announce = () => hero.dispatchEvent(new CustomEvent('hero:intro', { bubbles: true }));
  let run = 0; // each play gets a number, so a late font promise can't start an old one
  let safety = 0;

  // The mark comes together at the centre of the screen, then slides into the lockup.
  const centreMark = () => {
    const box = lockup.getBoundingClientRect();
    const size = mark.getBoundingClientRect().width;
    lockup.style.setProperty('--mark-shift', `${window.innerWidth / 2 - (box.left + size / 2)}px`);
  };

  const finish = () => {
    run++;
    clearTimeout(safety);
    hero.classList.remove('is-intro-playing');
    lockScroll(false);
    button.textContent = 'Replay intro';
    announce();
  };

  const play = async () => {
    const id = ++run;
    hero.classList.remove('is-intro-run');
    hero.classList.add('is-intro-playing', 'is-intro-buffered');
    lockScroll(true);
    announce();
    button.textContent = 'Skip intro';
    await fontsReady();
    if (id !== run || !playing()) return;
    centreMark();
    void hero.offsetWidth; // restart the CSS animations on a replay
    hero.classList.add('is-intro-run');
    // If the animation can't run for some reason, never leave the page covered.
    const seconds = parseFloat(getComputedStyle(progress).animationDuration) || 8;
    clearTimeout(safety);
    safety = window.setTimeout(() => id === run && playing() && finish(), (seconds + 2) * 1000);
  };

  progress.addEventListener('animationend', () => {
    if (playing()) finish();
  });
  button.addEventListener('click', () => (playing() ? finish() : play()));
  document.addEventListener('focusin', (e) => {
    if (playing() && e.target !== button) finish();
  });
  window.addEventListener('resize', () => {
    if (playing()) centreMark();
  });

  if (playing()) play();
}
