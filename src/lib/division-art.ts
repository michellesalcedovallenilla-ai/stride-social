// Placeholder images for Stride Talent's divisions, drawn in the palette, until each has a real photograph (set
// `hero` on its entry in the talentDivisions collection and the photo takes over). They only say what the division
// is about: no people, brands or results. Deck marks them data-placeholder, so `check:placeholders` still counts them.
const svg = (body: string) =>
  `<svg viewBox="0 0 240 400" preserveAspectRatio="xMidYMin slice" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const lanes = [0, 1, 2, 3, 4, 5]
  .map((i) => `<path d="M${-60 + i * 34} 420 C ${10 + i * 26} ${300 - i * 8}, ${110 + i * 16} ${226 - i * 6}, 300 ${196 - i * 13}" stroke-width="${2.6 - i * 0.28}" opacity="${0.9 - i * 0.11}"/>`)
  .join('');

const grooves = [108, 96, 84, 72, 60]
  .map((r, i) => `<circle cx="156" cy="136" r="${r}" stroke-width="1" opacity="${0.26 + i * 0.09}"/>`)
  .join('');

const waves = [46, 66, 86]
  .map((r, i) => `<path d="M${120 - r} 92 a${r} ${r} 0 0 0 0 ${r * 1.1}" opacity="${0.75 - i * 0.2}" stroke-width="1.8"/><path d="M${120 + r} 92 a${r} ${r} 0 0 1 0 ${r * 1.1}" opacity="${0.75 - i * 0.2}" stroke-width="1.8"/>`)
  .join('');

const seats = [0, 1, 2, 3]
  .map((row) => {
    const n = 9 + row * 2;
    return Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * (i + 0.5)) / n;
      const r = 92 + row * 26;
      return `<circle cx="${(120 - Math.cos(a) * r * 1.2).toFixed(1)}" cy="${(170 + Math.sin(a) * r * 0.62).toFixed(1)}" r="${3 + row * 0.5}" fill="currentColor" stroke="none" opacity="${0.72 - row * 0.13}"/>`;
    }).join('');
  })
  .join('');

export const divisionArt: Record<string, string> = {
  // A running track, curving away towards the sun.
  sport: svg(`<circle cx="124" cy="104" r="44" fill="currentColor" fill-opacity="0.14" stroke-width="1.4" opacity="0.8"/><circle cx="124" cy="104" r="64" stroke-width="1" opacity="0.26"/>${lanes}`),
  // Ranges of mountains, and a route flown over them.
  travel: svg(`<path d="M-10 268 L52 176 L92 226 L146 136 L250 262 V420 H-10Z" fill="currentColor" fill-opacity="0.1" stroke-width="1.4" opacity="0.62"/><path d="M-10 316 L44 262 L96 300 L168 226 L250 306 V420 H-10Z" fill="currentColor" fill-opacity="0.13" stroke-width="1.4" opacity="0.8"/><path d="M26 158 C 70 52, 158 40, 206 92" stroke-width="1.8" stroke-dasharray="1 8"/><circle cx="26" cy="158" r="4.5" fill="currentColor" stroke="none"/><path d="M208 94 l-21 -3 5 -5 -9 -13 5 -2 15 11 8 -3 c4 -1 6 3 3 5 l-7 4 2 18 -5 2 z" fill="currentColor" stroke="none"/>`),
  // A studio microphone, and the sound coming off it.
  podcasts: svg(`${waves}<rect x="88" y="44" width="64" height="118" rx="32" fill="currentColor" fill-opacity="0.14" stroke-width="2"/><path d="M88 80 H114 M88 98 H114 M88 116 H114 M126 80 H152 M126 98 H152 M126 116 H152" stroke-width="1.5" opacity="0.7"/><path d="M70 128 v8 a50 50 0 0 0 100 0 v-8" stroke-width="2"/><path d="M120 186 V238 M86 238 H154" stroke-width="2.4"/>`),
  // A record on the platter, the arm coming in.
  music: svg(`<circle cx="156" cy="136" r="120" fill="currentColor" fill-opacity="0.08" stroke-width="2"/>${grooves}<circle cx="156" cy="136" r="34" fill="currentColor" fill-opacity="0.32" stroke-width="1.6"/><circle cx="156" cy="136" r="4" fill="currentColor" stroke="none"/><path d="M28 28 L38 150 L86 202" stroke-width="3"/><circle cx="28" cy="28" r="9" fill="currentColor" fill-opacity="0.3" stroke-width="1.8"/><path d="M80 194 l16 14 -9 8 -14 -13z" fill="currentColor" stroke="none"/>`),
  // A lectern on a stage, with the room in front of it.
  speakers: svg(`<path d="M-10 142 C 50 118, 190 118, 250 142" stroke-width="1.6" opacity="0.5"/><path d="M92 92 H148 L140 158 H100Z" fill="currentColor" fill-opacity="0.2" stroke-width="2"/><path d="M84 92 H156" stroke-width="3"/><path d="M120 92 C 120 70, 132 58, 146 50" stroke-width="2"/><rect x="143" y="38" width="13" height="19" rx="6.5" transform="rotate(32 149 47)" fill="currentColor" stroke="none"/>${seats}`),
};
