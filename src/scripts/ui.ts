// All page behaviour in one small module: theme, menu, header state, scroll spy and the pipeline highlight.
const root = document.documentElement;

// Theme
const themeBtn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const syncThemeLabel = () => {
  const dark = root.dataset.theme !== 'light';
  themeBtn?.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
};
syncThemeLabel();
themeBtn?.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
  syncThemeLabel();
});

// Mobile menu
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const nav = document.querySelector<HTMLElement>('[data-nav]');
const setMenu = (open: boolean) => {
  menuBtn?.setAttribute('aria-expanded', String(open));
  menuBtn?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (nav) nav.toggleAttribute('data-open', open);
};
menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); });
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
});

// Header state on scroll
const header = document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header?.toggleAttribute('data-scrolled', scrollY > 24);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

// Scroll spy
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-spy]')];
const sections = links.map((l) => document.getElementById(l.dataset.spy!)).filter(Boolean) as HTMLElement[];
if (sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        links.forEach((l) => l.toggleAttribute('aria-current', false));
        const a = links.find((l) => l.dataset.spy === en.target.id);
        a?.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => spy.observe(s));
}

// Interactive pipeline: hover or focus highlights a step and the steps before it.
document.querySelectorAll<HTMLElement>('[data-flow]').forEach((flow) => {
  const steps = [...flow.querySelectorAll<HTMLElement>('[data-step]')];
  const set = (i: number) => steps.forEach((s, n) => s.toggleAttribute('data-lit', n <= i));
  steps.forEach((s, i) => {
    s.addEventListener('pointerenter', () => set(i));
    s.addEventListener('focus', () => set(i));
  });
  flow.addEventListener('pointerleave', () => set(-1));
});
