# Chore Receipt — polish 1 handoff

Repair commit: `d1451c056ac207188d0c20909d6ec762e62a7ed6`.

This repair closes every finding in `.factory/review-1.md`: safe offline shell
caching after 404s, visible mobile Household navigation, corrupt-data recovery,
accessible route changes, chore editing/removal, stronger claims tests,
no-sync disclosure, route metadata, complete 404 structure, form errors, and
the listed copy/documentation defects. The paper-cut household-record visual
system was retained.

Verification on 2026-08-28 UTC:

- Fresh GitHub clone of `d1451c0`: `npm ci` succeeded with zero vulnerabilities;
  every exact command in `.factory/claims.json` passed (11/11).
- Fresh-clone full suite: `npm test` passed, 25/25 Playwright tests.
- `npm run build` passed and produced `dist/`; initial JS is 51.04 kB raw /
  18.25 kB gzip and CSS is 12.59 kB raw / 3.76 kB gzip.
- Local `verify-url.sh http://127.0.0.1:4173/demo` passed. Evidence:
  `.factory/evidence/polish-1-local/`.
- Deployed `dist/` to Static Web App `sf-chore-receipt` production. Live
  `verify-url.sh https://chore-receipt.sociobot.in/demo` passed in 794 ms with
  no console errors, `lang=en`, one h1, main, title, and labelled controls.
  Evidence: `.factory/evidence/polish-1-live/`.
- Cold live browser review passed: first-screen wording, one-click `/demo`,
  `?demo=1`, demo reset, 404-safe offline `/log`, mobile Household navigation,
  every route’s metadata, and a true 404. Playwright axe passed all seven
  routes with no serious or critical findings.

`npx @axe-core/cli` could not launch because this container lacks a system
Chrome binary; the repository’s Playwright axe integration and the live
Playwright axe audit both passed instead.

Known gaps: none.

To run locally: `npm ci && npm test && npm run build`, then
`npm run preview` and visit `/demo` or `/?demo=1`.
