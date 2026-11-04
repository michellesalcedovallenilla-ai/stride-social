// One question at a time, on the forms in experience/FormStage.astro: a long form becomes a short
// conversation, with a progress bar and Next and Back. Each step is checked before moving on, by the same
// rules as the whole form (form.ts), which still does the sending. Without the script, or below desktop, it's
// the ordinary form with every field showing.
import { checkWithin } from './form';

function initSteps(panel: HTMLElement) {
  const form = panel.querySelector('form');
  const grid = form?.querySelector<HTMLElement>(':scope > [class*="__grid"]');
  if (!form || !grid) return;
  const steps = [...grid.children] as HTMLElement[];
  if (steps.length < 2) return;

  const bar = document.createElement('div');
  bar.className = 'form-steps__bar';
  const label = document.createElement('p');
  label.className = 'exp-label';
  label.setAttribute('aria-live', 'polite');
  const track = document.createElement('span');
  track.className = 'form-steps__track';
  track.append(document.createElement('span'));
  bar.append(label, track);

  const nav = document.createElement('div');
  nav.className = 'form-steps__nav';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'exp-pill exp-pill--ghost';
  back.textContent = panel.dataset.stepsBack ?? 'Back';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'exp-pill';
  next.textContent = panel.dataset.stepsNext ?? 'Next';
  nav.append(back, next);

  grid.before(bar);
  grid.after(nav);
  panel.classList.add('is-stepped');
  steps.forEach((s) => s.classList.add('form-step'));

  let now = 0;
  const show = (i: number, focus = true) => {
    now = i;
    steps.forEach((s, k) => s.classList.toggle('is-now', k === i));
    const last = i === steps.length - 1;
    panel.classList.toggle('is-last', last);
    back.hidden = i === 0;
    next.hidden = last;
    label.textContent = (panel.dataset.stepsCount ?? '{n} / {total}').replace('{n}', String(i + 1)).replace('{total}', String(steps.length));
    (track.firstElementChild as HTMLElement).style.transform = `scaleX(${(i + 1) / steps.length})`;
    if (focus) steps[i].querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea')?.focus({ preventScroll: true });
  };
  const forward = () => {
    const invalid = checkWithin(steps[now]);
    if (invalid.length) return invalid[0].focus();
    if (now < steps.length - 1) show(now + 1);
    else form.requestSubmit();
  };

  back.addEventListener('click', () => show(now - 1));
  next.addEventListener('click', forward);
  form.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (e.key !== 'Enter' || t instanceof HTMLTextAreaElement || t instanceof HTMLButtonElement || t instanceof HTMLAnchorElement) return;
    e.preventDefault();
    forward();
  });
  // Sending: back to the first question that still needs an answer.
  form.addEventListener(
    'submit',
    (e) => {
      const wrong = steps.findIndex((s) => checkWithin(s).length > 0);
      if (wrong < 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      show(wrong);
    },
    { capture: true },
  );
  show(0, false);
}

export function initFormSteps() {
  if (!window.matchMedia('(min-width: 1024px)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-steps]').forEach((panel) => {
    if (panel.dataset.stepsReady) return;
    panel.dataset.stepsReady = 'true';
    initSteps(panel);
  });
}
