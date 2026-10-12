// Cleans the edges and specks of the portrait cut-out made by cutout.mjs.
// Usage: node scripts/refine-cutout.mjs in.png out.png
//  - removes light specks inside the hair near the outline,
//  - replaces the colour of edge pixels with the nearby interior colour (no pink or white fringe),
//  - smooths the jagged alpha edge.
import sharp from 'sharp';

const [, , input, output] = process.argv;
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;
const rgb = new Float32Array(N * 3);
const alpha = new Float32Array(N);
for (let i = 0; i < N; i++) { rgb[i * 3] = data[i * 4]; rgb[i * 3 + 1] = data[i * 4 + 1]; rgb[i * 3 + 2] = data[i * 4 + 2]; alpha[i] = data[i * 4 + 3]; }

// Distance (in pixels, chamfer) from each opaque pixel to the nearest transparent one.
const INF = 1e9;
const dist = new Float32Array(N).fill(INF);
for (let i = 0; i < N; i++) if (alpha[i] < 128) dist[i] = 0;
const relax = (x, y, dx, dy, c) => { const j = (y + dy) * W + (x + dx); if (y + dy >= 0 && y + dy < H && x + dx >= 0 && x + dx < W && dist[j] + c < dist[y * W + x]) dist[y * W + x] = dist[j] + c; };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { relax(x, y, -1, 0, 1); relax(x, y, 0, -1, 1); relax(x, y, -1, -1, 1.41); relax(x, y, 1, -1, 1.41); }
for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { relax(x, y, 1, 0, 1); relax(x, y, 0, 1, 1); relax(x, y, 1, 1, 1.41); relax(x, y, -1, 1, 1.41); }

// Separable box blur on weighted colour (normalised convolution), radius r.
const blurWeighted = (weights, r) => {
  const c = new Float32Array(N * 4), t = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { const w = weights[i]; c[i * 4] = rgb[i * 3] * w; c[i * 4 + 1] = rgb[i * 3 + 1] * w; c[i * 4 + 2] = rgb[i * 3 + 2] * w; c[i * 4 + 3] = w; }
  for (let y = 0; y < H; y++) for (let ch = 0; ch < 4; ch++) { let s = 0; const row = y * W;
    for (let x = -r; x <= r; x++) s += c[(row + Math.min(W - 1, Math.max(0, x))) * 4 + ch];
    for (let x = 0; x < W; x++) { t[(row + x) * 4 + ch] = s; s += c[(row + Math.min(W - 1, x + r + 1)) * 4 + ch] - c[(row + Math.max(0, x - r)) * 4 + ch]; } }
  for (let x = 0; x < W; x++) for (let ch = 0; ch < 4; ch++) { let s = 0;
    for (let y = -r; y <= r; y++) s += t[(Math.min(H - 1, Math.max(0, y)) * W + x) * 4 + ch];
    for (let y = 0; y < H; y++) { c[(y * W + x) * 4 + ch] = s; s += t[(Math.min(H - 1, y + r + 1) * W + x) * 4 + ch] - t[(Math.max(0, y - r) * W + x) * 4 + ch]; } }
  return c; // sums of weighted colour and weight
};

const lum = (i) => 0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2];
const HAIR_Y = 385; // hair lies above this row in this portrait

// 1. Specks: bright pixels near the outline of the hair that stand out from their surroundings.
const w1 = new Float32Array(N);
for (let i = 0; i < N; i++) w1[i] = alpha[i] > 200 && dist[i] > 6 ? 1 : 0;
const nb = blurWeighted(w1, 7);
let specks = 0;
const out = new Float32Array(rgb);
const bad = new Uint8Array(N);
for (let y = 0; y < HAIR_Y; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x;
  if (alpha[i] < 128 || dist[i] > 60) continue;
  const w = nb[i * 4 + 3]; if (w < 8) continue;
  const ml = (0.299 * nb[i * 4] + 0.587 * nb[i * 4 + 1] + 0.114 * nb[i * 4 + 2]) / w;
  const l = lum(i);
  const sat = Math.max(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]) - Math.min(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
  const warm = y < 170 && rgb[i * 3] - rgb[i * 3 + 2] > 8 && l > 30; // reddish dots in the upper hair (the hair itself is blue-black)
  if ((l > 75 && l - ml > 26 && sat < 120) || (dist[i] <= 12 && l - ml > 16) || warm) bad[i] = 1;
}
// Grow each speck by 2 px so its anti-aliased ring goes too.
for (let pass = 0; pass < 2; pass++) {
  const g = new Uint8Array(bad);
  for (let y = 1; y < HAIR_Y; y++) for (let x = 1; x < W - 1; x++) if (!bad[y * W + x] && alpha[y * W + x] >= 128 && (bad[y * W + x - 1] || bad[y * W + x + 1] || bad[(y - 1) * W + x] || bad[(y + 1) * W + x])) g[y * W + x] = 1;
  bad.set(g);
}
for (let i = 0; i < N; i++) if (bad[i]) {
  const w = nb[i * 4 + 3]; if (w < 8) continue;
  out[i * 3] = nb[i * 4] / w; out[i * 3 + 1] = nb[i * 4 + 1] / w; out[i * 3 + 2] = nb[i * 4 + 2] / w; specks++;
}
rgb.set(out);

// 2. Defringe: edge pixels take the colour of the interior next to them.
const w2 = new Float32Array(N);
for (let i = 0; i < N; i++) w2[i] = alpha[i] > 200 && dist[i] >= 5 ? 1 : 0;
const inner = blurWeighted(w2, 9);
for (let i = 0; i < N; i++) {
  if (alpha[i] < 8 || dist[i] >= 5) continue;
  const w = inner[i * 4 + 3]; if (w < 4) continue;
  const k = Math.max(0, Math.min(1, (5 - dist[i]) / 3.5)); // stronger right at the outline
  rgb[i * 3] += (inner[i * 4] / w - rgb[i * 3]) * k;
  rgb[i * 3 + 1] += (inner[i * 4 + 1] / w - rgb[i * 3 + 1]) * k;
  rgb[i * 3 + 2] += (inner[i * 4 + 2] / w - rgb[i * 3 + 2]) * k;
}

// 3. Smooth the jagged alpha: blur, then steepen around the middle.
const a2 = new Float32Array(N), a3 = new Float32Array(N);
const R = 2;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (let k = -R; k <= R; k++) s += alpha[y * W + Math.min(W - 1, Math.max(0, x + k))]; a2[y * W + x] = s / (2 * R + 1); }
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (let k = -R; k <= R; k++) s += a2[Math.min(H - 1, Math.max(0, y + k)) * W + x]; a3[y * W + x] = s / (2 * R + 1); }
const buf = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const a = Math.max(0, Math.min(255, (a3[i] - 100) * 1.7));
  buf[i * 4] = Math.round(rgb[i * 3]); buf[i * 4 + 1] = Math.round(rgb[i * 3 + 1]); buf[i * 4 + 2] = Math.round(rgb[i * 3 + 2]);
  buf[i * 4 + 3] = alpha[i] >= 250 && a3[i] > 250 ? 255 : Math.round(a);
}
await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(output);
console.log(`specks fixed: ${specks}; wrote ${output}`);
