# Portfolio

Personal portfolio for Atiqur Rahman. Astro 7, TypeScript, static output, no backend.

## Commands
| Command | Does |
|---|---|
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Static build into `dist/` |
| `npm run check` | Astro and TypeScript diagnostics |
| `npm run check:links` | Broken-link check of the built site (internal links) |
| `npm run check:a11y` | axe-core WCAG 2.x A/AA scan of every built page, light and dark, desktop and phone |
| `npm run check:e2e` | 15 browser tests in Chromium against `dist/` |
| `npm run check:lighthouse` | Lighthouse mobile and desktop on key pages (system Chrome) |
| `npm run og` | Regenerate `public/og.png` |
| `npm run verify` | all checks in order |

`check:a11y` needs a Playwright Chromium (`npx playwright install chromium`).

## Content
- Portrait: add `src/assets/profile.jpg` (or .png/.webp). Project screenshots: `src/assets/projects/<slug>.png`. CV: `public/cv.pdf`.
- Projects live in `src/content/projects/*.md`. The schema (`src/content.config.ts`) only accepts `visibility: public`.
  Private repositories must not be added until the owner approves the public wording.
- Site-wide facts (name, tagline, links) are in `src/data/site.ts`. `null` renders a visible placeholder.
- Missing owner content appears as a dashed `[Placeholder: ...]` chip. Do not replace these with invented text.

## Domain
`atiqur-rahman.me`, confirmed by the owner on 2026-10-09. Override with `SITE_URL`.
