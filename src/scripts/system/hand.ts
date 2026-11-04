// Behaviour for talent/CreatorHand.astro: the fan of creator cards. Each card is told its distance from
// the front (--d, --ad) and CSS fans it out; only the front card can be flipped. Moved by scrolling (on
// desktop two cards, then the page moves on; elsewhere one card per step while the section is pinned),
// dragging, the arrows and arrow keys, or clicking a card. Category filters re-deal the hand.
import { initTilt, progressOf, stepOf } from './ambient';
import { addTo, initShortlists } from './shortlist';

const STEP_PX = 104; // how far a drag moves the hand by one card
const PULL_PX = 90; // how far down the front card goes to be shortlisted
const DESK_TURNS = [0.3, 0.64]; // desktop: how far through the pinned scroll (200px) each of the two cards turns: one wheel notch each

function initHand(root: HTMLElement) {
  const deck = root.querySelector<HTMLElement>('[data-hand-deck]');
  const messages = [...root.querySelectorAll<HTMLElement>('[data-hand-message]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-hand-card]')];
  const count = root.querySelector<HTMLElement>('[data-hand-count]');
  const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-hand-filter]')];
  const steps = Number(getComputedStyle(root).getPropertyValue('--steps')) || 1;

  let list = cards;
  let active = 0;

  const render = () => {
    const n = list.length;
    cards.forEach((c) => {
      const at = list.indexOf(c);
      c.hidden = at < 0;
      if (at < 0) return;
      let d = at - active;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const ad = Math.abs(d);
      c.style.setProperty('--d', String(d));
      c.style.setProperty('--ad', String(ad));
      // The fan opens to the right; to the left, towards the words, it stays tight.
      c.style.setProperty('--dx', (d < 0 ? d * 0.46 : d).toFixed(2));
      const front = d === 0;
      c.classList.toggle('is-active', front);
      c.classList.toggle('is-far', d > 5 || d < -3);
      if (!front) c.classList.remove('is-flipped');
      const flipped = c.classList.contains('is-flipped');
      c.querySelector<HTMLElement>('.ccard__front')?.toggleAttribute('inert', !front || flipped);
      c.querySelector<HTMLElement>('.ccard__back')?.toggleAttribute('inert', !flipped);
    });
    if (count) count.textContent = n ? `${String(active + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}` : '';
  };
  const move = (by: number) => {
    if (!list.length) return;
    active = (active + by + list.length * 10) % list.length;
    render();
  };

  /* ---------- Scroll ---------- */
  let step = 0;
  let message = 0;
  const onScroll = () => {
    const desk = window.matchMedia('(min-width: 1024px)').matches;
    const at = progressOf(root);
    const now = desk ? DESK_TURNS.filter((turn) => at >= turn).length : stepOf(root, steps);
    if (now !== step) {
      move(now - step);
      step = now;
    }
    // Desktop: the words change with the cards, ending on the last message and its call to action.
    const m = desk ? (now === DESK_TURNS.length ? messages.length - 1 : Math.min(messages.length - 1, now)) : Math.min(messages.length - 1, Math.floor(at * messages.length));
    if (m === message) return;
    message = m;
    messages.forEach((el, i) => {
      el.classList.toggle('is-active', i === m);
      if (i === m) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', 'true');
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!deck || !cards.length) return;

  /* ---------- Dragging ---------- */
  let pressed = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let axis = '';
  let pulled = 0;
  let last = 0;
  const front = () => list[active];
  deck.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.ccard__back')) return;
    pressed = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    axis = '';
    pulled = 0;
    last = 0;
  });
  window.addEventListener('pointermove', (e) => {
    if (!pressed) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!axis) {
      if (Math.hypot(dx, dy) < 6) return;
      axis = dy > Math.abs(dx) ? 'y' : 'x';
    }
    moved = true;
    // Down: the front card comes with it, towards the shortlist.
    if (axis === 'y') {
      pulled = Math.max(0, dy);
      const card = front();
      card?.classList.add('is-pull');
      card?.classList.toggle('is-pull-far', pulled > PULL_PX);
      card?.style.setProperty('--pull', `${pulled.toFixed(0)}px`);
      return;
    }
    root.classList.add('is-dragging');
    const at = Math.round(dx / STEP_PX);
    if (at !== last) {
      move(last - at);
      last = at;
    }
  });
  window.addEventListener('pointerup', () => {
    if (!pressed) return;
    pressed = false;
    root.classList.remove('is-dragging');
    if (axis === 'y') {
      const card = front();
      card?.classList.remove('is-pull', 'is-pull-far');
      card?.style.removeProperty('--pull');
      if (card && pulled > PULL_PX) {
        addTo('creators', { id: card.dataset.id ?? '', label: card.getAttribute('aria-label') ?? '' });
        move(1);
      }
    }
    if (moved) window.setTimeout(() => (moved = false), 0);
  });
  deck.addEventListener('dragstart', (e) => e.preventDefault());

  /* ---------- Clicking: a card comes forward; the front one flips ---------- */
  deck.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (moved) return;
    const card = t.closest<HTMLElement>('[data-hand-card]');
    if (!card) return;
    if (t.closest('[data-hand-unflip]')) {
      card.classList.remove('is-flipped');
      render();
      return;
    }
    if (t.closest('.ccard__back')) return;
    if (card.classList.contains('is-active')) {
      card.classList.toggle('is-flipped');
      render();
      if (card.classList.contains('is-flipped')) card.querySelector<HTMLElement>('.ccard__back a')?.focus({ preventScroll: true });
      return;
    }
    active = list.indexOf(card);
    render();
  });
  // A non-front card's button is inert, so its clicks land on the article itself; catch them there too.
  root.querySelector('[data-hand-prev]')?.addEventListener('click', () => move(-1));
  root.querySelector('[data-hand-next]')?.addEventListener('click', () => move(1));
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowLeft') move(-1);
    else return;
    e.preventDefault();
  });

  /* ---------- Filters: a new deal ---------- */
  filters.forEach((f) =>
    f.addEventListener('click', () => {
      filters.forEach((x) => x.setAttribute('aria-pressed', String(x === f)));
      const id = f.dataset.handFilter ?? '';
      list = cards.filter((c) => !id || (c.dataset.cats ?? '').split(' ').includes(id));
      active = 0;
      render();
    }),
  );

  initTilt(deck, () => deck.querySelector<HTMLElement>('.ccard.is-active .ccard__tilt'));
  initShortlists();
  render();
  onScroll();
}

export function initHands() {
  document.querySelectorAll<HTMLElement>('[data-hand]').forEach((root) => {
    if (root.dataset.handReady) return;
    root.dataset.handReady = 'true';
    initHand(root);
  });
}
