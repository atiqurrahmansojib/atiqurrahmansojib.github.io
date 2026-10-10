# PROJECT_CONTEXT

Last updated: 2026-10-09 (discovery phase, no implementation yet)

## Owner
- Atiqur Rahman, GitHub: `atiqurrahmansojib` (5 public repos, 1 private, 0 followers, bio "A learner..").
- Beginner in web development and deployment. Wants a production-ready developer portfolio.

## Environment (verified)
- OS Linux, bash. Working dir `~/Desktop/Portfolio` (empty, not a git repo).
- Installed: git 2.53, node 24.18, npm 12, Java OpenJDK 25, Maven 3.9.12, Python 3.14, Docker 29.1, gh 2.46 (authenticated as `atiqurrahmansojib`), curl, dig.
- Missing: Azure CLI (`az`), pnpm, gradle. Azure subscription state is therefore **unverified**.
- Git global user.name set; email set.

## Domain / DNS (verified read-only)
- Domain: `atiqur-rahman.me` (Namecheap; nameservers `dns1/dns2.registrar-servers.com`).
- Apex A records already point to GitHub Pages IPs (185.199.108-111.153). `www` CNAMEs to apex.
- Email forwarding via Namecheap (MX `eforward1-5`, SPF TXT). **Must not break these records.**
- Repo `atiqurrahmansojib/atiqurrahmansojib.github.io` is public, contains only `CNAME` (`atiqur-rahman.me`) and an empty README. GitHub Pages status `built`, `https_enforced: false`. Correction 2026-10-10: no valid certificate for the custom domain is served yet (only the generic github.io one); see DEPLOYMENT_GUIDE.md.

## Real projects (candidates for showcase)
| Repo | Visibility | Stack | Notes |
|---|---|---|---|
| RMGFLOW | public | Dart/Flutter (~1.0 MB), Java (~0.9 MB), PL/pgSQL | Garments buying-house management platform. Spring Boot backend (Java 21, JPA, Flyway, Security, Actuator, Web MVC), Flutter mobile, 19+ architecture docs (RBAC, ADRs, API, security, deployment). Flagship project. |
| tanabana | public (was private) | Java 11 MB, TypeScript 3.7 MB, Python, PL/SQL, Docker | Large ERP-style system with docker-compose, CI (.github), event catalog, diagrams. **Made public by the owner on 2026-10-09** (verified `visibility: public`). Now shown on the site with a source link, using only README facts. See the heads-up below about reviewing the public repo. |
| prokashpublications | public | React/Vite JS, Firebase | Book publisher demo app. Removed from the portfolio at the owner's request (2026-10-10). |
| cafe-manager-pro | deleted by owner (2026-10-09) | HTML/JS | Owner's demo project; repo deleted on purpose. Removed from the portfolio. |
| angular-fundamentals-lessons | public fork | TypeScript | Learning fork; omit or mention only as learning history. |

No secrets were read. Private repo content was not opened beyond file names and language stats.

## Training (owner-confirmed 2026-10-09)
IsDB-BISEW IT Scholarship Programme, course "Web and Mobile App Development using Spring Boot, Android & Flutter" (J2EE/JEE track). The owner confirmed the course is **completed**. Official page: https://apply.idb-bisew.info/Home/CourseDeatils/1#jee (checked: HTTP 200, course title and technologies confirmed). The completion date, certificate number, grades and other qualifications were not provided and are deliberately not on the site.

## Reference design
The owner supplied a sample design image (dark navy, electric blue, portrait hero, three project cards, icon skills grid, about/contact bands). The redesign follows its layout and style. The sample's copy is **mock content** (for example a portrait photo, a bio paragraph, MySQL/JPA/AWS/Linux skills, "English, Bengali", "Private Project" label). None of that is used. Owner-only details stay placeholders.

## Heads-up for the owner
Tanabana is public. A security review of it was done and kept privately (outside this repository). The site repeats none of it.

## M1 status
Project scaffolded in this directory (Astro 7, git initialised on `main`, no commits, no remote). See IMPLEMENTATION_PLAN.md for decisions and test results. Domain confirmed by the owner on 2026-10-09.

## Not yet verified
- GitHub Student Developer Pack status (not reliably checkable by API; needs owner to check https://education.github.com/pack).
- Azure subscription/credits (needs `az` install + `az login` by owner).
- Namecheap hosting plan details (no access).
- Owner's preferred display name, bio, CV, photo, contact email, social links.

## Decisions
See IMPLEMENTATION_PLAN.md for architecture. Summary: static site, no backend, GitHub Pages on the existing domain.

## Tanabana security audit
Completed and kept privately, outside this repository. The owner confirmed (2026-10-09) it never ran on a reachable server or with real data. Details are intentionally not recorded here.
