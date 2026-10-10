// Removes a plain light background from a portrait and writes a PNG with transparency.
// Usage: node scripts/cutout.mjs <input.jpg> <output.png> [threshold=232]
// Method: flood-fill from the top and side edges over near-white pixels, soften the edge by one blur pass,
// then un-mix the white from edge pixels so no white halo remains. No model download, no network.
import sharp from 'sharp';
const [input, output, thr = '232'] = process.argv.slice(2);
const T = Number(thr);
const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const isBg = (i) => Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) >= T;
const bg = new Uint8Array(w * h);
const stack = [];
const seed = (x, y) => { const i = y * w + x; if (!bg[i] && isBg(i)) { bg[i] = 1; stack.push(i); } };
for (let x = 0; x < w; x++) seed(x, 0);
for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); } // bottom row is not seeded: the shirt touches it
while (stack.length) {
  const i = stack.pop(); const x = i % w, y = (i / w) | 0;
  if (x > 0) seed(x - 1, y); if (x < w - 1) seed(x + 1, y); if (y > 0) seed(x, y - 1); if (y < h - 1) seed(x, y + 1);
}
// Eat the light fringe: up to 3 passes, a pixel next to background that is still fairly light becomes background.
for (let pass = 0; pass < 3; pass++) {
  const add = [];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    if (bg[i] || Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) < 140) continue;
    if (bg[i - 1] || bg[i + 1] || bg[i - w] || bg[i + w]) add.push(i);
  }
  for (const i of add) bg[i] = 1;
}
// Soft alpha: 3x3 box blur of the background mask, twice (about 2px feather).
let m = Float32Array.from(bg);
for (let pass = 0; pass < 2; pass++) {
  const o = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h) { s += m[yy * w + xx]; n++; } }
    o[y * w + x] = s / n;
  }
  m = o;
}
const out = Buffer.alloc(w * h * 4);
for (let i = 0; i < w * h; i++) {
  const a = Math.min(1, Math.max(0, 1 - m[i] * 1.15)); // slight choke to hide the halo
  for (let c = 0; c < 3; c++) {
    let v = data[i * 3 + c];
    if (a > 0 && a < 1) v = Math.min(255, Math.max(0, (v - (1 - a) * 255) / a)); // remove white contamination
    out[i * 4 + c] = v;
  }
  out[i * 4 + 3] = Math.round(a * 255);
}
await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(output);
let transparent = 0; for (let i = 0; i < w * h; i++) if (out[i * 4 + 3] === 0) transparent++;
console.log(`wrote ${output} (${w}x${h}), ${(100 * transparent / (w * h)).toFixed(1)}% fully transparent`);
