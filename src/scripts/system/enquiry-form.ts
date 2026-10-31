// Progressive enhancement for the brand enquiry form (src/components/social/EnquiryForm.astro).
// Validates on submit and then live per field, posts with fetch (form data, JSON response),
// and swaps in the success panel. On failure the input is kept, an error with a direct email
// fallback appears and the visitor can retry. With no destination configured it shows the
// "email us" panel. Submitted values are never logged or put in the URL.

const messages: Record<string, { required: string; invalid?: string }> = {
  name: { required: 'Enter your name' },
  company: { required: 'Enter your company name' },
  email: { required: 'Enter your work email', invalid: 'Enter an email address in the format name@example.com' },
  market: { required: 'Choose the market the campaign is for' },
  service: { required: 'Choose a service, or "Not sure yet"' },
  brief: { required: 'Tell us a little about the campaign' },
};

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function fieldError(control: Control): string {
  const value = control.value.trim();
  const msg = messages[control.name];
  if (!msg) return '';
  if (control.required && !value) return msg.required;
  if (control instanceof HTMLInputElement && control.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return msg.invalid ?? msg.required;
  return '';
}

function showError(control: Control, error: string) {
  const field = control.closest('.field');
  const line = document.getElementById(`${control.id}-error`);
  const text = line?.querySelector('.field__error-text');
  field?.classList.toggle('field--error', !!error);
  if (text) text.textContent = error;
  if (line) line.hidden = !error;
  const described = new Set((control.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean));
  if (error) {
    control.setAttribute('aria-invalid', 'true');
    described.add(`${control.id}-error`);
  } else {
    control.removeAttribute('aria-invalid');
    described.delete(`${control.id}-error`);
  }
  if (described.size) control.setAttribute('aria-describedby', [...described].join(' '));
  else control.removeAttribute('aria-describedby');
}

function prefill(form: HTMLFormElement) {
  const params = new URLSearchParams(location.search);
  const service = params.get('service');
  const select = form.elements.namedItem('service');
  if (service && select instanceof HTMLSelectElement && [...select.options].some((o) => o.value === service)) select.value = service;
  const creator = params.get('creator');
  const hidden = form.elements.namedItem('creator');
  if (creator && /^[a-z0-9-]{1,120}$/.test(creator) && hidden instanceof HTMLInputElement) hidden.value = creator;
}

function initForm(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('form');
  if (!form) return;
  const controls = [...form.querySelectorAll<Control>('.field__control')];
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

  const validate = () => {
    const invalid = controls.filter((c) => {
      const error = fieldError(c);
      showError(c, error);
      return !!error;
    });
    return invalid;
  };

  // After the first attempt, errors update as the visitor fixes them.
  controls.forEach((c) =>
    c.addEventListener(c instanceof HTMLSelectElement ? 'change' : 'input', () => {
      if (attempted) showError(c, fieldError(c));
    }),
  );

  const setSending = (sending: boolean) => {
    root.classList.toggle('is-sending', sending);
    form.setAttribute('aria-busy', String(sending));
    if (submit) submit.disabled = sending;
    if (label) label.textContent = sending ? 'Sending…' : idleLabel;
    if (status) status.textContent = sending ? 'Sending your enquiry…' : '';
  };

  const reveal = (panel: HTMLElement | null) => {
    if (!panel) return;
    form.hidden = true;
    panel.hidden = false;
    panel.focus();
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
    if (data.get('website')) {
      if (done) done.querySelector('[data-done-message]')!.textContent = form.dataset.success?.replace('{name}', name) ?? '';
      reveal(done);
      return;
    }
    if (form.dataset.configured !== 'true') {
      reveal(unavailable);
      return;
    }

    setSending(true);
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      if (done) done.querySelector('[data-done-message]')!.textContent = form.dataset.success?.replace('{name}', name) ?? '';
      reveal(done);
    } catch {
      setSending(false);
      if (alert) alert.hidden = false;
      if (status) status.textContent = '';
      submit?.focus();
      return;
    }
    setSending(false);
  });
}

export function initEnquiryForms() {
  document.querySelectorAll<HTMLElement>('[data-enquiry]').forEach((root) => {
    if (root.dataset.enquiryReady) return;
    root.dataset.enquiryReady = 'true';
    initForm(root);
  });
}
