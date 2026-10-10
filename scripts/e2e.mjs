// Browser tests against the built site (./dist), run in real Chromium.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const srv = await serve('dist');
const browser = await chromium.launch();
const results = [];
const test = async (name, fn) => {
  try { await fn(); results.push(['PASS', name]); }
  catch (e) { results.push(['FAIL', name, e.message.split('\n')[0]]); }
};
const instant = (page) => page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

async function open(path, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) problems.push(`http ${r.status()}: ${r.url()}`); });
  await page.goto(srv.origin + path, { waitUntil: 'networkidle' });
  return { ctx, page, problems };
}

await test('home loads with no console errors or failed requests', async () => {
  const { ctx, page, problems } = await open('/');
  assert.match(await page.title(), /Atiqur Rahman/);
  assert.equal(await page.locator('h1').count(), 1);
  assert.deepEqual(problems, []);
  await ctx.close();
});

await test('first Tab stop is the skip link and it targets main', async () => {
  const { ctx, page } = await open('/');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.className), 'skip-link');
  await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).hash, '#main');
  await ctx.close();
});

await test('nav link scrolls to its section and scroll spy marks it current', async () => {
  const { ctx, page } = await open('/');
  await page.getByRole('link', { name: 'Skills' }).first().click();
  await page.waitForFunction(() => document.querySelector('[data-spy="skills"]')?.getAttribute('aria-current') === 'true', null, { timeout: 5000 });
  const top = await page.evaluate(() => document.getElementById('skills').getBoundingClientRect().top);
  assert.ok(top < 400 && top > -200, `skills section top at ${top}`);
  await ctx.close();
});

await test('theme toggle switches, labels itself and persists after reload', async () => {
  const { ctx, page } = await open('/');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.locator('[data-theme-toggle]').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.equal(await page.locator('[data-theme-toggle]').getAttribute('aria-label'), 'Switch to dark theme');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await ctx.close();
});

await test('hero pattern: five named marks, hover lights the matching seam', async () => {
  const { ctx, page } = await open('/');
  await page.waitForTimeout(3200);
  const names = await page.locator('.marks .dot').allTextContents();
  assert.deepEqual(names.map((n) => n.trim()), ['Spring Boot', 'Angular', 'Flutter', 'PostgreSQL', 'Docker']);
  await page.locator('.mark.waist .dot').hover();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.s-waist').evaluate((el) => getComputedStyle(el).opacity), '1');
  assert.equal(await page.locator('.s-hem').evaluate((el) => getComputedStyle(el).opacity), '0');
  await page.locator('.mark.hem .dot').focus();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.s-hem').evaluate((el) => getComputedStyle(el).opacity), '1');
  await ctx.close();
});

await test('no scroll-triggered reveal hides content: everything is visible without scrolling', async () => {
  const { ctx, page } = await open('/');
  const hidden = await page.evaluate(() => [...document.querySelectorAll('main section *')].filter((e) => getComputedStyle(e).opacity === '0' && !e.closest('.marks') && !e.closest('.seg') && !e.classList.contains('used') && !e.classList.contains('tip') && !e.closest('.pattern') && !e.closest('.rise')).length);
  assert.equal(hidden, 0);
  await ctx.close();
});

await test('reduced motion: content visible at once, no hero animation, no parallax transform', async () => {
  const { ctx, page } = await open('/', { reducedMotion: 'reduce' });
  const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.rise')).animationName);
  assert.equal(anim, 'none');
  await page.mouse.move(200, 200);
  await page.evaluate(() => scrollTo(0, 300));
  const tf = await page.evaluate(() => document.querySelector('[data-parallax]').style.transform);
  assert.equal(tf, '');
  assert.equal(await page.locator('.marks .mark').first().evaluate((el) => getComputedStyle(el).opacity), '1');
  assert.equal(await page.locator('.hero .pattern .cut').evaluate((el) => getComputedStyle(el).strokeDashoffset), '0px');
  await ctx.close();
});

await test('glow card follows the pointer', async () => {
  const { ctx, page } = await open('/');
  await instant(page);
  const card = page.locator('.glow-card').first();
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + 60, box.y + 40);
  await page.mouse.move(box.x + 80, box.y + 50);
  assert.match(await card.evaluate((el) => el.style.getPropertyValue('--mx')), /px$/);
  await ctx.close();
});

await test('RMGFlow pipeline highlights steps on hover', async () => {
  const { ctx, page } = await open('/projects/rmgflow/');
  await instant(page);
  const step = page.locator('[data-step]').nth(3);
  await step.scrollIntoViewIfNeeded();
  await step.hover();
  assert.equal(await page.locator('[data-step][data-lit]').count(), 4);
  await ctx.close();
});

await test('project pages: h1, safe external links, no private repo wording', async () => {
  const expected = { rmgflow: 'github.com/atiqurrahmansojib/RMGFLOW', tanabana: 'github.com/atiqurrahmansojib/tanabana', prokashpublications: 'github.com/atiqurrahmansojib/prokashpublications' };
  for (const [slug, needle] of Object.entries(expected)) {
    const { ctx, page, problems } = await open(`/projects/${slug}/`);
    assert.equal(await page.locator('h1').count(), 1, slug);
    assert.ok((await page.locator(`a[href*="${needle}"]`).count()) > 0, `${slug} link`);
    assert.deepEqual(problems, [], slug);
    assert.equal(await page.getByText(/private/i).count(), 0, `${slug} mentions private`);
    await ctx.close();
  }
});

await test('mobile menu opens, closes on link click and on Escape', async () => {
  const { ctx, page } = await open('/', { viewport: { width: 375, height: 800 } });
  const btn = page.locator('[data-menu-toggle]');
  const nav = page.locator('#primary-nav');
  assert.equal(await nav.isVisible(), false);
  await btn.click();
  assert.equal(await btn.getAttribute('aria-expanded'), 'true');
  assert.equal(await nav.isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await btn.getAttribute('aria-expanded'), 'false');
  await btn.click();
  await nav.getByRole('link', { name: 'About' }).click();
  assert.equal(await btn.getAttribute('aria-expanded'), 'false');
  await ctx.close();
});

await test('no horizontal overflow at 320px', async () => {
  const { ctx, page } = await open('/', { viewport: { width: 320, height: 700 } });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
  await ctx.close();
});

await test('projects index lists all three projects with source links', async () => {
  const { ctx, page, problems } = await open('/projects/');
  assert.equal(await page.locator('article.card').count(), 3);
  assert.equal(await page.locator('article.card a[href*="github.com/atiqurrahmansojib/"]').count(), 3);
  assert.deepEqual(problems, []);
  await ctx.close();
});

await test('home shows three featured cards, flagship badge, and View all link', async () => {
  const { ctx, page } = await open('/');
  assert.equal(await page.locator('#projects article.card').count(), 3);
  assert.equal(await page.getByText('Flagship project').count(), 1);
  await page.getByRole('link', { name: /View all projects/ }).click();
  await page.waitForURL(/\/projects\/$/);
  await ctx.close();
});

await test('scholarship training: official link, course topics, shown as completed, no invented date, certificate or grade', async () => {
  const { ctx, page } = await open('/');
  const link = page.locator('#experience a[href="https://apply.idb-bisew.info/Home/CourseDeatils/1#jee"]');
  assert.equal(await link.count(), 1);
  assert.match(await page.locator('#train-title').textContent(), /Spring Boot, Android & Flutter/);
  assert.equal(await page.locator('#experience .badges .badge').count(), 15);
  assert.equal(await page.locator('#experience .modules li').count(), 7);
  assert.match(await page.locator('#experience .modules').textContent(), /Oracle 19c[\s\S]*Angular[\s\S]*Flutter/);
  const entry = await page.locator('#experience .item').first().textContent();
  assert.match(entry, /Completed/); assert.equal(/Dates:|Status:/.test(entry), false);
  const text = (await page.locator('main').textContent()).toLowerCase();
  for (const bad of ['certificate', 'graduat', 'diploma', 'award', 'grade', 'gpa', 'cgpa', 'distinction']) assert.equal(text.includes(bad), false, `claims "${bad}"`);
  assert.match(await page.locator('#about').textContent(), /IsDB-BISEW IT Scholarship Programme/);
  await ctx.close();
});

await test('no leftover placeholders; CV link is disabled until public/cv.pdf exists', async () => {
  const { ctx, page } = await open('/');
  assert.equal(await page.locator('.placeholder').count(), 0);
  assert.equal(await page.locator('.cv[aria-disabled="true"], a.cv[href="/cv.pdf"]').count(), 1);
  await ctx.close();
});

await test('SEO basics: canonical, description, og:image, sitemap, robots', async () => {
  const { ctx, page } = await open('/');
  assert.match(await page.locator('link[rel=canonical]').getAttribute('href'), /^https:\/\/atiqur-rahman\.me\/$/);
  assert.ok((await page.locator('meta[name=description]').getAttribute('content')).length > 50);
  assert.match(await page.locator('meta[property="og:image"]').getAttribute('content'), /og\.png$/);
  for (const f of ['/og.png', '/sitemap-index.xml', '/robots.txt']) assert.equal((await ctx.request.get(srv.origin + f)).status(), 200, f);
  await ctx.close();
});


// ---- Pattern marks on phones, tablets and desktops -------------------------------------------
const MARKS = [['neck', 'Spring Boot', 'Backend, RMGFlow and Tanabana'], ['shoulder', 'Angular', 'Web client, Tanabana'], ['armhole', 'Flutter', 'Mobile app, RMGFlow'], ['waist', 'PostgreSQL', 'Data, both systems'], ['hem', 'Docker', 'Packaging, Tanabana']];
const idleCaption = 'Tap a mark to see what I used it for.';
const settle = (page) => page.waitForTimeout(3800); // drawing sequence and mark pop-in

for (const w of [320, 360, 390, 412, 768]) {
  await test(`marks @${w}px touch: each tap names the mark, lights its seam, one at a time; outside tap and Escape clear`, async () => {
    const { ctx, page, problems } = await open('/', { viewport: { width: w, height: 800 }, hasTouch: true, isMobile: true });
    await settle(page);
    const seam = { neck: 's-neck', shoulder: 's-shoulder', armhole: 's-armhole', waist: 's-waist', hem: 's-hem' };
    for (const [cls, tech, role] of MARKS) {
      await page.locator(`.mark.${cls} .dot`).tap();
      await page.waitForTimeout(450);
      assert.equal(await page.locator('.marks .dot[aria-pressed="true"]').count(), 1, `${cls}: one pressed`);
      assert.equal(await page.locator('[data-caption]').textContent(), `${tech}: ${role}`, `${cls}: caption`);
      assert.equal(await page.locator(`.${seam[cls]}`).evaluate((el) => getComputedStyle(el).opacity), '1', `${cls}: seam lit`);
    }
    await page.locator('#hero-title').tap();
    assert.equal(await page.locator('[data-caption]').textContent(), idleCaption, 'outside tap clears');
    await page.locator('.mark.neck .dot').tap();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-caption]').textContent(), idleCaption, 'Escape clears');
    assert.deepEqual(problems, []);
    await ctx.close();
  });

  await test(`marks @${w}px: touch targets >= 44px, no overlap, nothing covers them, caption inside viewport, no overflow`, async () => {
    const { ctx, page } = await open('/', { viewport: { width: w, height: 800 }, hasTouch: true, isMobile: true });
    await settle(page);
    const info = await page.evaluate((w) => {
      const dots = [...document.querySelectorAll('.marks .dot')];
      const boxes = dots.map((d) => d.getBoundingClientRect());
      const small = boxes.filter((b) => b.width < 43.9 || b.height < 43.9).length;
      let overlap = 0;
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) overlap++;
      }
      const covered = dots.filter((d, i) => { const b = boxes[i]; const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !(el === d || d.contains(el)); }).length;
      const cap = document.querySelector('[data-caption]');
      const cb = cap && getComputedStyle(cap).display !== 'none' ? cap.getBoundingClientRect() : null;
      const offscreen = dots.filter((d, i) => boxes[i].left < 0 || boxes[i].right > innerWidth).length;
      return { small, overlap, covered, offscreen, capOk: w >= 832 || (cb && cb.left >= 0 && cb.right <= innerWidth), overflow: document.documentElement.scrollWidth > innerWidth };
    }, w);
    assert.deepEqual(info, { small: 0, overlap: 0, covered: 0, offscreen: 0, capOk: true, overflow: false });
    await ctx.close();
  });
}

for (const w of [1024, 1280, 1440]) {
  await test(`marks @${w}px desktop: name chips readable (>=12px), inside the viewport and not overlapping each other`, async () => {
    const { ctx, page } = await open('/', { viewport: { width: w, height: 800 } });
    await settle(page);
    const r = await page.evaluate(() => {
      const tips = [...document.querySelectorAll('.marks .tip')];
      const boxes = tips.map((t) => t.getBoundingClientRect());
      let overlap = 0;
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) overlap++;
      }
      const dots = [...document.querySelectorAll('.marks .dot')].map((d) => d.getBoundingClientRect());
      let tipOnOtherDot = 0;
      boxes.forEach((a, i) => dots.forEach((d, j) => { if (i !== j && a.left < d.right - 14 && d.left + 14 < a.right && a.top < d.bottom - 14 && d.top + 14 < a.bottom) tipOnOtherDot++; }));
      return { shown: tips.every((t) => getComputedStyle(t).display !== 'none'), minFont: Math.min(...tips.map((t) => parseFloat(getComputedStyle(t).fontSize))), inside: boxes.every((b) => b.left >= 0 && b.right <= innerWidth), overlap, tipOnOtherDot };
    });
    assert.equal(r.shown, true); assert.ok(r.minFont >= 12, `font ${r.minFont}`); assert.equal(r.inside, true); assert.equal(r.overlap, 0, 'tips overlap'); assert.equal(r.tipOnOtherDot, 0, 'tip covers another mark');
    await ctx.close();
  });
}

await test('marks: keyboard Tab reaches all five in order, focus ring is visible, Enter toggles', async () => {
  const { ctx, page } = await open('/', { viewport: { width: 1280, height: 800 } });
  await settle(page);
  await page.locator('.mark.neck .dot').focus();
  const seen = [];
  for (let i = 0; i < 5; i++) {
    const name = await page.evaluate(() => document.activeElement?.textContent?.trim());
    seen.push(name);
    if (i === 0) {
      await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
      const ring = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) }; });
      assert.notEqual(ring.style, 'none'); assert.ok(ring.width >= 2, 'ring width');
    }
    await page.keyboard.press('Tab');
  }
  assert.deepEqual(seen, ['Spring Boot', 'Angular', 'Flutter', 'PostgreSQL', 'Docker']);
  await page.locator('.mark.waist .dot').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.mark.waist .dot').getAttribute('aria-pressed'), 'true');
  await ctx.close();
});

await test('marks @360px reduced motion: drawing and marks fully visible at once, tap still works', async () => {
  const { ctx, page } = await open('/', { viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  assert.equal(await page.locator('.hero .pattern .cut').evaluate((el) => getComputedStyle(el).strokeDashoffset), '0px');
  assert.equal(await page.locator('.mark.hem').evaluate((el) => getComputedStyle(el).opacity), '1');
  assert.equal(await page.locator('.mark.hem .dot').evaluate((el) => getComputedStyle(el, '::before').transitionDuration), '0s');
  await page.locator('.mark.hem .dot').tap();
  assert.equal(await page.locator('[data-caption]').textContent(), 'Docker: Packaging, Tanabana');
  await ctx.close();
});

await browser.close();
srv.close();
for (const r of results) console.log(r.join('  '));
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(failed ? `e2e: ${failed} failed` : `e2e: ${results.length} passed`);
process.exit(failed ? 1 : 0);
