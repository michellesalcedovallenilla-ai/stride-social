// Progressive enhancement for the site's forms (brand enquiry, talent application).
// Markup: a [data-form] root holding the <form> (data-configured, data-success), a status line
// [data-status], an error alert [data-error] and two panels: [data-unavailable] (no destination
// set) and [data-done] (with [data-done-message]). Error copy comes from each control's
// data-msg-required / data-msg-invalid (core/Field, core/CheckboxGroup).
// Validates on submit and then live per field, posts with fetch (form data, JSON response) and
// swaps in the success panel. On failure the input is kept, an error with a direct email fallback
// appears and the visitor can retry. Also handles live character counts ([data-counter]) and
// repeatable rows ([data-repeat] with [data-repeat-item] and [data-repeat-add]).
// Submitted values are never logged or put in the URL.

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function controlError(c: Control): string {
  const value = c.value.trim();
  const required = c.dataset.msgRequired ?? 'This field is required';
  const invalid = c.dataset.msgInvalid ?? required;
  if (c.required && !value) return required;
  if (!value || !(c instanceof HTMLInputElement)) return '';
  if (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return invalid;
  if (c.type === 'url') {
    try {
      if (!/^https?:$/.test(new URL(value).protocol)) return invalid;
    } catch {
      return invalid;
    }
  }
  return '';
}

function setDescribedError(el: HTMLElement, errorId: string, error: string) {
  const ids = new Set((el.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean));
  if (error) ids.add(errorId);
  else ids.delete(errorId);
  if (ids.size) el.setAttribute('aria-describedby', [...ids].join(' '));
  else el.removeAttribute('aria-describedby');
}

function showControlError(c: Control, error: string) {
  const line = document.getElementById(`${c.id}-error`);
  c.closest('.field')?.classList.toggle('field--error', !!error);
  const text = line?.querySelector('.field__error-text');
  if (text) text.textContent = error;
  if (line) line.hidden = !error;
  if (error) c.setAttribute('aria-invalid', 'true');
  else c.removeAttribute('aria-invalid');
  setDescribedError(c, `${c.id}-error`, error);
}

function groupError(g: HTMLFieldSetElement): string {
  if (g.dataset.required !== 'true') return '';
  return g.querySelector('input:checked') ? '' : (g.dataset.msgRequired ?? 'Choose at least one');
}

function showGroupError(g: HTMLFieldSetElement, error: string) {
  const line = document.getElementById(`${g.id}-error`);
  g.classList.toggle('checks--error', !!error);
  const text = line?.querySelector('.checks__error-text');
  if (text) text.textContent = error;
  if (line) line.hidden = !error;
  setDescribedError(g, `${g.id}-error`, error);
}

/** Checks the fields inside part of a form (one step of form-steps.ts); returns those that need attention. */
export function checkWithin(scope: HTMLElement): HTMLElement[] {
  const invalid: HTMLElement[] = [];
  scope.querySelectorAll<Control>('.field__control').forEach((c) => {
    const error = c.closest('[hidden]') ? '' : controlError(c);
    showControlError(c, error);
    if (error) invalid.push(c);
  });
  scope.querySelectorAll<HTMLFieldSetElement>('[data-check-group]').forEach((g) => {
    const error = groupError(g);
    showGroupError(g, error);
    if (error) invalid.push(g.querySelector('input')!);
  });
  return invalid;
}

function initCounters(root: HTMLElement) {
  root.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>('[data-counter]').forEach((c) => {
    const out = document.getElementById(`${c.id}-count`);
    const update = () => {
      if (out) out.textContent = `${c.value.length} / ${c.maxLength}`;
    };
    c.addEventListener('input', update);
    update();
  });
}

function initRepeats(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-repeat]').forEach((group) => {
    const items = [...group.querySelectorAll<HTMLElement>('[data-repeat-item]')];
    const add = group.querySelector<HTMLButtonElement>('[data-repeat-add]');
    const start = Number(group.dataset.repeat) || 1;
    // Without JS every row shows; with it, empty extra rows wait behind "Add another".
    items.forEach((item, i) => {
      if (i >= start && !item.querySelector<HTMLInputElement>('input')?.value) item.hidden = true;
    });
    const sync = () => {
      if (add) add.hidden = items.every((i) => !i.hidden);
    };
    add?.addEventListener('click', () => {
      const next = items.find((i) => i.hidden);
      if (!next) return;
      next.hidden = false;
      next.querySelector('input')?.focus();
      sync();
    });
    if (add) add.hidden = false;
    sync();
  });
}

function prefill(form: HTMLFormElement) {
  const params = new URLSearchParams(location.search);
  for (const select of form.querySelectorAll<HTMLSelectElement>('select[data-prefill]')) {
    const value = params.get(select.dataset.prefill!);
    if (value && [...select.options].some((o) => o.value === value)) select.value = value;
  }
  for (const input of form.querySelectorAll<HTMLInputElement>('input[type="hidden"][data-prefill]')) {
    const value = params.get(input.dataset.prefill!);
    if (value && /^[a-z0-9-]{1,120}$/.test(value)) {
      input.value = value;
      // Show who the enquiry is about when the page knows the name (creator profiles).
      const names = JSON.parse(form.dataset.names ?? '{}') as Record<string, string>;
      const note = form.querySelector<HTMLElement>('[data-prefill-note]');
      if (note && names[value]) {
        note.querySelector('[data-prefill-name]')!.textContent = names[value];
        note.hidden = false;
      }
    }
  }
}

function initForm(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('form');
  if (!form) return;
  const controls = [...form.querySelectorAll<Control>('.field__control')];
  const groups = [...form.querySelectorAll<HTMLFieldSetElement>('[data-check-group]')];
  const status = form.querySelector<HTMLElement>('[data-status]');
  const alert = form.querySelector<HTMLElement>('[data-error]');
  const done = root.querySelector<HTMLElement>('[data-done]');
  const unavailable = root.querySelector<HTMLElement>('[data-unavailable]');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  const label = submit?.querySelector('.btn__label');
  const idleLabel = label?.textContent ?? '';
  let attempted = false;

  (form.elements.namedItem('started') as HTMLInputElement | null)?.setAttribute('value', String(Date.now()));
  prefill(form);
  initCounters(root);
  initRepeats(root);

  // Hidden rows (collapsed repeats) are skipped.
  const active = (el: HTMLElement) => !el.closest('[hidden]');
  const validate = () => {
    const invalid: HTMLElement[] = [];
    for (const c of controls) {
      const error = active(c) ? controlError(c) : '';
      showControlError(c, error);
      if (error) invalid.push(c);
    }
    for (const g of groups) {
      const error = groupError(g);
      showGroupError(g, error);
      if (error) invalid.push(g.querySelector('input')!);
    }
    return invalid.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  };

  // After the first attempt, errors update as the visitor fixes them.
  controls.forEach((c) =>
    c.addEventListener(c instanceof HTMLSelectElement ? 'change' : 'input', () => {
      if (attempted) showControlError(c, controlError(c));
    }),
  );
  groups.forEach((g) => g.addEventListener('change', () => attempted && showGroupError(g, groupError(g))));

  const setSending = (sending: boolean) => {
    root.classList.toggle('is-sending', sending);
    form.setAttribute('aria-busy', String(sending));
    if (submit) submit.disabled = sending;
    if (label) label.textContent = sending ? 'Sending…' : idleLabel;
    if (status) status.textContent = sending ? 'Sending…' : '';
  };

  const reveal = (panel: HTMLElement | null) => {
    if (!panel) return;
    form.hidden = true;
    panel.hidden = false;
    panel.focus({ preventScroll: form.dataset.quiet === 'true' });
  };

  const succeed = (name: string) => {
    const message = done?.querySelector('[data-done-message]');
    if (message) message.textContent = form.dataset.success?.replace('{name}', name) ?? '';
    reveal(done);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    attempted = true;
    if (alert) alert.hidden = true;
    const invalid = validate();
    if (invalid.length) {
      if (status) status.textContent = `${invalid.length} ${invalid.length === 1 ? 'field needs' : 'fields need'} attention.`;
      invalid[0].focus();
      return;
    }

    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    // A filled honeypot means a bot: act as if it worked and send nothing.
    if (data.get('website')) return succeed(name);
    if (form.dataset.configured !== 'true') return reveal(unavailable);

    setSending(true);
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      setSending(false);
      succeed(name);
    } catch {
      setSending(false);
      if (alert) alert.hidden = false;
      submit?.focus({ preventScroll: form.dataset.quiet === 'true' });
    }
  });
}

export function initForms() {
  document.querySelectorAll<HTMLElement>('[data-form]').forEach((root) => {
    if (root.dataset.formReady) return;
    root.dataset.formReady = 'true';
    initForm(root);
  });
}
