// Roster filtering for src/components/talent/RosterGrid.astro. Cards carry data-name and
// data-categories; chips carry data-value ("all" = no filter).
//   [data-roster="preview"]:   shows the first data-limit matches; the "See full roster" link
//                              ([data-roster-link]) picks up the chosen category.
//   [data-roster="directory"]: adds name search, a live count, "Load more" (data-limit per page),
//                              an empty state, and keeps ?category= and ?q= in the URL.

const chipValue = (chip: HTMLElement) => (chip.dataset.value === 'all' ? '' : (chip.dataset.value ?? ''));

function initRoster(root: HTMLElement) {
  const mode = root.dataset.roster;
  const limit = Number(root.dataset.limit) || 12;
  const cards = [...root.querySelectorAll<HTMLElement>('[data-roster-list] > li')];
  const chips = [...root.querySelectorAll<HTMLElement>('[data-roster-chips] [data-value]')];
  const search = root.querySelector<HTMLInputElement>('[data-roster-search]');
  const count = root.querySelector<HTMLElement>('[data-roster-count]');
  const empty = root.querySelector<HTMLElement>('[data-roster-empty]');
  const more = root.querySelector<HTMLButtonElement>('[data-roster-more]');
  const link = root.querySelector<HTMLAnchorElement>('[data-roster-link]');
  const baseHref = link?.getAttribute('href') ?? '';
  const directory = mode === 'directory';
  const params = new URLSearchParams(directory ? location.search : '');
  const known = new Set(chips.map(chipValue));
  let category = known.has(params.get('category') ?? '') ? (params.get('category') ?? '') : '';
  let query = (params.get('q') ?? '').slice(0, 60);
  let shown = limit;
  if (search) search.value = query;

  const render = () => {
    const q = query.trim().toLowerCase();
    const matches = cards.filter(
      (c) => (!category || (c.dataset.categories ?? '').split(' ').includes(category)) && (!q || (c.dataset.name ?? '').includes(q)),
    );
    cards.forEach((c) => (c.hidden = true));
    matches.slice(0, shown).forEach((c) => (c.hidden = false));
    chips.forEach((chip) => {
      const active = chipValue(chip) === category;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    if (count) count.textContent = `Showing ${Math.min(shown, matches.length)} of ${matches.length} creator${matches.length === 1 ? '' : 's'}`;
    if (empty) empty.hidden = matches.length > 0;
    if (more) more.hidden = matches.length <= shown;
    if (link) link.href = category ? `${baseHref}?category=${category}` : baseHref;
  };

  const syncUrl = () => {
    if (!directory) return;
    const next = new URLSearchParams();
    if (category) next.set('category', category);
    if (query.trim()) next.set('q', query.trim());
    const qs = next.toString();
    history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
  };

  root.querySelector('[data-roster-chips]')?.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('[data-value]');
    if (!chip) return;
    category = chipValue(chip);
    shown = limit;
    render();
    syncUrl();
  });

  let timer = 0;
  search?.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      query = search.value.slice(0, 60);
      shown = limit;
      render();
      syncUrl();
    }, 150);
  });

  more?.addEventListener('click', () => {
    const firstNew = cards.filter((c) => !c.hidden).length;
    shown += limit;
    render();
    // Keep keyboard users in place: focus the first newly shown creator.
    cards.filter((c) => !c.hidden)[firstNew]?.querySelector('a')?.focus();
  });

  root.querySelector('[data-roster-clear]')?.addEventListener('click', () => {
    category = '';
    query = '';
    if (search) search.value = '';
    shown = limit;
    render();
    syncUrl();
    search?.focus();
  });

  render();
}

export function initRosterFilters() {
  document.querySelectorAll<HTMLElement>('[data-roster]').forEach((root) => {
    if (root.dataset.rosterReady) return;
    root.dataset.rosterReady = 'true';
    initRoster(root);
  });
}
