// Case-study campaign videos are hosted on Flowdrive's public CDN, not Webflow's.
// extract-content.mjs lists them in flowdrive-videos.json; this saves each one to
// public/assets/video/flowdrive-<id>.mp4 (the path the content entries already use).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const videos = JSON.parse(fs.readFileSync(path.join(root, 'scripts/migrate/flowdrive-videos.json'), 'utf8'));
const outDir = path.join(root, 'public/assets/video');
fs.mkdirSync(outDir, { recursive: true });

let bytes = 0;
for (const { src } of videos) {
  const dest = path.join(outDir, `flowdrive-${src.split('/').pop()}.mp4`);
  if (fs.existsSync(dest)) continue;
  const res = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0 (site-migration)' } });
  if (!res.ok) { console.warn('FAIL', res.status, src); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  bytes += buf.length;
}
console.log(`saved ${videos.length} videos, ${(bytes / 1e6).toFixed(1)} MB downloaded`);
