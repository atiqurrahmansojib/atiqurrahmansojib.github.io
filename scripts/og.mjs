// Generates public/og.png (1200x630) with Playwright. Run: node scripts/og.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const uri = (f, type) => `data:${type};base64,${readFileSync(f).toString('base64')}`;
const display = uri('node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wdth-normal.woff2', 'font/woff2');
const inter = uri('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'font/woff2');
const photo = uri('src/assets/profile.png', 'image/png');
const html = `<!doctype html><style>
@font-face{font-family:D;src:url(${display});font-weight:200 800;font-stretch:75% 100%}
@font-face{font-family:I;src:url(${inter});font-weight:100 900}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#090b11;color:#ece9e2;font-family:I;position:relative;overflow:hidden}
.o1{position:absolute;right:-220px;top:-260px;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(63,91,255,.5),transparent 66%)}
.o2{position:absolute;left:-260px;bottom:-320px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(109,93,252,.38),transparent 66%)}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(236,233,226,.2) 1.2px,transparent 1.6px);background-size:30px 30px;-webkit-mask-image:radial-gradient(ellipse 85% 70% at 50% 40%,#000 20%,transparent 78%)}
.photo{position:absolute;right:30px;bottom:0;width:560px;height:600px;overflow:hidden}
.photo img{position:absolute;left:-10px;bottom:-10px;width:580px}
.c{position:absolute;left:76px;top:120px}
h1{font-family:D;font-weight:800;font-stretch:75%;font-size:176px;line-height:.8;margin:0;letter-spacing:-6px}
.r{font-family:D;font-weight:700;font-stretch:85%;font-size:50px;margin:44px 0 0;letter-spacing:-1.5px}
p.t{font-size:27px;color:#a3b0d4;margin:14px 0 0}
</style><div class=o1></div><div class=o2></div><div class=dots></div><div class=photo><img src="${photo}"></div>
<div class=c><h1>Atiqur<br>Rahman</h1><p class=r>Full-Stack Developer</p><p class=t>Java, Spring Boot, Angular and Flutter</p></div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
await p.screenshot({ path: 'public/og.png' });
await b.close();
console.log('wrote public/og.png');
