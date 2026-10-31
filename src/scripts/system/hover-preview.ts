// Image preview that follows the cursor over a typographic list (Social service index).
// Markup: [data-hover-preview] root, rows with [data-preview-key], a [data-preview] container
// holding images with matching [data-preview-for]. Desktop with a fine pointer only; under
// reduced motion the preview appears in place without trailing the cursor.

const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initPreview(root: HTMLElement) {
  const preview = root.querySelector<HTMLElement>('[data-preview]');
  if (!preview) return;
  const images = new Map([...preview.querySelectorAll<HTMLElement>('[data-preview-for]')].map((img) => [img.dataset.previewFor!, img]));
  let target = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };
  let frame = 0;

  const place = () => {
    current.x += (target.x - current.x) * 0.18;
    current.y += (target.y - current.y) * 0.18;
    preview.style.setProperty('--px', `${current.x}px`);
    preview.style.setProperty('--py', `${current.y}px`);
    frame = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.5 ? requestAnimationFrame(place) : 0;
  };

  root.addEventListener('pointermove', (e) => {
    if (!canHover()) return;
    const box = root.getBoundingClientRect();
    // Sit to the right of the cursor, vertically centred on it.
    target = { x: e.clientX - box.left + 32, y: e.clientY - box.top - preview.offsetHeight / 2 };
    if (reduced() || !preview.classList.contains('is-visible')) current = { ...target };
    if (!frame) frame = requestAnimationFrame(place);
  });

  root.querySelectorAll<HTMLElement>('[data-preview-key]').forEach((row) => {
    row.addEventListener('pointerenter', () => {
      if (!canHover()) return;
      images.forEach((img, key) => img.classList.toggle('is-active', key === row.dataset.previewKey));
      preview.classList.add('is-visible');
    });
    row.addEventListener('pointerleave', () => preview.classList.remove('is-visible'));
  });
}

export function initHoverPreviews() {
  document.querySelectorAll<HTMLElement>('[data-hover-preview]').forEach((root) => {
    if (root.dataset.previewReady) return;
    root.dataset.previewReady = 'true';
    initPreview(root);
  });
}
