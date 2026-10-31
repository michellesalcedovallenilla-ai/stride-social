// Generates the shared social image (public/og/stride-default.png, 1200×630) used by pages that
// have no image of their own: the Stride mark and wordmark on navy with the group line.
// Interim like the header lockup until the official logo files arrive. Run: node scripts/og/default-og.mjs
import sharp from 'sharp';

const navy = '#06142b';
const ice = '#c3f2fb';
const peach = '#f4c7ae';
const sun = '#ffd45c';
const mark = (x, y, s, color) => `
  <g transform="translate(${x} ${y}) scale(${s / 106})" fill="${color}">
    <path d="M53 53H0L53 0v53Z"/><path d="M53 106H0l53-53v53Z"/><path d="M106 53H53l53-53v53Z"/><path d="M106 106H53l53-53v53Z"/>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${navy}"/>
  ${mark(80, 80, 96, '#ffffff')}
  <text x="196" y="160" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="76" letter-spacing="2" fill="#ffffff">STRIDE</text>
  <text x="80" y="400" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="92" fill="#ffffff">BUILT AROUND</text>
  <text x="80" y="500" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="92" fill="${ice}">CREATORS.</text>
  <rect x="80" y="560" width="120" height="10" fill="${ice}"/>
  <rect x="210" y="560" width="120" height="10" fill="${peach}"/>
  <rect x="340" y="560" width="120" height="10" fill="${sun}"/>
  <text x="1120" y="572" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#c9d1dc">Social · Talent · Education</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og/stride-default.png');
console.log('Wrote public/og/stride-default.png');
