// Behaviour for global/SiteHeader.astro.
// - Scroll: solid after 80px; hides on scroll down, returns on scroll up (never while the menu is open).
// - Menu: full-screen dialog with focus trap, Escape to close and scroll lock. The dial inside it
//   (src/scripts/system/mode-dial.ts) sends `dial:change`; the menu then shows that mode's panel.

type Lenis = { stop(): void; start(): void };
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;

export function initHeader() {
  const chrome = document.querySelector<HTMLElement>('[data-chrome]');
  if (!chrome || chrome.dataset.ready) return;
  chrome.dataset.ready = 'true';

  /* ---------- Scroll state ---------- */
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    chrome.classList.toggle('is-scrolled', y > 80);
    if (Math.abs(y - lastY) > 4) {
      chrome.classList.toggle('is-hidden', y > lastY && y > 240);
      lastY = y;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu ---------- */
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const toggle = chrome.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  if (!menu || !toggle) return;
  const panels = [...menu.querySelectorAll<HTMLElement>('[data-mode-panel]')];
  const focusables = () => [...menu.querySelectorAll<HTMLElement>('a, button')].filter((el) => el.offsetParent !== null && el.tabIndex !== -1);

  const openMenu = () => {
    menu.removeAttribute('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    lenis()?.stop();
    // Start on the dial, so the arrow keys turn it straight away.
    (menu.querySelector<HTMLElement>('[data-dial] .is-selected') ?? menu.querySelector<HTMLElement>('[data-menu-close]'))?.focus();
  };
  const closeMenu = () => {
    if (menu.hasAttribute('hidden')) return;
    menu.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    lenis()?.start();
    toggle.focus();
  };

  toggle.addEventListener('click', openMenu);
  menu.querySelector('[data-menu-close]')?.addEventListener('click', closeMenu);
  menu.addEventListener('dial:change', (e) => {
    const { index } = (e as CustomEvent<{ index: number }>).detail;
    panels.forEach((p, i) => p.toggleAttribute('hidden', i !== index));
  });
  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}
