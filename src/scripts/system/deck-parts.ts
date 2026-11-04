// What the made-to-measure decks share (components/experience/Deck.astro, desktop): the pill that slides
// between the tabs, photos ready before they're needed, and an entrance that waits until the row is in view.

export const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const desktop = () => window.matchMedia('(min-width: 1024px)').matches;

/** The pill under the chosen tab. Returns the function that puts it there. */
export function slidePill(root: HTMLElement, tabs: HTMLButtonElement[]) {
  const pill = root.querySelector<HTMLElement>('[data-deck-pill]');
  const place = () => {
    const tab = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    if (!pill || !tab || !pill.parentElement) return;
    const at = tab.getBoundingClientRect();
    pill.style.width = `${at.width}px`;
    pill.style.transform = `translateX(${at.left - pill.parentElement.getBoundingClientRect().left}px)`;
  };
  if (pill?.parentElement) {
    root.classList.add('has-pill');
    place();
    new ResizeObserver(place).observe(pill.parentElement);
  }
  return place;
}

/** Every tab's photos load as the deck comes near, so no card flashes empty. */
export function preload(root: HTMLElement) {
  const near = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      root.querySelectorAll<HTMLImageElement>('.deck__image').forEach((img) => (img.loading = 'eager'));
    },
    { rootMargin: '100% 0px' },
  );
  near.observe(root);
}

/** Hides the row until it's in view, then runs its entrance once. */
export function firstView(root: HTMLElement, enter: () => void) {
  if (calm() || !desktop()) return;
  root.classList.add('is-waiting');
  const first = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      first.disconnect();
      root.classList.remove('is-waiting');
      enter();
    },
    { threshold: 0.3 },
  );
  first.observe(root);
}
