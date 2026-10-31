// Line-by-line headline reveals: each line rises out of a mask, staggered 60ms (design system §8).
// Markup: <h2 data-reveal-lines>…</h2> (lines measured automatically and re-measured on resize),
// or author the lines yourself with .reveal-line > .reveal-line__inner spans (e.g. the hero).
// data-reveal-lines="load" plays immediately; otherwise it plays when the element enters view.
// Text stays in the DOM in reading order, so screen readers read the heading normally.

function wrapWords(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    for (const part of (node.textContent ?? '').split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) frag.append(document.createTextNode(' '));
      else {
        const w = document.createElement('span');
        w.className = 'reveal-word';
        w.textContent = part;
        frag.append(w);
      }
    }
    node.replaceWith(frag);
  }
}

function split(el: HTMLElement) {
  if (!el.dataset.revealSource) el.dataset.revealSource = el.innerHTML;
  el.innerHTML = el.dataset.revealSource;
  wrapWords(el);
  const words = [...el.querySelectorAll<HTMLElement>('.reveal-word')];
  const lines: HTMLElement[][] = [];
  let top: number | null = null;
  for (const w of words) {
    if (top === null || Math.abs(w.offsetTop - top) > 2) {
      lines.push([]);
      top = w.offsetTop;
    }
    lines[lines.length - 1].push(w);
  }
  el.innerHTML = '';
  lines.forEach((ws, i) => {
    const line = document.createElement('span');
    line.className = 'reveal-line';
    line.style.setProperty('--line', String(i));
    const inner = document.createElement('span');
    inner.className = 'reveal-line__inner';
    ws.forEach((w, j) => {
      inner.append(w);
      if (j < ws.length - 1) inner.append(document.createTextNode(' '));
    });
    line.append(inner);
    el.append(line);
  });
}

export async function initRevealLines() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-reveal-lines]')];
  if (!els.length) return;
  await document.fonts?.ready;
  const auto = els.filter((el) => !el.querySelector('.reveal-line'));
  auto.forEach(split);
  els.forEach((el) => el.querySelectorAll<HTMLElement>('.reveal-line').forEach((l, i) => l.style.setProperty('--line', String(i))));

  let width = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    auto.forEach(split);
  });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-revealed');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px' });

  for (const el of els) {
    if (el.dataset.revealLines === 'load') requestAnimationFrame(() => el.classList.add('is-revealed'));
    else io.observe(el);
  }
}
