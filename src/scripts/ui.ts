// All page behaviour in one small module: theme, menu, scroll spy, glow, parallax, pipeline, tooltips.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

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

// Pointer glow on cards
document.querySelectorAll<HTMLElement>('.glow-card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// Subtle parallax: background orbs follow scroll, hero items follow the pointer.
if (!reduced.matches) {
  const layers = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
  let px = 0, py = 0, ticking = false;
  const apply = () => {
    ticking = false;
    for (const el of layers) {
      const k = parseFloat(el.dataset.parallax ?? '0');
      el.style.transform = `translate3d(${px * k * -40}px, ${scrollY * k + py * k * -40}px, 0)`;
    }
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('pointermove', (e) => {
    px = e.clientX / innerWidth - 0.5;
    py = e.clientY / innerHeight - 0.5;
    queue();
  }, { passive: true });
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

// Keep skill tooltips inside the viewport for tiles near the screen edge.
document.querySelectorAll<HTMLElement>('.tile').forEach((tile) => {
  const tip = tile.querySelector<HTMLElement>('.used');
  if (!tip) return;
  const place = () => {
    tip.style.setProperty('--dx', '0px');
    const r = tip.getBoundingClientRect();
    const pad = 8;
    const dx = r.left < pad ? pad - r.left : r.right > innerWidth - pad ? innerWidth - pad - r.right : 0;
    tip.style.setProperty('--dx', `${dx}px`);
  };
  tile.addEventListener('pointerenter', place);
  tile.addEventListener('focus', place);
});

// Pattern marks: tap or click toggles a mark. The active mark lights its seam and, on small screens,
// writes its name into the caption under the drawing. Escape or a tap elsewhere clears it.
document.querySelectorAll<HTMLElement>('.marks').forEach((list) => {
  const marks = [...list.querySelectorAll<HTMLElement>('.mark')];
  const caption = list.closest('.stage')?.querySelector<HTMLElement>('[data-caption]');
  const idle = caption?.textContent ?? '';
  const set = (active: HTMLElement | null) => {
    marks.forEach((m) => {
      const on = m === active;
      m.toggleAttribute('data-active', on);
      m.querySelector('.dot')?.setAttribute('aria-pressed', String(on));
    });
    if (caption) caption.textContent = active ? `${active.dataset.tech}: ${active.dataset.role}` : idle;
  };
  marks.forEach((m) =>
    m.querySelector('.dot')?.addEventListener('click', () => set(m.hasAttribute('data-active') ? null : m)),
  );
  document.addEventListener('pointerdown', (e) => { if (!(e.target as HTMLElement).closest('.marks')) set(null); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(null); });
});
