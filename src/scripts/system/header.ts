// Behaviour for global/SiteHeader.astro.
// - Scroll: solid after 80px; hides on scroll down, returns on scroll up (never while a menu is open).
// - Mega menus: click/Enter toggles; hover opens with a short delay on fine pointers; Escape
//   closes and returns focus; ArrowDown from a trigger moves into its panel; Up/Down move between
//   links; clicking the scrim or leaving the header area closes.
// - Mobile menu: dialog with focus trap, Escape to close, accordion sub-lists, scroll lock.

type Lenis = { stop(): void; start(): void };
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
      const open = chrome.classList.contains('is-open');
      chrome.classList.toggle('is-hidden', !open && y > lastY && y > 240);
      lastY = y;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mega menus ---------- */
  const triggers = [...chrome.querySelectorAll<HTMLButtonElement>('[data-mega-trigger]')];
  const scrim = document.querySelector<HTMLElement>('[data-mega-scrim]');
  const panelOf = (t: HTMLButtonElement) => document.getElementById(t.getAttribute('aria-controls') ?? '') as HTMLElement | null;
  let current: HTMLButtonElement | null = null;
  let hoverTimer = 0;

  const close = (returnFocus = false) => {
    if (!current) return;
    const t = current;
    t.setAttribute('aria-expanded', 'false');
    panelOf(t)?.setAttribute('hidden', '');
    scrim?.setAttribute('hidden', '');
    chrome.classList.remove('is-open');
    current = null;
    if (returnFocus) t.focus();
  };

  const open = (t: HTMLButtonElement) => {
    if (current === t) return;
    if (current) close();
    t.setAttribute('aria-expanded', 'true');
    panelOf(t)?.removeAttribute('hidden');
    scrim?.removeAttribute('hidden');
    chrome.classList.add('is-open');
    chrome.classList.remove('is-hidden');
    current = t;
  };

  const links = (panel: HTMLElement | null) => [...(panel?.querySelectorAll<HTMLAnchorElement>('a') ?? [])];

  triggers.forEach((t) => {
    t.addEventListener('click', () => (current === t ? close() : open(t)));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        open(t);
        links(panelOf(t))[0]?.focus();
      }
    });
    t.addEventListener('pointerenter', () => {
      if (!finePointer()) return;
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => open(t), current ? 0 : 90);
    });
    panelOf(t)?.addEventListener('keydown', (e) => {
      const items = links(panelOf(t));
      const i = items.indexOf(document.activeElement as HTMLAnchorElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = e.key === 'ArrowDown' ? Math.min(items.length - 1, i + 1) : i - 1;
        if (next < 0) t.focus();
        else items[next]?.focus();
      }
    });
  });

  chrome.addEventListener('pointerleave', () => {
    if (!finePointer()) return;
    clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => close(), 220);
  });
  chrome.addEventListener('pointerenter', () => clearTimeout(hoverTimer));
  scrim?.addEventListener('click', () => close());
  chrome.addEventListener('focusout', (e) => {
    if (current && !chrome.contains(e.relatedTarget as Node)) close();
  });

  /* ---------- Mobile menu ---------- */
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  const toggle = chrome.querySelector<HTMLButtonElement>('[data-mobile-toggle]');
  const focusables = () => [...(menu?.querySelectorAll<HTMLElement>('a, button') ?? [])].filter((el) => el.offsetParent !== null);

  const openMenu = () => {
    if (!menu || !toggle) return;
    menu.removeAttribute('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    lenis()?.stop();
    menu.querySelector<HTMLElement>('[data-mobile-close]')?.focus();
  };
  const closeMenu = () => {
    if (!menu || !toggle || menu.hasAttribute('hidden')) return;
    menu.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    lenis()?.start();
    toggle.focus();
  };

  toggle?.addEventListener('click', openMenu);
  menu?.querySelector('[data-mobile-close]')?.addEventListener('click', closeMenu);
  menu?.addEventListener('keydown', (e) => {
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
  menu?.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = document.getElementById(btn.getAttribute('aria-controls') ?? '');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      sub?.toggleAttribute('hidden', expanded);
    });
  });
  window.matchMedia('(min-width: 1120px)').addEventListener('change', (e) => e.matches && closeMenu());

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu && !menu.hasAttribute('hidden')) closeMenu();
    else close(true);
  });
}
