// Brand logos arrive as transparent squares with the mark somewhere inside a lot of padding.
// This measures the visible mark at build time and returns mask size/position (in cqi, relative
// to the logo box width) that fit every mark to the same optical box, whatever its shape.
import path from 'node:path';
import sharp from 'sharp';

/** Box height as a share of its width, and how much of the box a mark may fill. */
const BOX_RATIO = 0.4;
const FILL_W = 0.9;
const FILL_H = 0.78;

export async function logoFit(src: string) {
  const file = path.join('public', src);
  const [{ width: canvasW = 1, height: canvasH = 1 }, { info }] = await Promise.all([
    sharp(file).metadata(),
    sharp(file).trim().toBuffer({ resolveWithObject: true }),
  ]);
  const left = -(info.trimOffsetLeft ?? 0);
  const top = -(info.trimOffsetTop ?? 0);
  const scale = Math.min(FILL_W / info.width, (FILL_H * BOX_RATIO) / info.height);
  const x = 0.5 - (left + info.width / 2) * scale;
  const y = BOX_RATIO / 2 - (top + info.height / 2) * scale;
  const pct = (n: number) => `${(n * 100).toFixed(2)}cqi`;
  return `--logo-size: ${pct(canvasW * scale)} ${pct(canvasH * scale)}; --logo-pos: ${pct(x)} ${pct(y)};`;
}
