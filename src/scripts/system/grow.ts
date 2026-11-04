// Cards that grow: choosing a [data-grow-card] grows its big card ([data-grow-detail], with the same
// key) out of it, over whatever holds them, with a clip that starts as the small card's outline. The
// close button, Escape or close() shrink it back into the card. The row behind goes inert meanwhile.
// With the script missing, or with a modified click, a card is an ordinary link.
// `hold` is for a big card that fills the screen: opening it brings the section to the top of the screen
// (unless `settle` is false: a wall stays exactly where it is) and the page stays put until it closes, its own
// contents still scrolling. A press anywhere else closes it.

type Lenis = { scrollTo(target: number, options?: { force?: boolean; duration?: number; onComplete?: () => void }): void; stop(): void; start(): void };
const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;

export function initGrow(root: HTMLElement, opts: { canOpen?: (card: HTMLElement) => boolean; hold?: boolean; settle?: boolean } = {}) {
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let openDetail: HTMLElement | null = null;
  let openCard: HTMLElement | null = null;

  const clipOf = (detail: HTMLElement, card: HTMLElement) => {
    const d = detail.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return `inset(${c.top - d.top}px ${d.right - c.right}px ${d.bottom - c.bottom}px ${c.left - d.left}px round 22px)`;
  };
  const grow = (detail: HTMLElement, card: HTMLElement, closing: boolean) => {
    const keyframes = [{ clipPath: clipOf(detail, card) }, { clipPath: 'inset(0 0 0 0 round 26px)' }];
    return detail.animate(closing ? keyframes.reverse() : keyframes, { duration: closing ? 380 : 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' });
  };

  // Could this scroll, going this way, move something inside the big card?
  const moves = (from: EventTarget | null, dy: number) => {
    if (!openDetail || !(from instanceof Element) || !openDetail.contains(from)) return false;
    for (let el: Element | null = from; el && openDetail.contains(el); el = el.parentElement) {
      if (!/auto|scroll/.test(getComputedStyle(el).overflowY)) continue;
      if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : dy < 0 && el.scrollTop > 1) return true;
    }
    return false;
  };
  const onWheel = (e: WheelEvent) => {
    if (e.cancelable && !moves(e.target, e.deltaY)) e.preventDefault();
  };
  const KEYS: Record<string, number> = { ArrowDown: 1, PageDown: 1, End: 1, ' ': 1, ArrowUp: -1, PageUp: -1, Home: -1 };
  const onKey = (e: KeyboardEvent) => {
    const dy = KEYS[e.key];
    if (!dy || (e.target as HTMLElement).closest('input, textarea, select, button, a, video')) return;
    if (!moves(e.target, dy)) e.preventDefault();
  };
  const onPress = (e: PointerEvent) => {
    if (openDetail && !openDetail.contains(e.target as Node)) close(false);
  };
  const hold = () => {
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPress);
    const off = root.getBoundingClientRect().top;
    if (opts.settle === false || Math.abs(off) < 2) return lenis()?.stop();
    const stop = () => openDetail && lenis()?.stop();
    if (lenis()) lenis()?.scrollTo(window.scrollY + off, { force: true, duration: 0.45, onComplete: stop });
    else window.scrollTo({ top: window.scrollY + off, behavior: reduced() ? 'auto' : 'smooth' });
  };
  const release = () => {
    window.removeEventListener('wheel', onWheel, { capture: true });
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('pointerdown', onPress);
    lenis()?.start();
  };

  const close = (returnFocus = true) => {
    const detail = openDetail;
    const card = openCard;
    if (!detail || !card) return;
    openDetail = null;
    openCard = null;
    if (opts.hold) release();
    detail.querySelectorAll('video').forEach((v) => v.pause());
    const row = card.closest<HTMLElement>('[data-grow-row]');
    row?.removeAttribute('inert');
    root.classList.remove('has-big-card');
    const done = () => {
      detail.hidden = true;
      detail.getAnimations().forEach((a) => a.cancel());
    };
    if (reduced() || card.offsetParent === null) done();
    else grow(detail, card, true).finished.then(done, done);
    if (returnFocus) card.focus({ preventScroll: true });
  };

  const open = (card: HTMLElement) => {
    const detail = root.querySelector<HTMLElement>(`[data-grow-detail="${card.dataset.growCard}"]`);
    if (!detail) return false;
    close(false);
    openDetail = detail;
    openCard = card;
    detail.hidden = false;
    detail.scrollTop = 0;
    card.closest('[data-grow-row]')?.setAttribute('inert', '');
    root.classList.add('has-big-card');
    if (opts.hold) hold();
    if (!reduced()) grow(detail, card, false);
    detail.querySelector<HTMLElement>('[data-grow-close]')?.focus({ preventScroll: true });
    return true;
  };

  root.querySelectorAll<HTMLElement>('[data-grow-card]').forEach((card) =>
    card.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (opts.canOpen && !opts.canOpen(card)) return;
      if (open(card)) e.preventDefault();
    }),
  );
  root.querySelectorAll('[data-grow-close]').forEach((b) => b.addEventListener('click', () => close()));
  root.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Escape' && openDetail) close();
  });

  return { close };
}
