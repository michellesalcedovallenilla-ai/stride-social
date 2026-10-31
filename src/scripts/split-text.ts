// Split-text reveals, replacing SplitType + GSAP ScrollTrigger from the live site.
// Markup: <h2 data-split="words-slide-up">…</h2>. Effects:
//   words-slide-up · words-slide-from-right · letters-slide-up · letters-fade-in
//   scrub-each-word (word opacity follows scroll position)
// Reveals play when the element's top passes 60% of the viewport and reset once it drops
// back below the viewport, like the original ScrollTrigger setup.

type Effect = 'words-slide-up' | 'words-slide-from-right' | 'letters-slide-up' | 'letters-fade-in' | 'scrub-each-word';

const TIMING: Record<Exclude<Effect, 'scrub-each-word'>, { unit: 'word' | 'char'; duration: number; stagger: number; ease: string }> = {
  'words-slide-up': { unit: 'word', duration: 0.5, stagger: 0.5, ease: 'cubic-bezier(0.34, 1.8, 0.64, 1)' },
  'words-slide-from-right': { unit: 'word', duration: 0.6, stagger: 0.2, ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
  'letters-slide-up': { unit: 'char', duration: 0.2, stagger: 0.6, ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
  'letters-fade-in': { unit: 'char', duration: 0.2, stagger: 0.8, ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
};

/** Wraps every word in span.word and every character in span.char, keeping inline markup. */
function split(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const parts = (node.textContent ?? '').split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(document.createTextNode(' '));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'word';
      for (const ch of part) {
        const c = document.createElement('span');
        c.className = 'char';
        c.textContent = ch;
        word.append(c);
      }
      frag.append(word);
    }
    node.replaceWith(frag);
  }
}

function setupReveal(el: HTMLElement, effect: Exclude<Effect, 'scrub-each-word'>) {
  const t = TIMING[effect];
  const targets = [...el.querySelectorAll<HTMLElement>(`.${t.unit}`)];
  const step = targets.length > 1 ? t.stagger / (targets.length - 1) : 0;
  const hidden = (s: CSSStyleDeclaration) => {
    s.transition = 'none';
    if (effect === 'words-slide-up') { s.opacity = '0'; s.transform = 'translateY(110%)'; }
    if (effect === 'words-slide-from-right') { s.opacity = '0'; s.transform = 'translateX(1em)'; }
    if (effect === 'letters-slide-up') s.transform = 'translateY(110%)';
    if (effect === 'letters-fade-in') s.opacity = '0';
  };
  const reset = () => targets.forEach((n) => hidden(n.style));
  const play = () =>
    targets.forEach((n, i) => {
      n.style.transition = `opacity ${t.duration}s ${t.ease} ${i * step}s, transform ${t.duration}s ${t.ease} ${i * step}s`;
      n.style.opacity = '';
      n.style.transform = '';
    });
  reset();
  let shown = false;
  const check = () => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!shown && r.top < vh * 0.6) { shown = true; play(); }
    else if (shown && r.top > vh) { shown = false; reset(); }
  };
  return check;
}

function setupScrub(el: HTMLElement) {
  const words = [...el.querySelectorAll<HTMLElement>('.word')];
  const total = 0.4 * (words.length - 1) + 0.2;
  return () => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.5 + r.height)));
    const time = p * total;
    words.forEach((w, i) => {
      const local = Math.min(1, Math.max(0, (time - 0.4 * i) / 0.2));
      const eased = 1 - (1 - local) * (1 - local);
      w.style.opacity = String(0.2 + 0.8 * eased);
    });
  };
}

export function initSplitText() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-split]')];
  if (!els.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const checks: (() => void)[] = [];
  for (const el of els) {
    const effect = el.dataset.split as Effect;
    split(el);
    el.classList.add('is-split');
    if (reduced) continue;
    checks.push(effect === 'scrub-each-word' ? setupScrub(el) : setupReveal(el, effect));
  }
  let ticking = false;
  const run = () => {
    ticking = false;
    checks.forEach((c) => c());
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(run); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  run();
}
