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

await test('hero: name, portrait, tagline and calls to action; nothing covers the buttons', async () => {
  for (const [w, h] of [[390, 844], [768, 900], [1280, 800], [1440, 900]]) {
    const { ctx, page } = await open('/', { viewport: { width: w, height: h } });
    await page.waitForTimeout(2600);
    assert.match(await page.locator('h1').textContent(), /Atiqur\s*Rahman/);
    assert.match(await page.locator('.hero img').getAttribute('alt'), /Portrait of Atiqur Rahman/);
    assert.match(await page.locator('.tag').textContent(), /full-stack business applications[\s\S]*Java, Spring Boot, Angular and Flutter/);
    for (const name of ['See the work', 'Get in touch']) {
      const link = page.getByRole('link', { name: new RegExp(name) });
      await link.scrollIntoViewIfNeeded();
      const hit = await link.evaluate((el) => { const b = el.getBoundingClientRect(); const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return el === top || el.contains(top); });
      assert.equal(hit, true, `${name} covered at ${w}px`);
    }
    const settled = await page.locator('.word').first().evaluate((el) => getComputedStyle(el).transform);
    assert.ok(settled === 'none' || settled === 'matrix(1, 0, 0, 1, 0, 0)', `name still moving: ${settled}`);
    await ctx.close();
  }
});

await test('scroll reveals: below-the-fold content waits, then everything shows after a fast jump to the bottom', async () => {
  const { ctx, page } = await open('/');
  await page.waitForTimeout(2600);
  const waiting = await page.locator('#contact [data-reveal]:not([data-in])').count();
  assert.ok(waiting > 0, 'contact content should wait until it is near');
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(300);
  assert.equal(await page.locator('[data-reveal]:not([data-in])').count(), 0, 'elements skipped by the jump stayed hidden');
  await page.waitForTimeout(1200);
  const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity !== '1').length);
  assert.equal(hidden, 0);
  await ctx.close();
});

await test('scroll reveals: content is visible with reduced motion and with JavaScript off', async () => {
  for (const opts of [{ reducedMotion: 'reduce' }, { javaScriptEnabled: false }]) {
    const { ctx, page } = await open('/', opts);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity !== '1').length);
    assert.equal(hidden, 0, JSON.stringify(opts));
    await ctx.close();
  }
});

await test('hero states the Full-Stack Developer role and the page title carries it', async () => {
  const { ctx, page } = await open('/');
  assert.match(await page.locator('.role').textContent(), /Full-Stack Developer/);
  assert.match(await page.title(), /Full-Stack Developer/);
  await ctx.close();
});

await test('pipeline lights its steps in order once when revealed, then clears', async () => {
  const { ctx, page } = await open('/');
  await instant(page);
  await page.locator('#projects [data-flow]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  const mid = await page.locator('#projects [data-flow] [data-step][data-lit]').count();
  assert.ok(mid > 0 && mid < 12, `mid-sequence lit ${mid}`);
  await page.waitForTimeout(2600);
  assert.equal(await page.locator('#projects [data-flow] [data-step][data-lit]').count(), 0);
  await ctx.close();
});

await test('page transitions: a project title and its page share a transition name; header keeps its own', async () => {
  const { ctx, page } = await open('/');
  const home = await page.locator('#projects article.case').nth(1).locator('.title').getAttribute('style');
  assert.match(home, /view-transition-name:\s*p-tanabana/);
  assert.match(await page.locator('[data-header]').getAttribute('style'), /view-transition-name:\s*site-header/);
  await page.goto(srv.origin + '/projects/tanabana/', { waitUntil: 'networkidle' });
  assert.match(await page.locator('h1').getAttribute('style'), /view-transition-name:\s*p-tanabana/);
  await ctx.close();
});

await test('reduced motion: no entrance animation anywhere in the hero', async () => {
  const { ctx, page } = await open('/', { reducedMotion: 'reduce' });
  for (const sel of ['.word', '.portrait', '.lower']) assert.equal(await page.locator(sel).first().evaluate((el) => getComputedStyle(el).animationName), 'none', sel);
  assert.equal(await page.locator('.portrait').evaluate((el) => getComputedStyle(el).opacity), '1');
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
  const expected = { rmgflow: 'github.com/atiqurrahmansojib/RMGFLOW', tanabana: 'github.com/atiqurrahmansojib/tanabana' };
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

await test('projects index lists both projects with source links', async () => {
  const { ctx, page, problems } = await open('/projects/');
  assert.equal(await page.locator('article.case').count(), 2);
  assert.equal(await page.locator('article.case a[href*="github.com/atiqurrahmansojib/"]').count(), 2);
  assert.deepEqual(problems, []);
  await ctx.close();
});

await test('home work section: RMGFlow and Tanabana lead with real figures, links work, All projects link works', async () => {
  const { ctx, page } = await open('/');
  assert.equal(await page.locator('#projects article.case').count(), 2);
  const rmg = page.locator('#projects article.case').nth(0);
  const tan = page.locator('#projects article.case').nth(1);
  assert.match(await rmg.locator('.title').textContent(), /RMGFlow/);
  assert.match(await tan.locator('.title').textContent(), /Tanabana/);
  assert.match(await rmg.locator('.stats').textContent(), /Connected modules\s*12/);
  assert.doesNotMatch(await rmg.locator('.stats').textContent(), /48|tests/i);
  assert.match(await tan.locator('.stats').textContent(), /Roadmap modules[\s\S]*14[\s\S]*1,266/);
  assert.equal(await rmg.locator('[data-step]').count(), 12);
  assert.ok((await rmg.locator('a[href="https://github.com/atiqurrahmansojib/RMGFLOW"]').count()) === 1);
  assert.ok((await tan.locator('a[href="https://github.com/atiqurrahmansojib/tanabana"]').count()) === 1);
  await tan.locator('.stretch').click();
  await page.waitForURL(/\/projects\/tanabana\/$/);
  await page.goBack();
  await page.getByRole('link', { name: /All projects/ }).click();
  await page.waitForURL(/\/projects\/$/);
  await ctx.close();
});

await test('layout: top bar with inline nav on wide screens, menu button on small ones', async () => {
  const wide = await open('/', { viewport: { width: 1280, height: 800 } });
  const bar = await wide.page.locator('[data-header]').boundingBox();
  assert.ok(bar.height < 100 && bar.width >= 1279, JSON.stringify(bar));
  assert.equal(await wide.page.locator('[data-menu-toggle]').isVisible(), false);
  assert.equal(await wide.page.locator('#primary-nav').isVisible(), true);
  await wide.ctx.close();
  const narrow = await open('/', { viewport: { width: 390, height: 800 } });
  assert.equal(await narrow.page.locator('[data-menu-toggle]').isVisible(), true);
  await narrow.ctx.close();
});

await test('contact: email link, copy button reports success, LinkedIn and GitHub links are real', async () => {
  const { ctx, page } = await open('/', { permissions: ['clipboard-read', 'clipboard-write'] });
  await instant(page);
  const mail = page.locator('#contact a[href^="mailto:atiqur.ruphysics@gmail.com"]');
  assert.ok((await mail.count()) >= 2);
  await page.locator('[data-copy]').scrollIntoViewIfNeeded();
  await page.locator('[data-copy]').click();
  await page.waitForFunction(() => document.querySelector('[data-copy-status]').textContent.length > 0);
  assert.match(await page.locator('[data-copy-status]').textContent(), /copied/i);
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'atiqur.ruphysics@gmail.com');
  assert.equal(await page.locator('#contact a[href="https://www.linkedin.com/in/atiqurrahmanphy"]').count(), 1);
  assert.equal(await page.locator('#contact a[href="https://github.com/atiqurrahmansojib"]').count(), 1);
  assert.equal(await page.locator('#contact a[href="https://www.facebook.com/imarsojib"]').count(), 1);
  assert.equal(await page.locator('#contact a[href="https://www.instagram.com/imarsojib"]').count(), 1);
  assert.equal(await page.locator('.hero a[aria-label="Facebook"], .hero a[aria-label="Instagram"]').count(), 2);
  await ctx.close();
});

await test('brand: AR monogram beside the name in header and footer; Tanabana logo shown on its card and page', async () => {
  const { ctx, page } = await open('/');
  assert.equal(await page.locator('[data-header] .brand svg.logo').count(), 1);
  assert.match(await page.locator('[data-header] .b-name').textContent(), /Atiqur Rahman/);
  assert.equal(await page.locator('footer svg.logo').count(), 1);
  const logo = page.locator('#projects img[alt="Tanabana logo"]');
  assert.equal(await logo.count(), 1);
  await logo.scrollIntoViewIfNeeded();
  assert.ok(await logo.evaluate((img) => img.complete && img.naturalWidth > 100), 'logo did not load');
  await page.goto(srv.origin + '/projects/tanabana/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('img[alt="Tanabana logo"]').count(), 1);
  await ctx.close();
});

await test('skills: every technology names where it was used', async () => {
  const { ctx, page } = await open('/');
  const rows = await page.locator('#skills li').evaluateAll((els) => els.map((e) => [e.querySelector('.name').textContent, e.querySelector('.used').textContent]));
  assert.equal(rows.length, 17);
  for (const [name, used] of rows) assert.ok(used.length > 3, `${name} has no source`);
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
  const entry = await page.locator('#experience .course').first().textContent();
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


await browser.close();
srv.close();
for (const r of results) console.log(r.join('  '));
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(failed ? `e2e: ${failed} failed` : `e2e: ${results.length} passed`);
process.exit(failed ? 1 : 0);
