// All page behaviour in one small module: theme, menu, header state, scroll spy, scroll reveals and the pipeline highlight.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
root.dataset.ui = '1';

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

// Scroll reveals. Elements marked data-reveal fade in once they near the viewport. A scroll check (not an
// IntersectionObserver) is used so elements skipped by a fast scroll or an anchor jump are still revealed.
const pending = new Set(document.querySelectorAll<HTMLElement>('[data-reveal]'));
const reveal = (el: HTMLElement) => {
  pending.delete(el);
  el.setAttribute('data-in', '');
  el.dispatchEvent(new CustomEvent('reveal'));
};
let revealQueued = false;
const checkReveals = () => {
  revealQueued = false;
  const edge = innerHeight * 0.92;
  for (const el of pending) if (el.getBoundingClientRect().top < edge) reveal(el);
};
const queueReveals = () => { if (!revealQueued) { revealQueued = true; requestAnimationFrame(checkReveals); } };
if (reduced.matches) pending.forEach(reveal);
else {
  checkReveals();
  addEventListener('scroll', queueReveals, { passive: true });
  addEventListener('resize', queueReveals);
}
addEventListener('beforeprint', () => [...pending].forEach(reveal));

// When a pipeline is revealed it lights its steps once, in order, to show the sequence. Hover and focus still work.
document.querySelectorAll<HTMLElement>('[data-flow]').forEach((flow) => {
  if (reduced.matches) return;
  const steps = [...flow.querySelectorAll<HTMLElement>('[data-step]')];
  flow.addEventListener('reveal', () => {
    steps.forEach((st, n) => setTimeout(() => st.toggleAttribute('data-lit', true), 350 + n * 90));
    setTimeout(() => steps.forEach((st) => st.toggleAttribute('data-lit', false)), 350 + steps.length * 90 + 700);
  }, { once: true });
});

// Copy the email address. The mailto links stay the primary way to get in touch.
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const status = document.querySelector<HTMLElement>('[data-copy-status]');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      if (status) status.textContent = 'Address copied.';
    } catch {
      if (status) status.textContent = `Copy failed. Address: ${btn.dataset.copy}`;
    }
  });
});

// Contact form (Formspree). Sent in the background; without JavaScript the browser posts the form normally.
const form = document.querySelector<HTMLFormElement>('[data-form]');
if (form) {
  const fstatus = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit) submit.disabled = true;
    if (fstatus) fstatus.textContent = 'Sending...';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      if (fstatus) fstatus.textContent = 'Thank you, your message was sent.';
    } catch {
      if (fstatus) fstatus.textContent = 'Could not send. Please email me directly instead.';
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}

// Navigation highlight: one pill slides to the hovered link and rests on the section in view.
const navEl = document.querySelector<HTMLElement>('[data-nav]');
const ind = navEl?.querySelector<HTMLElement>('.ind');
if (navEl && ind) {
  const navLinks = [...navEl.querySelectorAll<HTMLAnchorElement>('a[data-spy]')];
  const moveTo = (a: HTMLAnchorElement | undefined) => {
    if (!a || getComputedStyle(ind).display === 'none') return;
    const nb = navEl.getBoundingClientRect();
    const ab = a.getBoundingClientRect();
    ind.style.setProperty('--x', `${ab.left - nb.left}px`);
    ind.style.setProperty('--w', `${ab.width}px`);
    ind.setAttribute('data-ready', '');
  };
  const current = () => navLinks.find((l) => l.getAttribute('aria-current') === 'true') ?? navLinks[0];
  const rest = () => moveTo(current());
  navLinks.forEach((l) => {
    l.addEventListener('pointerenter', () => moveTo(l));
    l.addEventListener('focus', () => moveTo(l));
    l.addEventListener('blur', rest);
  });
  navEl.addEventListener('pointerleave', rest);
  new MutationObserver(rest).observe(navEl, { attributes: true, subtree: true, attributeFilter: ['aria-current'] });
  addEventListener('resize', rest);
  document.fonts?.ready.then(rest);
  rest();
}

// Soft light that follows the pointer inside case-study panels.
document.querySelectorAll<HTMLElement>('[data-spot]').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// Figures count up once when they are revealed. The real value is already in the page and is restored at the end.
if (!reduced.matches) {
  document.querySelectorAll<HTMLElement>('[data-countup]').forEach((el) => {
    const finalText = el.textContent ?? '';
    const target = Number(finalText.replace(/[^\d.]/g, ''));
    const host = el.closest<HTMLElement>('[data-reveal]');
    if (!host || !Number.isFinite(target) || target <= 0) return;
    host.addEventListener('reveal', () => {
      const start = performance.now();
      const dur = 1100;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = t < 1 ? Math.round(target * eased).toLocaleString('en-US') : finalText;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { once: true });
  });
}

// Scroll-linked text: words warm up as the statement passes through.
const wordBlocks = [...document.querySelectorAll<HTMLElement>('[data-words]')].map((el) => ({ el, words: [...el.querySelectorAll<HTMLElement>('.w')] }));
const scrub = () => {
  for (const { el, words } of wordBlocks) {
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.88 - r.top) / (innerHeight * 0.5 + r.height * 0.4)));
    const on = Math.round(p * words.length);
    words.forEach((w, i) => w.toggleAttribute('data-on', i < on));
  }
};
if (reduced.matches) {
  wordBlocks.forEach(({ words }) => words.forEach((w) => w.setAttribute('data-on', '')));
} else if (wordBlocks.length) {
  let scrubQueued = false;
  const queueScrub = () => { if (!scrubQueued) { scrubQueued = true; requestAnimationFrame(() => { scrubQueued = false; scrub(); }); } };
  scrub();
  addEventListener('scroll', queueScrub, { passive: true });
  addEventListener('resize', queueScrub);
}

// Links to other sites open in a new tab; the page keeps its place. mailto and same-site links are left alone.
document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((a) => {
  if (a.origin === location.origin) return;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
});
