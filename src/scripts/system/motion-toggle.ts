// Pause control for decorative CSS motion (WCAG 2.2.2). A [data-motion-toggle] button toggles
// .is-paused on its [data-motion-root]; the component's CSS pauses its animations on that class.
// Reduced motion is handled in CSS (animations off), so the control is hidden there.

export function initMotionToggles() {
  document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]').forEach((btn) => {
    if (btn.dataset.motionReady) return;
    btn.dataset.motionReady = 'true';
    const root = btn.closest<HTMLElement>('[data-motion-root]');
    if (!root) return;
    const label = btn.getAttribute('aria-label') ?? 'Pause animation';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) btn.hidden = true;
    btn.addEventListener('click', () => {
      const paused = root.classList.toggle('is-paused');
      btn.setAttribute('aria-label', paused ? label.replace(/^Pause/, 'Play') : label);
    });
  });
}
