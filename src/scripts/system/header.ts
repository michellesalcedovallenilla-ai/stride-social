// Behaviour for global/SiteHeader.astro.
// - Scroll: transparent throughout, so it slides away on scroll down as soon as content would pass under it,
//   and returns on scroll up (never while the navigation panel is open). The Menu button itself is handled by
//   src/scripts/system/edge-nav.ts.

export function initHeader() {
  const chrome = document.querySelector<HTMLElement>('[data-chrome]');
  if (!chrome || chrome.dataset.ready) return;
  chrome.dataset.ready = 'true';
  const navOpen = () => !!document.querySelector('[data-menu-panel].is-open');

  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    chrome.classList.toggle('is-scrolled', y > 80);
    if (Math.abs(y - lastY) > 4) {
      chrome.classList.toggle('is-hidden', y > lastY && y > 48 && !navOpen());
      lastY = y;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
