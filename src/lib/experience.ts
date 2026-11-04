// The shared parts of the redesigned pages (components/experience/): what they take, and small helpers
// for turning stored copy into the short pieces an interactive opening shows.

export type Tone = 'social' | 'talent' | 'education' | 'group';
/** The palette colour a section lives in (tokens.css, scripts/system/backdrop.ts). */
export type Look = 'deep' | 'navy' | 'slate' | 'ice' | 'pale' | 'frost' | 'white';

export type Media = {
  video?: string;
  poster?: string;
  image?: { src: string; alt: string };
};

/** A message beside an interactive opening: it changes as the visitor scrolls. */
export type StageMessage = {
  title?: string;
  text?: string;
  cta?: { label: string; href: string };
};

/** A glass card, and what the big card it grows into holds. */
export type Card = {
  name: string;
  text?: string | null;
  href: string;
  image?: { src: string; alt: string } | null;
  /** A drawn placeholder (SVG markup) until there's a real image (src/lib/division-art.ts). */
  art?: string;
  mark?: string;
  /** A plain link: no big card. */
  direct?: boolean;
  html?: string;
  quote?: string;
  attribution?: string;
  video?: string;
  /** `keep`: the block can be added to a list (src/scripts/system/shortlist.ts). */
  blocks?: { title: string; text?: string | null; list?: string[]; href: string; action: string; keep?: { list: 'brief' | 'creators'; id: string; label: string; group?: string } }[];
  stats?: { label: string; value: string }[];
  chips?: string[];
  action?: { label: string; href: string; external?: boolean };
};

/** How a deck's cards are laid out on desktop (components/experience/Deck.astro). */
export type DeckVariant = 'row' | 'spines' | 'lineup' | 'stairs';

export type DeckTab = {
  key: string;
  label: string;
  icon: string;
  anchor?: string;
  numbered?: boolean;
  cards: Card[];
  /** On desktop its cards don't grow: they say everything already (`still`), or go straight to their page (`go`). */
  atDesk?: 'still' | 'go';
};

const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>]+/g, '')
    .trim();

/** Stored text or Markdown as plain paragraphs. */
export const paragraphs = (text: string | null | undefined) =>
  (text ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(/\n\s*\n/)
    .map(strip)
    .filter(Boolean);

/** The paragraphs of stored HTML, as plain text. */
export const htmlParagraphs = (html: string | null | undefined) =>
  [...(html ?? '').matchAll(/<(p|h[1-6]|li)[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => strip(m[2])).filter(Boolean);

/** Long paragraphs split at sentence ends, so each step fits beside the phone. */
export const chunks = (text: string, max = 380) => {
  if (text.length <= max) return [text];
  const out: string[] = [];
  let now = '';
  for (const sentence of text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text]) {
    if (now && (now + sentence).length > max) {
      out.push(now.trim());
      now = '';
    }
    now += sentence;
  }
  if (now.trim()) out.push(now.trim());
  return out;
};

export const pad = (n: number) => String(n).padStart(2, '0');

/** Plain text as paragraphs of HTML, for a card's html. */
export const asHtml = (parts: string[]) =>
  parts.map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('');
