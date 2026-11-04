// Archive filtering (Our Work, Insights): chips narrow a grid without a page load, and the choice
// is kept in the URL (?industry=&service=, ?category=) so filtered views can be shared.
// "Load more" reveals the next page of matching items.
// Markup: a [data-archive] root with chip groups [data-filter-group="<key>"] (chips carry
// data-value; "all" = no filter), items in [data-archive-grid] carrying data-filter-<key>
// (space-separated ids), a count [data-filter-count] (data-noun="case study|case studies"),
// an empty state [data-filter-empty], a clear button [data-filter-clear] and [data-load-more].
// If the grid has data-sizes, visible items get those size classes in turn (mosaic rhythm).

const chipValue = (chip: HTMLElement) => (chip.dataset.value === 'all' ? '' : (chip.dataset.value ?? ''));

function initArchive(root: HTMLElement) {
  const grid = root.querySelector<HTMLElement>('[data-archive-grid]');
  if (!grid) return;
  const items = [...grid.querySelectorAll<HTMLElement>(':scope > li')];
  const pageSize = Number(grid.dataset.pageSize) || items.length;
  const sizes = grid.dataset.sizes?.split(' ');
  const sizePrefix = grid.dataset.sizePrefix ?? '';
  const count = root.querySelector<HTMLElement>('[data-filter-count]');
  const [one, many] = (count?.dataset.noun ?? 'item|items').split('|');
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  const more = root.querySelector<HTMLButtonElement>('[data-load-more]');
  const groups = [...root.querySelectorAll<HTMLElement>('[data-filter-group]')];
  const search = root.querySelector<HTMLInputElement>('[data-filter-search]');
  // A slider: only items up to its value (data-filter-max names the item's number; the top means no limit).
  const slider = root.querySelector<HTMLInputElement>('[data-filter-max]');
  const sliderOut = root.querySelector<HTMLElement>('[data-filter-max-label]');
  const sliderKey = slider?.dataset.filterMax ?? '';
  const limit = () => (slider && Number(slider.value) < Number(slider.max) ? Number(slider.value) : Infinity);
  const params = new URLSearchParams(location.search);
  const state: Record<string, string> = {};
  let shown = pageSize;
  let term = (params.get('q') ?? '').trim().toLowerCase();
  if (search) search.value = term;
  if (slider && params.get('up-to')) slider.value = params.get('up-to') as string;

  for (const g of groups) {
    const key = g.dataset.filterGroup!;
    const wanted = params.get(key) ?? '';
    // Ignore values that match no chip (old or mistyped links).
    state[key] = wanted && [...g.querySelectorAll<HTMLElement>('[data-value]')].some((c) => chipValue(c) === wanted) ? wanted : '';
  }

  const render = () => {
    const matches = items.filter((item) =>
      (!term || (item.dataset.search ?? '').includes(term)) &&
      Number(item.dataset[sliderKey] ?? 0) <= limit() &&
      Object.entries(state).every(([key, value]) => !value || (item.getAttribute(`data-filter-${key}`) ?? '').split(' ').includes(value)),
    );
    items.forEach((item) => (item.hidden = true));
    matches.slice(0, shown).forEach((item, i) => {
      item.hidden = false;
      if (sizes) item.className = item.className.replace(new RegExp(`${sizePrefix}\w+`), `${sizePrefix}${sizes[i % sizes.length]}`);
    });

    for (const g of groups) {
      g.querySelectorAll<HTMLElement>('[data-value]').forEach((chip) => {
        const active = chipValue(chip) === state[g.dataset.filterGroup!];
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
    }
    if (slider && sliderOut) {
      const top = limit() === Infinity;
      sliderOut.textContent = top ? (slider.dataset.any ?? '') : (slider.dataset.upto ?? '').replace('{n}', slider.value);
    }
    const visible = Math.min(shown, matches.length);
    if (count) count.textContent = `Showing ${visible} of ${matches.length} ${matches.length === 1 ? one : many}`;
    if (empty) empty.hidden = matches.length > 0;
    if (more) more.hidden = matches.length <= shown;
  };

  const syncUrl = () => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(state)) if (v) next.set(k, v);
    if (term) next.set('q', term);
    if (slider && limit() !== Infinity) next.set('up-to', slider.value);
    const query = next.toString();
    history.replaceState(null, '', query ? `${location.pathname}?${query}` : location.pathname);
  };

  for (const g of groups) {
    g.addEventListener('click', (e) => {
      const chip = (e.target as HTMLElement).closest<HTMLElement>('[data-value]');
      if (!chip) return;
      state[g.dataset.filterGroup!] = chipValue(chip);
      shown = pageSize;
      render();
      syncUrl();
    });
  }

  search?.addEventListener('input', () => {
    term = search.value.trim().toLowerCase();
    shown = pageSize;
    render();
    syncUrl();
  });

  slider?.addEventListener('input', () => {
    shown = pageSize;
    render();
    syncUrl();
  });

  more?.addEventListener('click', () => {
    const firstNew = items.filter((i) => !i.hidden).length;
    shown += pageSize;
    render();
    // Move focus to the first newly shown item so keyboard users keep their place.
    items.filter((i) => !i.hidden)[firstNew]?.querySelector('a')?.focus();
  });

  root.querySelector('[data-filter-clear]')?.addEventListener('click', () => {
    Object.keys(state).forEach((k) => (state[k] = ''));
    term = '';
    if (search) search.value = '';
    if (slider) slider.value = slider.max;
    shown = pageSize;
    render();
    syncUrl();
  });

  root.classList.add('is-enhanced');
  render();
}

export function initArchiveFilters() {
  document.querySelectorAll<HTMLElement>('[data-archive]').forEach((root) => {
    if (root.dataset.archiveReady) return;
    root.dataset.archiveReady = 'true';
    initArchive(root);
  });
}
