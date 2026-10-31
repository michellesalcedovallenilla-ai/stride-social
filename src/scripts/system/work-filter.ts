// Our Work archive filter: industry and service chips narrow the case study grid without a page
// load, and the choice is kept in the URL (?industry=&service=) so filtered views can be shared.
// "Load more" reveals the next page of matching tiles. Markup: [data-work-filter] root with chip
// groups [data-filter-group="industry|service"], the grid [data-work-grid], a count
// [data-filter-count], an empty state [data-filter-empty] and [data-load-more].

const SIZES = ['l', 's', 's', 'm', 'm', 'w'];
/** The "All" chip carries data-value="all". */
const chipValue = (chip: HTMLElement) => (chip.dataset.value === 'all' ? '' : (chip.dataset.value ?? ''));

function initFilter(root: HTMLElement) {
  const grid = root.querySelector<HTMLElement>('[data-work-grid]');
  if (!grid) return;
  const tiles = [...grid.querySelectorAll<HTMLElement>(':scope > li')];
  const pageSize = Number(grid.dataset.pageSize) || tiles.length;
  const count = root.querySelector<HTMLElement>('[data-filter-count]');
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  const more = root.querySelector<HTMLButtonElement>('[data-load-more]');
  const groups = [...root.querySelectorAll<HTMLElement>('[data-filter-group]')];
  const params = new URLSearchParams(location.search);
  const state: Record<string, string> = {};
  let shown = pageSize;

  for (const g of groups) {
    const key = g.dataset.filterGroup!;
    const wanted = params.get(key) ?? '';
    // Ignore values that match no chip (old or mistyped links).
    state[key] = wanted && [...g.querySelectorAll<HTMLElement>('[data-value]')].some((c) => chipValue(c) === wanted) ? wanted : '';
  }

  const render = () => {
    const matches = tiles.filter((t) =>
      groups.every((g) => {
        const key = g.dataset.filterGroup!;
        const list = (key === 'industry' ? t.dataset.industries : t.dataset.services) ?? '';
        return !state[key] || list.split(' ').includes(state[key]);
      }),
    );
    tiles.forEach((t) => (t.hidden = true));
    matches.slice(0, shown).forEach((t, i) => {
      t.hidden = false;
      t.className = t.className.replace(/wtile--\w+/, `wtile--${SIZES[i % SIZES.length]}`);
    });

    for (const g of groups) {
      g.querySelectorAll<HTMLElement>('[data-value]').forEach((chip) => {
        const active = chipValue(chip) === state[g.dataset.filterGroup!];
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
    }
    const visible = Math.min(shown, matches.length);
    if (count) count.textContent = `Showing ${visible} of ${matches.length} case ${matches.length === 1 ? 'study' : 'studies'}`;
    if (empty) empty.hidden = matches.length > 0;
    if (more) more.hidden = matches.length <= shown;
  };

  const syncUrl = () => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(state)) if (v) next.set(k, v);
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

  more?.addEventListener('click', () => {
    const firstNew = tiles.filter((t) => !t.hidden).length;
    shown += pageSize;
    render();
    // Move focus to the first newly shown case study so keyboard users keep their place.
    tiles.filter((t) => !t.hidden)[firstNew]?.querySelector('a')?.focus();
  });

  root.querySelector('[data-filter-clear]')?.addEventListener('click', () => {
    Object.keys(state).forEach((k) => (state[k] = ''));
    shown = pageSize;
    render();
    syncUrl();
  });

  root.classList.add('is-enhanced');
  render();
}

export function initWorkFilters() {
  document.querySelectorAll<HTMLElement>('[data-work-filter]').forEach((root) => {
    if (root.dataset.filterReady) return;
    root.dataset.filterReady = 'true';
    initFilter(root);
  });
}
