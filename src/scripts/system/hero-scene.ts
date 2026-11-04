// The homepage scene (components/home/HeroScene.astro), desktop: reads how far the destinations
// have risen over the pinned hero, as a share of the screen's height, and sets the hero's depth:
// --fade (its type fading, over the first third) and --deep (the blur and the glass, building over
// most of the way), with .is-deep on the hero while either is under way, and html.is-in-scene while
// the scene fills the top of the screen (the header stays see-through over it). Read on every scroll frame
// (smooth scroll included), written only when a value changes.

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function initHeroScene() {
  const scene = document.querySelector<HTMLElement>('[data-scene]');
  const hero = scene?.querySelector<HTMLElement>('.cover');
  if (!scene || !hero || scene.dataset.sceneReady) return;
  scene.dataset.sceneReady = 'true';
  const desktop = window.matchMedia('(min-width: 1024px)');
  let fade = -1;
  let deep = -1;
  let queued = false;

  const update = () => {
    queued = false;
    const box = scene.getBoundingClientRect();
    document.documentElement.classList.toggle('is-in-scene', desktop.matches && box.bottom > 96);
    const p = desktop.matches ? clamp(-box.top / window.innerHeight) : 0;
    const f = +ease(0, 0.32, p).toFixed(3);
    const d = +ease(0.04, 0.72, p).toFixed(3);
    if (f === fade && d === deep) return;
    fade = f;
    deep = d;
    hero.style.setProperty('--fade', String(f));
    hero.style.setProperty('--deep', String(d));
    hero.classList.toggle('is-deep', f > 0 || d > 0);
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  desktop.addEventListener('change', queue);
  // Coming back to the page part-way down (bfcache): start from where it is.
  window.addEventListener('pageshow', queue);
  update();
}
