// What a visitor has picked as they go: services for a campaign brief, creators for a shortlist. Anything
// with [data-keep] toggles an item; experience/Tray.astro shows the list and leads to the enquiry form, which
// starts from it. Kept for this visit only, on this device, and nothing is sent anywhere until the visitor
// sends the form. Only what a page has actually rendered can be added, so the roster's consent rule holds,
// shared links included.
export type Item = { id: string; label: string; group?: string };

const stores = new Map<string, Item[]>();
const keyOf = (list: string) => `stride:${list}`;

const load = (list: string): Item[] => {
  const known = stores.get(list);
  if (known) return known;
  let items: Item[] = [];
  try {
    items = JSON.parse(sessionStorage.getItem(keyOf(list)) ?? '[]');
  } catch {
    /* no storage here: it lasts for this page */
  }
  stores.set(list, items);
  return items;
};

const save = (list: string, items: Item[]) => {
  stores.set(list, items);
  try {
    sessionStorage.setItem(keyOf(list), JSON.stringify(items));
  } catch {
    /* no storage here: it lasts for this page */
  }
  render(true);
};

export const addTo = (list: string, item: Item) => {
  const items = load(list);
  if (!items.some((x) => x.id === item.id)) save(list, [...items, item]);
};
export const removeFrom = (list: string, id: string) => save(list, load(list).filter((x) => x.id !== id));

/** The link to the enquiry form, carrying the list. */
const linkFor = (list: string, base: string) => {
  const items = load(list);
  if (!items.length) return base;
  const url = new URL(base, location.origin);
  if (list === 'creators') url.searchParams.set('creators', items.map((x) => x.id).join(','));
  else {
    url.searchParams.set('brief', items.map((x) => x.label).join('|'));
    const groups = new Set(items.map((x) => x.group).filter(Boolean));
    if (groups.size === 1) url.searchParams.set('service', [...groups][0] as string);
  }
  return url.pathname + url.search;
};

function render(changed = false) {
  document.querySelectorAll<HTMLElement>('[data-keep]').forEach((b) => {
    b.setAttribute('aria-pressed', String(load(b.dataset.keep!).some((x) => x.id === b.dataset.keepId)));
  });
  document.querySelectorAll<HTMLAnchorElement>('[data-keep-cta]').forEach((a) => {
    a.href = linkFor(a.dataset.keepCta!, a.dataset.keepBase ?? a.getAttribute('href') ?? '/');
  });
  document.querySelectorAll<HTMLElement>('[data-tray]').forEach((tray) => {
    const list = tray.dataset.tray!;
    const items = load(list);
    tray.hidden = !items.length;
    const count = tray.querySelector('[data-tray-count]');
    if (count) count.textContent = String(items.length);
    const box = tray.querySelector<HTMLElement>('[data-tray-items]');
    if (box) {
      box.replaceChildren(
        ...items.map((item) => {
          const li = document.createElement('li');
          li.className = 'tray__chip';
          li.title = item.label;
          const name = document.createElement('span');
          name.textContent = item.label;
          const x = document.createElement('button');
          x.type = 'button';
          x.textContent = '×';
          x.setAttribute('aria-label', `${tray.dataset.remove ?? 'Remove'}: ${item.label}`);
          x.addEventListener('click', () => removeFrom(list, item.id));
          li.append(name, x);
          return li;
        }),
      );
    }
    if (changed && items.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tray.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
    }
  });
}

let started = false;
export function initShortlists() {
  if (started) return render();
  started = true;
  // In the capture phase, so choosing never also opens or flips the card it sits on.
  document.addEventListener(
    'click',
    (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-keep]');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      const list = b.dataset.keep!;
      const id = b.dataset.keepId!;
      if (load(list).some((x) => x.id === id)) removeFrom(list, id);
      else addTo(list, { id, label: b.dataset.keepLabel ?? id, group: b.dataset.keepGroup });
    },
    true,
  );
  // A shared shortlist: only creators this page shows can be restored.
  const shared = new URLSearchParams(location.search).get('shortlist');
  shared?.split(',').forEach((id) => {
    const b = document.querySelector<HTMLElement>(`[data-keep="creators"][data-keep-id="${CSS.escape(id)}"]`);
    if (b) addTo('creators', { id, label: b.dataset.keepLabel ?? id });
  });
  document.addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-tray-share]');
    if (!b) return;
    const ids = load('creators').map((x) => x.id).join(',');
    const label = b.textContent;
    try {
      await navigator.clipboard.writeText(`${location.origin}/talent/roster?shortlist=${ids}`);
      b.textContent = b.dataset.done ?? label;
      window.setTimeout(() => (b.textContent = label), 1600);
    } catch {
      /* the browser refused: the visitor still has the list */
    }
  });
  render();
}
