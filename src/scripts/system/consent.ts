// Analytics consent (src/components/global/ConsentBanner.astro). Google Analytics loads only
// after "Accept", with Consent Mode v2 defaults denied until then. The choice is remembered in
// localStorage (wrapped in try/catch: private windows can block it, and then we simply ask again).
// [data-consent-open] buttons (footer "Cookie settings") reopen the banner.

type Choice = 'accept' | 'reject';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const read = (key: string): Choice | null => {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    return value?.choice === 'accept' || value?.choice === 'reject' ? value.choice : null;
  } catch {
    return null;
  }
};

const store = (key: string, choice: Choice) => {
  try {
    localStorage.setItem(key, JSON.stringify({ choice, date: new Date().toISOString() }));
  } catch {
    // Storage unavailable: the banner will ask again next visit.
  }
};

let loaded = false;
function loadGa4(id: string) {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(s);
}

export function initConsent() {
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  if (!banner || banner.dataset.ready) return;
  banner.dataset.ready = 'true';
  const key = banner.dataset.key!;
  const ga4 = banner.dataset.ga4 ?? '';

  const apply = (choice: Choice) => {
    if (choice === 'accept' && ga4) loadGa4(ga4);
  };
  const open = () => {
    banner.hidden = false;
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="reject"]')?.focus();
  };

  const saved = read(key);
  if (saved) apply(saved);
  else banner.hidden = false;

  banner.addEventListener('click', (e) => {
    const choice = (e.target as HTMLElement).closest<HTMLElement>('[data-consent-choice]')?.dataset.consentChoice as Choice | undefined;
    if (!choice) return;
    store(key, choice);
    banner.hidden = true;
    apply(choice);
    // Turning analytics off after it loaded needs a reload to drop the tag.
    if (choice === 'reject' && loaded) location.reload();
  });
  document.querySelectorAll('[data-consent-open]').forEach((btn) => btn.addEventListener('click', open));
}
