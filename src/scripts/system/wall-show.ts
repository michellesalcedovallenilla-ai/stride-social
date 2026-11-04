// The Our Work version of the wall (components/experience/Wall.astro with `showcase`, desktop): a glass lens for a
// cursor that says what a press will do, the panel's headline becoming the client under the pointer while the
// other tiles step back, a sheen following the pointer, columns drifting at different speeds as you scroll, and a
// small map of the wall to drag around it. Everything here is decoration over wall.ts, which owns the wall.
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const SPRING = 0.2; // how quickly the lens catches up with the pointer

const placed = (el: HTMLElement) => {
  const m = /translate3d\((-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(el.style.transform);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : { x: 0, y: 0 };
};

export function initWallShow(root: HTMLElement) {
  const pin = root.querySelector<HTMLElement>('[data-wall-pin]');
  const board = root.querySelector<HTMLElement>('[data-wall-board]');
  if (!pin || !board) return;
  const tiles = [...board.querySelectorAll<HTMLElement>(':scope > li')];

  /* ---------- The panel's headline, and the rest stepping back ---------- */
  const echo = root.querySelector<HTMLElement>('[data-wall-echo]');
  const echoName = echo?.querySelector<HTMLElement>('[data-echo-name]');
  const echoMeta = echo?.querySelector<HTMLElement>('[data-echo-meta]');
  let hot: HTMLElement | null = null;
  const heat = (tile: HTMLElement | null) => {
    if (tile === hot) return;
    hot?.classList.remove('is-hot');
    hot = tile;
    tile?.classList.add('is-hot');
    root.classList.toggle('is-peeking', !!tile);
    if (!tile || !echoName || !echoMeta) return;
    const name = tile.dataset.name ?? '';
    echoName.textContent = name;
    echoName.style.setProperty('--len', String(Math.max(6, ...name.split(/\s+/).map((w) => w.length))));
    echoMeta.textContent = tile.dataset.about ?? '';
  };

  /* ---------- The lens ---------- */
  const lens = root.querySelector<HTMLElement>('[data-wall-lens]');
  const word = lens?.querySelector<HTMLElement>('span');
  const target = { x: 0, y: 0 };
  const at = { x: 0, y: 0 };
  let raf = 0;
  const follow = () => {
    raf = 0;
    if (!lens) return;
    at.x += (target.x - at.x) * SPRING;
    at.y += (target.y - at.y) * SPRING;
    lens.style.transform = `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px)`;
    if (Math.abs(target.x - at.x) > 0.2 || Math.abs(target.y - at.y) > 0.2) raf = requestAnimationFrame(follow);
  };
  const say = (text: string) => {
    if (word && word.textContent !== text) word.textContent = text;
  };

  board.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (lens && !lens.classList.contains('is-on')) {
      at.x = e.clientX;
      at.y = e.clientY;
      lens.classList.add('is-on');
    }
    target.x = e.clientX;
    target.y = e.clientY;
    if (!raf) raf = requestAnimationFrame(follow);
    const link = (e.target as HTMLElement).closest<HTMLElement>('.wtile__link');
    const dragging = root.classList.contains('is-dragging');
    say(link && !dragging ? (lens?.dataset.view ?? '') : (lens?.dataset.drag ?? ''));
    lens?.classList.toggle('is-small', !link && !dragging);
    if (dragging) return;
    heat(link?.closest<HTMLElement>('li') ?? null);
    if (link) {
      const r = link.getBoundingClientRect();
      link.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      link.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    }
  });
  board.addEventListener('pointerleave', () => {
    lens?.classList.remove('is-on');
    heat(null);
  });
  board.addEventListener('pointerdown', () => lens?.classList.add('is-pressed'));
  window.addEventListener('pointerup', () => lens?.classList.remove('is-pressed'));
  // The keyboard gets the same headline.
  board.addEventListener('focusin', (e) => {
    if ((e.target as HTMLElement).matches(':focus-visible')) heat((e.target as HTMLElement).closest('li'));
  });
  board.addEventListener('focusout', () => heat(null));
  // A big card opening leaves nothing hot behind it.
  new MutationObserver(() => {
    if (root.classList.contains('has-big-card')) {
      heat(null);
      lens?.classList.remove('is-on');
    }
  }).observe(root, { attributes: true, attributeFilter: ['class'] });

  /* ---------- The map, and the drift ---------- */
  const map = root.querySelector<HTMLElement>('[data-wall-map]');
  const frame = root.querySelector<HTMLElement>('[data-wall-frame]');
  const dots = new Map<HTMLElement, HTMLElement>();
  tiles.forEach((t) => {
    const dot = document.createElement('i');
    map?.append(dot);
    dots.set(t, dot);
    t.addEventListener('pointerenter', () => dot.classList.add('is-hot'));
    t.addEventListener('pointerleave', () => dot.classList.remove('is-hot'));
  });
  const boardSize = () => ({ w: board.offsetWidth || 1, h: board.offsetHeight || 1 });
  const drawDots = () => {
    if (!map) return;
    const { w, h } = boardSize();
    const scale = map.clientWidth / w;
    map.style.height = `${Math.round(h * scale)}px`;
    tiles.forEach((t) => {
      const dot = dots.get(t);
      if (!dot) return;
      dot.hidden = t.hidden;
      const p = placed(t);
      dot.style.cssText = `left:${(p.x * scale).toFixed(1)}px;top:${(p.y * scale).toFixed(1)}px;width:${(t.offsetWidth * scale).toFixed(1)}px;height:${(t.offsetHeight * scale).toFixed(1)}px`;
    });
  };
  const drawFrame = () => {
    const p = placed(board);
    root.style.setProperty('--drift', p.y.toFixed(1));
    if (!map || !frame) return;
    const { w } = boardSize();
    const scale = map.clientWidth / w;
    frame.style.width = `${Math.min(window.innerWidth, w) * scale}px`;
    frame.style.height = `${window.innerHeight * scale}px`;
    frame.style.transform = `translate(${(-p.x * scale).toFixed(1)}px, ${(-p.y * scale).toFixed(1)}px)`;
  };
  new MutationObserver(drawFrame).observe(board, { attributes: true, attributeFilter: ['style'] });
  root.addEventListener('wall:layout', () => {
    drawDots();
    drawFrame();
  });
  drawDots();
  drawFrame();

  // Press or drag on the map, and the wall goes there.
  let steering = false;
  const steer = (e: PointerEvent) => {
    if (!map) return;
    const { w, h } = boardSize();
    const r = map.getBoundingClientRect();
    const bx = ((e.clientX - r.left) / r.width) * w;
    const by = ((e.clientY - r.top) / r.height) * h;
    const fx = clamp((bx - window.innerWidth / 2) / Math.max(1, w - window.innerWidth), 0, 1);
    const fy = clamp((by - window.innerHeight / 2) / Math.max(1, h - window.innerHeight), 0, 1);
    root.dispatchEvent(new CustomEvent('wall:go', { detail: { fx, fy } }));
  };
  map?.addEventListener('pointerdown', (e) => {
    steering = true;
    map.setPointerCapture(e.pointerId);
    map.classList.add('is-steering');
    steer(e);
  });
  map?.addEventListener('pointermove', (e) => steering && steer(e));
  const stop = () => {
    steering = false;
    map?.classList.remove('is-steering');
  };
  map?.addEventListener('pointerup', stop);
  map?.addEventListener('pointercancel', stop);
}
