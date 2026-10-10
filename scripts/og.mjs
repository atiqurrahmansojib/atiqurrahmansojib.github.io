// Generates public/og.png (1200x630) with Playwright. Run: node scripts/og.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const uri = (f) => `data:font/woff2;base64,${readFileSync(f).toString('base64')}`;
const serif = uri('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2');
const sans = uri('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2');
const html = `<!doctype html><style>
@font-face{font-family:S;src:url(${serif})}
@font-face{font-family:M;src:url(${sans});font-weight:200 800}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#070d1f;color:#e9efff;font-family:M;position:relative;overflow:hidden}
.o{position:absolute;right:-180px;top:-200px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,#2f66f0,transparent 68%);filter:blur(50px);opacity:.7}
.g{position:absolute;inset:0;background-image:linear-gradient(rgba(130,160,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(130,160,255,.14) 1px,transparent 1px);background-size:72px 72px;mask-image:radial-gradient(ellipse at 50% 20%,#000 10%,transparent 70%)}
.c{position:absolute;left:80px;bottom:90px}
h1{font-family:S;font-weight:400;font-size:150px;line-height:.92;margin:0;letter-spacing:-3px}
p{font-size:34px;color:#a3b0d4;margin:28px 0 0}
.t{position:absolute;left:80px;top:70px;font-weight:700;color:#5b94ff;font-size:26px}
</style><div class=o></div><div class=g></div><div class=t>Portfolio</div>
<div class=c><h1>Atiqur Rahman</h1><p>Software developer. Java, Spring Boot, Flutter.</p></div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'public/og.png' });
await b.close();
console.log('wrote public/og.png');
