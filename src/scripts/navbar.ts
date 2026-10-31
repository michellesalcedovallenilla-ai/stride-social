// Navbar behaviour: hide on scroll down / show on scroll up, and the expanding menu.

export function initNavbar() {
  const bar = document.querySelector<HTMLElement>('[data-navbar]');
  if (!bar) return;

  let lastY = window.scrollY;
  const threshold = bar.offsetHeight;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 4) return;
      bar.classList.toggle('is-hidden', y > lastY && y > threshold);
      lastY = y;
    },
    { passive: true },
  );

  const toggle = bar.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = bar.querySelector<HTMLElement>('[data-menu-panel]');
  if (!toggle || !panel) return;

  const setOpen = (open: boolean) => {
    bar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setOpen(!bar.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bar.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (bar.classList.contains('is-open') && !bar.querySelector('[data-menu]')?.contains(e.target as Node)) setOpen(false);
  });
}
