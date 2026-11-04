// Behaviour for group/ContactChat.astro: tapping an answer sends it as your message; Stride types for a
// moment, then replies with what that team does and a button to reach them. "Everything else" carries on as
// a conversation on desktop: the chat asks for your details itself, then sends them through the real form
// below it (form.ts), so its rules, destination and fallbacks all still apply.
import { reduced } from './ambient';

const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13.5M13 6.5 18.5 12 13 17.5"></path></svg>';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Flow = { name: string; email: string; emailBad: string; topic: string; message: string; ready: string; send: string };

function initChat(root: HTMLElement) {
  const log = root.querySelector<HTMLElement>('[data-chat-log]');
  const answers = root.querySelector<HTMLElement>('[data-chat-answers]');
  const composer = root.querySelector<HTMLFormElement>('[data-chat-composer]');
  if (!log || !answers) return;
  const flow = JSON.parse(root.dataset.flow ?? '{}') as Flow;
  const line = composer?.querySelector<HTMLInputElement>('input');
  const box = composer?.querySelector<HTMLTextAreaElement>('textarea');
  let timer = 0;
  let running = false;

  const toEnd = () => log.scrollTo({ top: log.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' });
  const say = (who: 'me' | 'them', text: string) => {
    const p = document.createElement('p');
    p.className = `bubble bubble--${who}`;
    p.textContent = text;
    log.append(p);
    toEnd();
  };
  const dots = () => {
    const typing = document.createElement('p');
    typing.className = 'bubble bubble--typing';
    typing.setAttribute('aria-hidden', 'true');
    typing.innerHTML = '<span></span><span></span><span></span>';
    log.append(typing);
    toEnd();
    return typing;
  };
  const pill = (label: string, href: string) => {
    const go = document.createElement('a');
    go.className = 'exp-pill chat__go';
    go.href = href;
    go.textContent = label;
    go.insertAdjacentHTML('beforeend', ARROW);
    log.append(go);
    toEnd();
  };
  const speak = (text: string) =>
    new Promise<void>((done) => {
      const typing = dots();
      window.setTimeout(
        () => {
          typing.remove();
          say('them', text);
          done();
        },
        reduced() ? 0 : 750,
      );
    });

  /* ---------- Asking ---------- */
  const typed = (multiline: boolean) =>
    new Promise<string>((done) => {
      if (!composer || !line || !box) return;
      const field = multiline ? box : line;
      line.hidden = multiline;
      box.hidden = !multiline;
      composer.hidden = false;
      field.value = '';
      field.focus({ preventScroll: true });
      toEnd();
      const send = (e: Event) => {
        e.preventDefault();
        const value = field.value.trim();
        if (!value) return field.focus();
        composer.removeEventListener('submit', send);
        composer.hidden = true;
        done(value);
      };
      composer.addEventListener('submit', send);
    });
  const chosen = (options: { value: string; label: string }[]) =>
    new Promise<{ value: string; label: string }>((done) => {
      const row = document.createElement('div');
      row.className = 'chat__choices';
      options.forEach((o) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chat__answer';
        b.textContent = o.label;
        b.addEventListener('click', () => {
          row.remove();
          done(o);
        });
        row.append(b);
      });
      answers.after(row);
      toEnd();
    });

  /* ---------- The conversation that ends in the real form ---------- */
  const converse = async (a: HTMLAnchorElement) => {
    const form = document.querySelector<HTMLFormElement>('#general form');
    const shell = form?.closest<HTMLElement>('[data-form]');
    if (!form || !shell || running) return;
    running = true;
    answers.hidden = true;
    say('me', a.dataset.audience ?? '');
    if (a.dataset.reply) await speak(a.dataset.reply);

    await speak(flow.name);
    const name = await typed(false);
    say('me', name);

    await speak(flow.email.replace('{name}', name));
    let email = await typed(false);
    say('me', email);
    while (!EMAIL.test(email)) {
      await speak(flow.emailBad);
      email = await typed(false);
      say('me', email);
    }

    await speak(flow.topic);
    const select = form.querySelector<HTMLSelectElement>('select[name="topic"]');
    const topic = await chosen([...(select?.options ?? [])].filter((o) => o.value).map((o) => ({ value: o.value, label: o.textContent ?? o.value })));
    say('me', topic.label);

    await speak(flow.message);
    const message = await typed(true);
    say('me', message);

    await speak(flow.ready);
    const consent = form.querySelector('.form__consent')?.textContent?.trim();
    if (consent) say('them', consent);
    await chosen([{ value: 'send', label: flow.send }]);

    // Into the real form, and out through it.
    const fill = (field: string, value: string) => {
      const c = form.elements.namedItem(field) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!c) return;
      c.value = value;
      c.dispatchEvent(new Event('input', { bubbles: true }));
      c.dispatchEvent(new Event('change', { bubbles: true }));
    };
    fill('name', name);
    fill('email', email);
    fill('topic', topic.value);
    fill('message', message);
    const typing = dots();
    const panels = ['[data-done]', '[data-unavailable]'].map((s) => shell.querySelector<HTMLElement>(s));
    const alert = form.querySelector<HTMLElement>('[data-error]');
    const watch = new MutationObserver(() => {
      const shown = panels.find((p) => p && !p.hidden);
      const failed = alert && !alert.hidden;
      if (!shown && !failed) return;
      watch.disconnect();
      typing.remove();
      if (shown) say('them', shown.querySelector('.form__panel-title')?.textContent?.trim() ?? '');
      if (shown === panels[1] || failed) {
        if (failed) say('them', alert?.querySelector('p')?.textContent?.trim() ?? '');
        const mail = (shown ?? alert)?.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
        if (mail) pill(mail.textContent?.trim() ?? '', mail.href);
      }
      running = false;
      answers.hidden = false;
      toEnd();
    });
    watch.observe(shell, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
    form.dataset.quiet = 'true';
    form.requestSubmit();
  };

  /* ---------- The answers ---------- */
  root.querySelectorAll<HTMLAnchorElement>('[data-chat-answers] a').forEach((a) =>
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (running) return;
      if (a.dataset.route === 'general' && composer && window.matchMedia('(min-width: 1024px)').matches) {
        converse(a);
        return;
      }
      window.clearTimeout(timer);
      log.querySelector('.bubble--typing')?.remove();
      say('me', a.dataset.audience ?? a.textContent ?? '');
      const typing = dots();
      timer = window.setTimeout(
        () => {
          typing.remove();
          if (a.dataset.reply) say('them', a.dataset.reply);
          pill(a.dataset.label ?? '', a.getAttribute('href') ?? '#');
        },
        reduced() ? 0 : 900,
      );
    }),
  );
}

export function initContactChats() {
  document.querySelectorAll<HTMLElement>('[data-chat]').forEach((root) => {
    if (root.dataset.chatReady) return;
    root.dataset.chatReady = 'true';
    initChat(root);
  });
}
