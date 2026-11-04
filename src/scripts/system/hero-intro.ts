// Opening for the homepage hero (components/home/CoverHero.astro, IntroReveal.astro). The inline
// script in the hero adds .is-intro-playing (and html.intro-lock) before first paint whenever
// motion is allowed, on phones and tablets (desktops play the cinematic entrance instead,
// src/scripts/system/hero-entrance.ts). This module waits for the lockup's fonts (at
// most 1.5s, so the wordmark never swaps font mid-animation), centres the mark for its entrance and
// starts the animation (.is-intro-run); when the progress line completes, it fades to the hero and
// its showreel. While it plays it covers the whole screen and page scrolling stays locked (smooth
// scroll paused too). The reel loads behind it from the start (.is-intro-buffered); `hero:intro`
// tells it (src/scripts/system/media.ts) to wait, load or start.
// Escape ends it early (WCAG 2.2.2); on desktop it ends the entrance the same way (`hero:skip`,
// src/scripts/system/hero-entrance.ts).
// Keyboard focus moving anywhere else also goes straight to the page.

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
  const lockup = hero.querySelector<HTMLElement>('[data-reveal-lockup]');
  const mark = hero.querySelector<SVGElement>('[data-reveal-mark]');
  const progress = hero.querySelector<HTMLElement>('[data-reveal-progress]');
  // Claim the hero only when every part is there; otherwise the inline fallback reveals the page.
  if (!lockup || !mark || !progress) return;
  hero.dataset.introReady = 'true';
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
    announce();
  };

  const play = async () => {
    const id = ++run;
    hero.classList.remove('is-intro-run');
    hero.classList.add('is-intro-playing', 'is-intro-buffered');
    lockScroll(true);
    announce();
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

  // Escape ends the intro, or the desktop entrance (WCAG 2.2.2).
  const skip = () => {
    if (playing()) finish();
    hero.dispatchEvent(new CustomEvent('hero:skip'));
  };

  progress.addEventListener('animationend', (e) => {
    if (e.target === progress && playing()) finish();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (playing() || hero.classList.contains('is-entrance'))) skip();
  });
  document.addEventListener('focusin', (e) => {
    if (playing()) finish();
  });
  window.addEventListener('resize', () => {
    if (playing()) centreMark();
  });

  if (playing()) play();
}
