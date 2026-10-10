// Accessibility check: serves ./dist, then runs axe-core on every page in light, dark and phone width.
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = resolve('dist');

async function pages(dir, base = '') {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...(await pages(join(dir, e.name), `${base}/${e.name}`)));
    else if (e.name === 'index.html') out.push(base ? `${base}/` : '/');
    else if (e.name === '404.html') out.push('/404.html');
  }
  return out;
}

const { serve } = await import('./serve.mjs');
const srv = await serve('dist');
const origin = srv.origin;

const browser = await chromium.launch();
let failures = 0;
const routes = await pages(root);
for (const scheme of ['light', 'dark']) {
  for (const [label, viewport] of [['desktop', { width: 1280, height: 900 }], ['phone', { width: 375, height: 760 }]]) {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport, reducedMotion: 'reduce' });
    for (const route of routes) {
      const page = await ctx.newPage();
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 40)); } scrollTo({ top: 0, behavior: 'instant' }); });
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      if (overflow) { failures++; console.error(`FAIL ${scheme}/${label} ${route}: horizontal overflow`); }
      for (const v of violations) {
        failures++;
        console.error(`FAIL ${scheme}/${label} ${route}: ${v.id} (${v.impact}) ${v.help}`);
        for (const n of v.nodes.slice(0, 3)) console.error(`   ${n.target.join(' ')}`);
      }
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
srv.close();
console.log(failures ? `a11y: ${failures} problem(s)` : `a11y: ${routes.length} pages x 4 variants passed`);
process.exit(failures ? 1 : 0);
