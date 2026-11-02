// Interactive homepage hero (components/home/HeroMontage.astro).
// - Business tabs: hovering or focusing one wipes that business's footage in over the group
//   montage, tints the duotone in its colour, widens its tab and tells its story beside the
//   headline; leaving the bar returns to the group. Clicking still opens the business's page.
// - Touch screens (no hover): the hero cycles Group, Social, Talent, Education, with the active
//   tab's line filling as it plays; tapping a tab opens its page.
// - Scrolling away folds the footage into a rounded frame while the headline and tabs lift and
//   fade (`--hero-p`, 0 to 1 over the hero's height).
// Reduced motion: no cycling and no scroll effect; the tabs still switch footage and story.
// Everything waits while the intro plays (`hero:intro`), cycling stops while the hero is off
// screen, and pausing the montage (its keyboard-only toggle) also stops the cycle and any footage.

type World = 'social' | 'talent' | 'education';

export function initHeroWorlds() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || hero.dataset.worldsReady) return;
  hero.dataset.worldsReady = 'true';
  const bar = hero.querySelector<HTMLElement>('.hero__worlds');
  const montage = hero.querySelector<HTMLElement>('.hero__media');
  const tabs = [...hero.querySelectorAll<HTMLAnchorElement>('[data-world-tab]')];
  const layers = [...hero.querySelectorAll<HTMLElement>('[data-world]')];
  const stories = [...hero.querySelectorAll<HTMLElement>('[data-story]')];
  if (!bar || !tabs.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const introPlaying = () => hero.classList.contains('is-intro-playing');
  const userPaused = () => !!montage?.classList.contains('is-paused');
  const isMouse = (e: PointerEvent) => e.pointerType === 'mouse' || e.pointerType === 'pen';

  // ---------- Active business ----------
  let active: World | null = null;
  const setWorld = (world: World | null) => {
    if (world === active) return;
    active = world;
    if (world) hero.dataset.activeWorld = world;
    else delete hero.dataset.activeWorld;
    tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.worldTab === world));
    stories.forEach((s) => s.classList.toggle('is-active', s.dataset.story === (world ?? 'group')));
    layers.forEach((layer) => {
      const on = layer.dataset.world === world;
      layer.classList.toggle('is-active', on);
      const video = layer.querySelector('video');
      if (!video) return;
      if (on && !userPaused()) {
        if (video.preload === 'none') video.preload = 'auto';
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  // ---------- Hover and keyboard ----------
  let leaveTimer = 0;
  const leaveSoon = () => {
    clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(() => {
      if (!bar.contains(document.activeElement)) setWorld(null);
    }, 300);
  };
  tabs.forEach((tab) => {
    const world = tab.dataset.worldTab as World;
    tab.addEventListener('pointerenter', (e) => {
      if (!isMouse(e) || introPlaying()) return;
      clearTimeout(leaveTimer);
      setWorld(world);
    });
    tab.addEventListener('focus', () => {
      clearTimeout(leaveTimer);
      stopCycle();
      setWorld(world);
    });
    tab.addEventListener('blur', leaveSoon);
  });
  bar.addEventListener('pointerleave', (e) => {
    if (isMouse(e)) leaveSoon();
  });

  // ---------- Touch screens: cycle through the businesses ----------
  const order: (World | null)[] = [null, 'social', 'talent', 'education'];
  let step = 0;
  let cycleTimer = 0;
  let cycling = false;
  let inView = true;
  const canCycle = () => !fine && !reduced && !introPlaying() && inView && !userPaused();

  const runCycle = () => {
    clearTimeout(cycleTimer);
    if (!cycling) return;
    const world = order[step];
    const ms = world ? 5000 : 6000;
    setWorld(world);
    tabs.forEach((t) => t.classList.remove('is-cycling'));
    void hero.offsetWidth; // restart the progress line when the same tab comes round again
    hero.style.setProperty('--cycle', `${ms}ms`);
    tabs.find((t) => t.dataset.worldTab === world)?.classList.add('is-cycling');
    cycleTimer = window.setTimeout(() => {
      step = (step + 1) % order.length;
      runCycle();
    }, ms);
  };

  function stopCycle() {
    if (!cycling) return;
    cycling = false;
    clearTimeout(cycleTimer);
    tabs.forEach((t) => t.classList.remove('is-cycling'));
  }

  const updateCycle = () => {
    if (canCycle() && !cycling) {
      cycling = true;
      runCycle();
    } else if (!canCycle()) {
      stopCycle();
    }
  };

  new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    updateCycle();
  }, { threshold: 0.25 }).observe(hero);
  hero.addEventListener('hero:intro', updateCycle);

  // Pausing the montage pauses everything moving in the hero.
  if (montage) {
    new MutationObserver(() => {
      if (userPaused()) layers.forEach((l) => l.querySelector('video')?.pause());
      else layers.find((l) => l.classList.contains('is-active'))?.querySelector('video')?.play().catch(() => {});
      updateCycle();
    }).observe(montage, { attributes: true, attributeFilter: ['class'] });
  }

  // ---------- Scroll: fold the footage away ----------
  if (!reduced) {
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const p = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
        hero.style.setProperty('--hero-p', p.toFixed(3));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
