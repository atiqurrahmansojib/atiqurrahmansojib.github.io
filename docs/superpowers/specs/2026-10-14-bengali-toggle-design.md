# Bengali language version: design

Date: 2026-10-14. Status: awaiting owner review.

## Goal
Bengali-speaking visitors (employers and clients in Bangladesh) can read the homepage in Bengali. English stays the default and primary language.

## Scope
In: the homepage (`/`) gets a Bengali twin at `/bn/`.
Out (later phase): project case-study pages, the 404 page, a Bengali CV.

## Constraints
- Nothing is invented. Facts, names, links and figures come from the existing site data. Technical terms (Spring Boot, Flutter, Angular, RMGFlow, Tanabana, BikeHub) stay in English.
- The owner reviews the Bengali text before it is merged.
- No regression: `check`, `build`, links, e2e and a11y pass for both languages. No new runtime JavaScript is needed for translation.

## Approach
Separate static URLs per language, with typed dictionaries.

### Text
- `src/i18n/en.ts` and `src/i18n/bn.ts` hold all homepage prose: nav labels, hero tagline and buttons, availability line, Why hire me cards, About, Skills and Training intros, Contact labels and form text, footer.
- `bn.ts` is typed against `en.ts`, so a missing key fails the build.
- Language-neutral data stays where it is (`site.ts`: skills, project data, links, email, social). Prose that currently lives in `site.ts` (tagline, whyHire, availability) moves into the dictionaries.
- Each component takes a `lang: 'en' | 'bn'` prop and reads its dictionary.

### Pages
- `src/components/Home.astro` composes the sections for a given `lang`.
- `src/pages/index.astro` renders `<Home lang="en" />`; `src/pages/bn/index.astro` renders `<Home lang="bn" />`.
- `Base.astro` takes `lang` and sets `<html lang>`, `og:locale`, a per-page canonical, and `hreflang` alternates (`en`, `bn`, `x-default`). The sitemap lists both pages.
- Links to project case studies from `/bn/` go to the English `/projects/...` pages and are marked as English.

### Toggle
- Header control "EN | বাংলা": a plain link to the other language's page, so it works without JavaScript.
- The chosen language is stored in `localStorage` (try/catch) for a convenience hint only. There is no automatic redirect on the English page.
- Nav anchors on `/bn/` stay on `/bn/` (`/bn/#projects`).

### Bengali typography
- Add `@fontsource-variable/noto-sans-bengali`, loaded only on `/bn/`.
- On `/bn/`, headings and body use Noto Sans Bengali; `letter-spacing` is reset to 0 and line height raised, since negative tracking breaks Bengali conjuncts.

## Testing
- e2e: toggle navigates between `/` and `/bn/`; `<html lang>` is correct on each; no console errors or failed requests on `/bn/`; Bengali text does not overflow at 375px width; the contact form works on `/bn/`.
- Build-time: type check fails on a missing translation key.
- Existing `check:links` and `check:a11y` extended to cover `/bn/`.

## Risks
- Translation quality: mitigated by owner review of `bn.ts` before merge.
- Duplicated maintenance: mitigated by typed dictionaries and a single `Home` composition.
- Font weight: Noto Sans Bengali is loaded only on `/bn/` to keep the English page unchanged.

## Open items for the owner
- Review the Bengali wording in `src/i18n/bn.ts` once drafted.
