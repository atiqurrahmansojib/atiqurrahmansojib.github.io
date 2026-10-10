# IMPLEMENTATION_PLAN

## Architecture decision
- **Static site, no backend.** A portfolio needs no server. Fewer moving parts, no attack surface, free.
- **Framework: Astro** (TypeScript, Markdown/MDX content collections). Ships near-zero JS, excellent Lighthouse scores, easy to maintain for a beginner. Alternative: plain Vite + React (more JS than needed) or Next.js static export (heavier).
- **Styling:** Tailwind CSS or hand-written CSS with design tokens; light/dark theme; responsive; accessible (WCAG AA).
- **Content:** projects as Markdown files in the repo (title, stack, summary, links, screenshots). Java/Spring Boot work (RMGFLOW, tanabana) leads.
- **Hosting:** GitHub Pages via GitHub Actions (build Astro, deploy). Free, HTTPS via Let's Encrypt, DNS already pointing there.
- **Contact:** `mailto:` link plus GitHub/LinkedIn. Email forwarding already exists on Namecheap. Optional later: Formspree-style form (no backend of our own).
- **Quality gates in CI:** build, link check, Lighthouse/axe check, `npm audit`.

## Hosting options compared
| Option | Cost | Verdict |
|---|---|---|
| GitHub Pages (recommended) | Free | Domain already wired; zero new resources. |
| Azure Static Web Apps (Free tier) | Free tier exists; needs verified Azure subscription | Good alternative; adds learning value but requires DNS change and `az` setup. |
| Namecheap shared hosting | Already paid? (unverified) | FTP deploys, manual; worse DX. |
| Vercel/Netlify | Free tier | Fine, but unnecessary. |

Expected cost: **$0/month** beyond the domain renewal already owned.

## Milestones
1. **M1 Foundation:** init git repo, scaffold Astro, base layout, theme tokens, home page skeleton, CI build workflow. Local preview verified.
2. **M2 Content:** hero, about, skills, projects (RMGFLOW, tanabana case study, prokashpublications, cafe-manager-pro), contact. Requires owner-provided bio/photo/links.
3. **M3 Polish:** SEO meta, Open Graph image, sitemap, favicon, accessibility pass, performance pass, 404 page.
4. **M4 Deploy:** push to existing Pages repo (or new repo + switch Pages source), enable "Enforce HTTPS", verify. No DNS change needed.
5. **M5 Optional:** blog/notes, Spring Boot architecture write-ups, analytics (privacy-friendly), resume PDF.

## First implementation milestone (M1) deliverables
- `git init` in this directory, `.gitignore`, README.
- Astro project scaffolded with `npm create astro` (needs approval to install packages).
- `.github/workflows/deploy.yml` (written, not pushed).
- Local `npm run build` and `npm run dev` verified.

## Risks / blockers
- Content from owner needed (bio, photo, links, CV).
- Private repo `tanabana`: owner must approve what is publicly described.
- Azure not verified; not needed for recommended path.
- Existing `atiqurrahmansojib.github.io` repo is what Pages serves today; deploying will overwrite its (nearly empty) content only after approval.

---

## M1 result (2026-10-09)

### Implementation decisions
- Astro 7.3.8 (static, `trailingSlash: always`), TypeScript strict (TypeScript 6.0.3 installed), `@astrojs/sitemap`. No UI framework, no client JS except the theme toggle.
- Fonts self-hosted through Fontsource (Bricolage Grotesque for display, Hanken Grotesk for text). No third-party font requests.
- Visual identity from the garment trade: chambray paper, indigo ink, gold topstitch. Signature element is a sewing pattern piece drawn once on page load (cut line, stitched seam, notches, grain line). Dashed "stitch" rules are the one repeated motif. Light and dark themes, follows system setting, manual toggle stored in `localStorage` (guarded).
- Content collection `projects` with a schema that pins `visibility: public`, so Tanabana cannot be added by accident. Each entry carries a `verifiedFrom` note.
- Pages: `/`, `/projects/rmgflow/`, `/projects/prokashpublications/`, `/projects/cafe-manager-pro/`, `/404.html`, sitemap, robots, favicon, JSON-LD `Person`.
- RMGFlow is the flagship, described only from the public repo description, `pom.xml`, backend README and docs file names. No auth, tenancy or security internals mentioned.
- Placeholders (visible): biography, education/experience, public email, LinkedIn. Tagline "I build business software in Java and Spring Boot." is a DRAFT derived from the repos and needs owner confirmation.
- Stack section lists only technologies found in the public repos.
- `public/CNAME` contains the domain (confirmed by the owner 2026-10-09). Not pushed anywhere.

### Test results
| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings, 0 hints (13 files) |
| `astro build` | 5 pages built, sitemap created |
| `check:links` | all scanned links OK (internal; external links skipped in CI to avoid flakiness) |
| `check:a11y` | 5 pages x 4 variants (light/dark, desktop/phone) passed, no horizontal overflow |
| a11y negative test | injected `<img>` without alt was reported as `image-alt (critical)`, so the check detects failures; dist rebuilt clean afterwards |
| External URLs (curl) | github.com profile, 3 repos and cafe-manager-pro.vercel.app all HTTP 200 |
| Dev server | all 4 routes 200, unknown path 404; visually reviewed at 1280px and 375px, light and dark; no console warnings or errors |
| Build size | `dist` 244 KB; home HTML 14.6 KB |

Not run: Lighthouse, real screen-reader pass, GitHub Actions run (workflow never executed because nothing is pushed).

### Open items for M2
- Owner: confirm domain, tagline, bio, photo, email, LinkedIn, CV.
- Owner: decide whether and how Tanabana is described publicly.
- Screenshots or diagrams for RMGFlow (public-safe only).
- Open Graph image, Lighthouse run, real screen-reader pass.

---

## M1.1 redesign (2026-10-09)

Owner disliked the M1 look and supplied a sample design. The site was rebuilt to match its structure and style. Garment-trade motif kept as a quiet accent (sewing pattern piece beside the portrait and in About).

### Architecture changes
- Fonts: Inter (variable, self-hosted via Fontsource). Removed Bricolage Grotesque and Hanken Grotesk. No third-party font requests.
- Theme: dark navy default, electric blue accent, gradient last name; light theme via pill toggle in the header (persisted, guarded `localStorage`).
- Sections: Home, Projects (3 featured cards, RMGFlow flagship highlighted), Skills (icon tiles from `simple-icons`, each tile says which project it was verified in), About, Experience (timeline, placeholders only), Contact, slim footer.
- Pages: `/`, `/projects/` (all four), `/projects/<slug>/` rich detail pages (stats as reported by the project README, interactive RMGFlow module pipeline, highlights, facts, previous/next), `/404.html`.
- Tanabana is public now: normal project with GitHub link, no "private" wording. The content schema still pins `visibility: public`.
- Content slots: `src/assets/profile.(jpg|png|webp)` for the portrait, `src/assets/projects/<slug>.(png|jpg|webp)` for project screenshots, `public/cv.pdf` enables the CV button. Until then each shows a visible placeholder or a disabled control.
- Behaviour (`src/scripts/ui.ts`, about 130 lines, no framework): theme, mobile menu with Escape and focus return, scroll spy, scroll-driven reveals (not IntersectionObserver, so fast scrolling can never leave content hidden), pointer-following card glow, subtle parallax, pipeline highlight, tooltip edge clamping.
- Reduced motion: no animations, no parallax, content visible immediately, smooth scroll off.
- SEO: canonical, Open Graph and Twitter large-image card (`public/og.png`, generated by `npm run og`), JSON-LD Person, sitemap, robots.
- Scripts: `check:e2e` (15 Playwright browser tests), `check:lighthouse` (median of up to 3 runs per page and preset), plus the earlier check, links and a11y scripts. `npm run verify` runs all.

### Test results
| Check | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| `astro build` | 7 pages |
| Links | all internal links OK |
| axe (WCAG 2.2 AA) | 7 pages x 4 variants passed. It caught a real defect during the work: `<dl>` containing invalid children on project pages, now fixed. |
| Browser tests | 15 of 15 pass (nav, scroll spy, theme persistence, reveals, reduced motion, glow, pipeline, mobile menu, 320px overflow, SEO files, placeholders, projects index). Before the scroll-reveal rewrite, the reveal test failed intermittently because IntersectionObserver skipped fast-scrolled elements; fixed and re-run 8 times clean. One unexplained failure was seen once right after a build (next 5 runs clean). |
| Lighthouse (system Chrome, median of up to 3 runs) | Accessibility 100, Best practices 100, SEO 100 on all 4 pages tested, mobile and desktop. Performance 83 to 99 (home: mobile 83, desktop 91; project pages 92 to 99). Scores swing by 10 to 20 points between runs because this machine is under heavy load from other processes (load average above 6); quiet runs earlier gave 97 to 100 on the same pages. Gate is performance 0.8, the rest 0.95. `npm run verify` exits 0. |
| Visual review | 1312px, 375px, light and dark, project pages |

---

## M1.2 design pass: the pattern piece as the one memorable element (2026-10-09)

Sample layout, palette and typography kept. Changes:
- **Hero:** a large garment pattern piece (bodice front) draws itself once on load (cut line, then stitched seam, then grain line and notches, then five marks). This is the only entrance sequence on the site. The marks are keyboard-focusable buttons naming real technologies and where each was used: Spring Boot (backend, RMGFlow and Tanabana), Angular (web client, Tanabana), Flutter (mobile, RMGFlow), PostgreSQL (data, both systems), Docker (packaging, Tanabana). Hover or focus lights the matching seam.
- **Removed** the scroll-triggered fade-and-slide on every section and card. Content is visible immediately.
- **Less sameness:** RMGFlow is a large feature card with its README-reported numbers; Tanabana and Prokash are compact side cards. Skills tiles, About art, Experience and Contact lost the shared glow-card treatment (only project cards glow).
- **Reduced motion:** the drawing and marks show fully drawn, no animation, no parallax.
- **Tests:** browser tests now 16 (mark names and seam highlight, reduced-motion drawing visible, nothing hidden without scrolling). `npm run verify` exits 0. Lighthouse on this run: accessibility, best practices and SEO 100 everywhere; performance 84 to 100 (single runs, noisy machine).

---

## Pre-deployment pass (2026-10-09)

### Pattern marks on mobile
Found by browser tests: the slogan intercepted taps on the Angular mark; at 320px the Flutter chip ran off the left edge; at 1024 to 1100px the Spring Boot chip covered two other marks. Fixed:
- Below 52rem the chips are replaced by one live caption under the drawing; tapping or pressing Enter or Space toggles a mark (`aria-pressed`), lights its seam, and shows "Tech: role". Outside tap or Escape clears. This also works on iOS Safari, which does not focus buttons on tap.
- Desktop chips show only the technology name until hover, focus or tap, so they cannot overlap.
- Slogan hidden on phones and never intercepts pointer events; touch targets are at least 44px.
- Reduced motion: drawing and marks fully visible, no animation.
- 31 browser tests cover widths 320, 360, 390, 412, 768 (touch) and 1024, 1280, 1440, keyboard focus ring and Enter, and reduced motion.

### Claims audit (checked 2026-10-09 against the sources)
| Claim on site | Source | Result |
|---|---|---|
| RMGFlow: 13 phases, 48 integration tests | RMGFLOW `backend/README.md` ("all 13 phases complete", "48 tests, 0 failures as of the last full run") | Supported; shown as README-reported |
| RMGFlow: Java 21, Spring Boot, PostgreSQL, Flyway | `backend/pom.xml` | Supported |
| RMGFlow: Flutter, Dart | `mobile/` has `pubspec.yaml` (`rmgflow_mobile`), repo language stats | Supported |
| Tanabana: 14 modules, 1,266 tests, migrations V1 to V262, scale target 5 to 20 factories | tanabana `README.md` (status of 1 Oct 2026) | Supported; shown as README-reported |
| Tanabana: Java, Spring Boot, PostgreSQL, Angular, TypeScript | README line 7, language stats | Supported |
| Tanabana: Docker, GitHub Actions | `docker-compose*.yml`, Dockerfiles, `.github/workflows/checks.yml` | Supported. The owner's "CI/CD" is shown as "GitHub Actions checks" because only a CI checks workflow was found, not a deploy pipeline |
| Prokash: React, Vite, Firebase, PWA | `package.json` (react 19, vite 7, firebase 12, vite-plugin-pwa) | Supported |
| Cafe Manager Pro: live on Vercel | URL returns 200 | Supported |
| Cafe Manager Pro: GitHub source, PWA/manifest, CSS | Repo now returns 404 | **Removed** (source link, PWA, manifest, CSS tile). HTML and JavaScript kept from the earlier check |
| Skills tiles | each tile lists the project it was verified in | JavaScript now Prokash only; Vercel marked as hosting |

### Open
- Cafe Manager Pro repo is gone from GitHub (deleted, renamed or private). Owner to say which; the card shows the live link only.
- Tanabana audit: kept privately, outside this repo. Needs the owner's answers before any remediation. No destructive action taken.

### Final verification (after all changes)
`npm run verify` run twice: type check 0 errors and 0 warnings, 7 pages built, all internal links OK, axe passes on 7 pages x 4 variants, 31 of 31 browser tests pass. Lighthouse (system Chrome, median of up to 3): accessibility, best practices and SEO 100 on every page and preset. Performance in the clean run: home 98 mobile and 89 desktop, projects 99 and 100, RMGFlow 99 and 94, Tanabana 91 and 96. An earlier run on the same build scored 79 to 98 while the machine was under load from other processes, which is the known noise (see M1.1). Gate: performance 0.8, others 0.95.

### Cafe Manager Pro removed (2026-10-09)
Owner confirmed the repo was their demo project and was deleted on purpose. The project page, card, tests and the Vercel skill tile were removed. The site now shows three projects: RMGFlow, Tanabana and Prokash Publications. The Open items entry about the missing repo is closed.

### Scholarship training added (2026-10-09)
- Data: `training` object in `src/data/site.ts` (course, programme, track, official URL, the ten technologies the official course covers, `completed: true`). Course topics are shown as course content, not as skill claims.
- Experience section is now "Experience and training": a prominent entry with a "Completed" pill, programme, track, technology badges and a link to the official course page. A single placeholder remains for work experience.
- About: bio draft says the training was completed through the programme (marked Draft for the owner to confirm); the Education and training row links to the entry. Hero intro line is a draft built from the same verified facts.
- Left out on purpose: completion date, certificate number, grades, any other qualification.
- Test: browser test checks the official link, the ten badges, "Completed", no Dates or Status fields, and that the page contains none of certificate, graduate, diploma, award, grade, GPA, distinction.

### Course details expanded (2026-10-09)
Owner asked for Angular, Oracle and other course topics to be shown. Checked the official page: it lists 7 modules over 8.5 months (Web Publishing & Bootstrap; Oracle 19c database development; Java OOP; XML and UML analysis and design; Servlet, JSP, JSF, Hibernate and Angular; Spring, Spring Boot and JasperReports; Android and Flutter). The training entry now lists the modules in order plus 15 technology badges. The skills grid gained Hibernate, Oracle Database, Android, Bootstrap, UML and XML, each with the tooltip "Used in IsDB-BISEW training"; Java, Spring Boot, Flutter and Angular tooltips now include the training too.
**PostgreSQL is not on the official course page** (it mentions Oracle 19c and MySQL elsewhere). The PostgreSQL tile therefore says it was used in RMGFlow and Tanabana (verified in those repos), not in the course. If the owner learned PostgreSQL in the course, they can supply a source and it can be added.

### Slogan (2026-10-09)
Owner asked for a professional slogan that suits them. Replaced "From code to real-world impact" with "Dependable software for real businesses" (the draft tagline was confirmed by the owner). It makes no factual claim beyond building business systems.

### Email added (2026-10-09)
Owner supplied the public contact email. It is in `src/data/site.ts` and enables the hero mail icon, the Contact section's Email item and 'Send message' button, and the footer link (mailto links).

### LinkedIn added
Owner supplied the LinkedIn profile URL. It enables the hero LinkedIn icon and the Contact LinkedIn item, and is added to the JSON-LD `sameAs`. Not fetched: LinkedIn blocks automated requests, so the URL is as given by the owner.

### Photo added
Owner supplied a portrait (copied from their own file to `src/assets/profile.jpg`; no other files from that folder were touched). The hero shows it in the circle with a blue ring, optimised by Astro to WebP at three widths. The pattern drawing was narrowed so its lines no longer cross the face. Full `npm run verify` passes (32 browser tests, axe, Lighthouse 100/100/100 for accessibility, best practices and SEO; performance 87 to 100).

### Transparent photo and location
- `scripts/cutout.mjs` (uses `sharp`, already installed with Astro; no model, no network) removes the plain white background from the portrait: flood fill from the top and sides, light-fringe removal, 2px feather and white un-mixing. Output `src/assets/profile.png` with transparency; the untouched original is kept in `private/profile-original.jpg` (git-ignored). Re-run: `node scripts/cutout.mjs private/profile-original.jpg src/assets/profile.png`.
- The hero now shows the cut-out over the blue disc.
- Location set to "Dhaka, Bangladesh" (About, JSON-LD `homeLocation`).

## Education (2026-10-10)
Owner-confirmed: B.Sc. (2022) and M.Sc. (2023) in Physics, University of Rajshahi. Shown in About facts via `education` in `src/data/site.ts`; JSON-LD `alumniOf`. No grades or other details added.

## Work experience (2026-10-10)
Owner has no work experience to list. Removed the work-experience placeholder card and the About "Experience" row. The Experience section now shows only the IsDB-BISEW training.

## Languages (2026-10-10)
Owner-confirmed: Bengali (native), English (professional). Shown in About facts via `languages` in `src/data/site.ts`.

## About bio (2026-10-10)
Owner chose to keep the draft content but polished. Rewritten as two paragraphs using only confirmed facts (location, Physics degrees, IsDB-BISEW course, RMGFlow and Tanabana). Draft tag and "anything else" placeholder removed.

## Project cards (2026-10-10)
Owner chose text-only cards. Removed the "screenshot not added" chip; cards keep the monogram cover. Dropping a PNG into `src/assets/projects/<slug>.png` still adds a screenshot later. No visible placeholders remain; CV button stays disabled until `public/cv.pdf` exists.

## Editorial redesign (2026-10-10, local only, not pushed)
Owner rejected the first UI. Rebuilt as a dark editorial style: Bricolage Grotesque (condensed, heavy) for display, Inter for text, one signal-blue accent, hairline structure, cut-out portrait beside a very large name, one entrance animation (name rises, portrait settles). Work is two full-width case studies (RMGFlow, Tanabana) with their real figures, RMGFlow's 12-step flow and stack, plus a compact Prokash Publications row. Skills are a grouped index showing where each technology was used. About, Training and Contact are typographic. The garment-pattern hero, tailor's marks, parallax, pointer glow, card grids and tooltips were removed. Project "My role" placeholder sections were removed from the case-study pages. Browser tests went from 32 to 17 because the 15 pattern-mark tests no longer apply; new tests cover the hero, case studies and skills.

## Motion and role pass (2026-10-10, local only, uncommitted)
Added the "Full-Stack Developer" role headline (hero, page title, JSON-LD jobTitle, meta description) and flagship labels on RMGFlow and Tanabana (Tanabana tier set to flagship at the owner's request). Motion: one hero entrance; scroll reveals driven by a scroll check (not IntersectionObserver) so fast jumps cannot leave content hidden, with a 3 s safety net, reduced-motion and no-JS fallbacks; pipelines light their steps once in order when revealed; staggered figures and highlights on project pages; cross-document view transitions (header stays, project title morphs between list and page); CSS scroll-progress line in the header. Removed the hero course sentence (kept in About and Training) and the unused `intro` and `slogan` fields. Browser tests: 21.

## Second redesign: app-shell identity (2026-10-10, local only, uncommitted)
The owner found the editorial pass too close to the committed design, so the identity was replaced rather than tuned: bottle-green ink with one saffron accent; Syne display with Inter body; a fixed left rail (name, role, vertical nav with scroll tick, theme, CV, socials) on wide screens and a top bar with a menu on small ones; hero with the cut-out portrait rising out of an arch beside the name and the Full-Stack Developer role; flagship projects as stacking cards (RMGFlow, Tanabana) with the real figures, flow and stack, plus a compact Prokash Publications card; skills as grouped cards; a numbered module line in Training; a contact panel with a copy-address button. Motion, reveals, view transitions and the scroll progress line from the previous pass were kept (progress is now vertical on the rail). favicon and og.png regenerated for the new identity (`node scripts/og.mjs`). Browser tests: 23.

## Prokash Publications removed (2026-10-10)
Owner asked to remove it. Deleted its project page content, and the skills that only it supported (React, JavaScript, Vite, Firebase) so no skill claims a removed project. The site now shows RMGFlow and Tanabana only.

## Navy editorial restored and elevated (2026-10-10, local only, uncommitted)
Owner preferred the earlier navy editorial design and asked for a more premium look with animation, so the green rail identity was dropped. Kept the editorial layout and added: layered background (drifting colour fields, dot grid, film grain; scroll-shifted); sliding-pill navigation; core-technology strip under the hero; flagship panels that stack on scroll with a pointer light; figures that count up; scroll-warmed About statement; Training modules on a line that fills while scrolling; hover polish. Prokash Publications removed at the owner's request. AR monogram traced from the owner's reference design (header, footer, favicon). Tanabana logo (owner's file, cropped) shown on its card and page on a light plate. Facebook and Instagram links added (`site.facebook`, `site.instagram`; hero, contact, footer, JSON-LD sameAs). RMGFlow screenshot slot is wired: add `src/assets/projects/rmgflow-screen.png` and it appears on the RMGFlow panel; none exists yet.
