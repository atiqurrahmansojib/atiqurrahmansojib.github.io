// Generates public/og.png (1200x630) with Playwright. Run: node scripts/og.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const uri = (f, type) => `data:${type};base64,${readFileSync(f).toString('base64')}`;
const syne = uri('node_modules/@fontsource-variable/syne/files/syne-latin-wght-normal.woff2', 'font/woff2');
const inter = uri('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'font/woff2');
const photo = uri('src/assets/profile.png', 'image/png');
const html = `<!doctype html><style>
@font-face{font-family:S;src:url(${syne});font-weight:400 800}
@font-face{font-family:I;src:url(${inter});font-weight:100 900}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#07120e;color:#e8f0ea;font-family:I;position:relative;overflow:hidden}
.arch{position:absolute;right:90px;top:70px;width:400px;height:560px;border-radius:200px 200px 0 0;background:linear-gradient(170deg,#153027,#0f221b 70%);border:1px solid rgba(222,238,228,.3)}
.line{position:absolute;right:68px;top:92px;width:400px;height:538px;border:2px solid #f2b84b;border-bottom:0;border-radius:200px 200px 0 0}
.photo{position:absolute;right:90px;top:20px;width:400px;height:610px;overflow:hidden}
.photo img{position:absolute;left:-80px;bottom:0;width:560px}
.c{position:absolute;left:80px;top:150px}
h1{font-family:S;font-weight:700;font-size:104px;line-height:.98;margin:0;letter-spacing:-5px}
.r{font-family:S;font-weight:700;font-size:44px;color:#f2b84b;margin:34px 0 0;letter-spacing:-1.5px}
p.t{font-size:28px;color:#9fb4a9;margin:18px 0 0;max-width:520px;line-height:1.35}
</style><div class=line></div><div class=arch></div><div class=photo><img src="${photo}"></div>
<div class=c><h1>Atiqur<br>Rahman</h1><p class=r>Full-Stack Developer</p><p class=t>Java, Spring Boot, Angular and Flutter.</p></div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
await p.screenshot({ path: 'public/og.png' });
await b.close();
console.log('wrote public/og.png');
