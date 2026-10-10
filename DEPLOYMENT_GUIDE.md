# DEPLOYMENT_GUIDE

Status: workflow written, never run. Nothing has been pushed, deployed or changed on GitHub, Namecheap or Azure.

## Current state (re-verified read-only 2026-10-10)
- `atiqur-rahman.me` apex A records: 185.199.108.153, .109.153, .110.153, .111.153 (GitHub Pages).
- `www.atiqur-rahman.me` CNAME to `atiqur-rahman.me`.
- Pages source repo: `atiqurrahmansojib/atiqurrahmansojib.github.io` (remote `https://github.com/atiqurrahmansojib/atiqurrahmansojib.github.io.git`), public, only branch `main`, contains only `CNAME` and `README.md`. Pages config: legacy build from `main` at `/`, cname `atiqur-rahman.me`, status `built`, `https_enforced: false`.
- Namecheap email forwarding MX + SPF TXT present. Do not remove.

## Recommended path: GitHub Pages + GitHub Actions
1. Build the site locally (M1-M3).
2. Push to `atiqurrahmansojib/atiqurrahmansojib.github.io` (or a new repo; then move custom domain).
3. In repo Settings > Pages: set Source to "GitHub Actions". Keep custom domain `atiqur-rahman.me`.
4. Tick **Enforce HTTPS** (certificate already issued; GitHub auto-renews).
5. Ensure `public/CNAME` containing `atiqur-rahman.me` ships in the build output so the domain is not dropped.
6. Verify: `curl -sI https://atiqur-rahman.me`, `curl -sI http://atiqur-rahman.me` (expect 301 to https), `https://www.atiqur-rahman.me` redirects.

## DNS (no change required)
Existing records are already correct. Optional hardening, only with approval: add AAAA records (2606:50c0:8000::153 and .8001/.8002/.8003::153) and a CAA record. Never edit DNS in Namecheap without explicit approval.

Optional: verify the domain at GitHub (Settings > Pages > Add a domain) to prevent subdomain takeover.

## Alternative: Azure Static Web Apps (only if approved)
Requires installing Azure CLI, `az login` by the owner, a verified free subscription, then a Free-tier SWA resource and DNS change (CNAME/ALIAS validation). Not needed for launch.

## Rollback
Revert the commit in the Pages repo; Actions redeploys the previous build. Domain config is untouched.

## Security notes
- No secrets in repo. Actions use the built-in `GITHUB_TOKEN` with `pages: write`, `id-token: write` only.
- Pin Action versions; enable Dependabot.

## Workflow added in M1
`.github/workflows/deploy.yml` (not pushed): on push/PR runs `npm ci`, `astro check`, build, link check, Playwright Chromium install, axe scan. On pushes to `main` only, a second job deploys the artifact with `actions/deploy-pages`. Permissions are `contents: read` for the build job and `pages: write` + `id-token: write` for deploy only.

### Switching on production (needs explicit owner approval, none done yet)
1. Decide repo: reuse `atiqurrahmansojib.github.io` (add this project as its content) or push to a new repo and move the custom domain.
2. Add the remote and push `main`. CI runs the build job only until Pages is switched.
3. Settings > Pages > Source: change from "Deploy from a branch" to "GitHub Actions". This replaces the legacy build; the custom domain stays configured.
4. Tick "Enforce HTTPS".
5. Verify with `curl -sI` on `https://atiqur-rahman.me`, the http URL (expect redirect) and `www`.
Domain `atiqur-rahman.me` is confirmed by the owner.

## Before deploying (pre-flight)
1. Domain `atiqur-rahman.me` confirmed by the owner (2026-10-09).
2. Owner supplies or declines the placeholders (photo, bio, intro, email, LinkedIn, CV, location, degree if wanted, work experience, languages) and confirms the draft tagline and slogan.
3. Tanabana audit: owner confirmed it never ran on a reachable server or with real data, so no credential rotation is required. Optional hygiene (secret scanning and push protection, dev-only defaults) awaits separate approval.
4. Run `npm run verify` (type check, build, links, axe, 31 browser tests, Lighthouse). All must pass.
5. Separate written deployment approval from the owner.

## Final pre-deployment review (2026-10-10, read-only, nothing changed remotely)
- **HTTPS finding:** `https://atiqur-rahman.me` and `https://www.atiqur-rahman.me` currently fail certificate validation: the server presents GitHub's generic `*.github.io` certificate, which does not cover the custom domain. `http://atiqur-rahman.me` returns 200; `http://www` redirects to the apex. This corrects the earlier note that a Let's Encrypt certificate for the domain existed. After the first successful Pages deploy, GitHub should issue a certificate for the domain (it can take up to about an hour). "Enforce HTTPS" can only be ticked once that certificate exists; if it does not appear, re-save the custom domain in Settings > Pages to retrigger issuance. Do not remove or re-add DNS records for this.
- **First push:** the remote `main` already has two commits (`Initial commit`, `Added CNAME file`). The local repo has no commits. Fetch first and commit on top of `origin/main` (no force push, no history rewrite). The root `CNAME` file stays untouched (inert under Actions); `public/CNAME` ships in the build output.
- **First workflow run:** until Pages source is switched to "GitHub Actions", the deploy job fails by design (build job still runs). Switch the source, then re-run the workflow.
- **Rollback:** (1) fastest: re-run a previous successful workflow run from the Actions tab, or `git revert <commit>` and push; Actions redeploys. (2) Do not switch the Pages source back to "Deploy from a branch": `main` will then hold the Astro source, not built output. (3) DNS and the Namecheap email records are never touched by any of this.
- CI runs type check, build, link check and axe. Browser tests and Lighthouse run locally via `npm run verify` only.

## Approved plan, awaiting explicit go (2026-10-10)
Repo: `atiqurrahmansojib/atiqurrahmansojib.github.io`. Lighthouse thresholds and 3-run median unchanged. Dependabot deferred.

Verified in a throwaway clone (no remote change): one commit on top of `origin/main` is a fast-forward and `git push --dry-run` is accepted; 49 files, none private. CI path also verified under Node 22 (`npm ci`, check, build, links).

Git operations (local project folder; commit identity is the GitHub noreply address already used by the remote history):
1. `git remote add origin https://github.com/atiqurrahmansojib/atiqurrahmansojib.github.io.git`
2. `git fetch origin`
3. `git reset --soft origin/main` (local `main` has no commits; this only moves the branch pointer, working files untouched)
4. `git add -A` then review `git status` (expect 48 added, README.md modified, nothing from `private/`, `dist/`, `node_modules/`)
5. `git -c user.email=257993794+atiqurrahmansojib@users.noreply.github.com commit` (one commit)
6. `git push origin main` (plain push, fast-forward, no `--force`)

Pages settings changes (only after the push):
1. Settings > Pages > Source: "Deploy from a branch" to "GitHub Actions" (API equivalent: `build_type: workflow`). Custom domain stays `atiqur-rahman.me`.
2. Re-run the workflow so the deploy job runs.
3. When the certificate for the domain exists, tick "Enforce HTTPS".
No DNS, Namecheap or email changes. Environment `github-pages` already allows deployments from `main` only.
