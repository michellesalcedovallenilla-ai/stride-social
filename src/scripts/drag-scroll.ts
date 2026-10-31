// Mouse drag for horizontal scrollers ([data-drag-scroll]); touch and trackpads scroll natively.

export function initDragScroll() {
  document.querySelectorAll<HTMLElement>('[data-drag-scroll]').forEach((el) => {
    if (el.dataset.dragReady) return;
    el.dataset.dragReady = 'true';
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      moved = false;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!el.classList.contains('is-dragging')) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startScroll - dx;
    });
    const end = () => el.classList.remove('is-dragging');
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', (e) => {
      if (moved) e.preventDefault();
    }, true);
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
      el.scrollBy({ left: e.key === 'ArrowRight' ? step : -step, behavior: 'smooth' });
    });
  });
}
