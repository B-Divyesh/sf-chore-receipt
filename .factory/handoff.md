# Chore Receipt — polish 1 handoff

Repair commits: `d1451c056ac207188d0c20909d6ec762e62a7ed6` and
`c2349126c4bc8ab4809da07cf9c15e396d364efd`. The repair is pushed to `main`
and deployed to <https://chore-receipt.sociobot.in> (Static Web Apps deployment
`798c57db-2ee6-4125-bee3-b83d7c413dc7`).

## What changed

The repair closes F-1-1 through F-1-18 in `.factory/review-1.md`: offline-safe
caching, mobile Household access, corrupt-data recovery, route focus and
announcements, chore editing/removal, truthful claim tests, no-sync disclosure,
route metadata, complete 404 structure, form errors, copy, provenance,
external-link cue, and current copy audit.

This retry moves Skip to content into the initial document, outside the
asynchronous IndexedDB mount. From a fresh page the first Tab focuses the
visible link. The demo claim also directly opens `?demo=1`. Catalog copy is
now: “Record shared chores, keep receipts, and see what is due next.”

## Exact verification evidence

- Fresh GitHub clone `/tmp/chore-receipt-clean-gxBjv6`: `npm ci` completed
  with zero vulnerabilities; every exact command in `.factory/claims.json`
  passed (11/11).
- Fresh-clone `npm test -- --workers=1`: 25/25 Playwright tests passed.
- Fresh-clone `npm run build` passed and produced `dist/`: initial JS 50.99 kB
  raw / 18.23 kB gzip; CSS 12.59 kB raw / 3.76 kB gzip.
- Local `verify-url.sh` on `/demo` passed in 567 ms; live `verify-url.sh` on
  `/demo` passed in 893 ms. Both found no console errors, `lang=en`, one h1,
  main, no missing image alt text, and no unnamed buttons.
- Cold live browser audit passed first-Tab focus, `?demo=1` banner/reset, all
  six normal route titles/canonicals, 390 px Household navigation, true 404,
  and a visited-404 then offline `/log` navigation. Screenshots are under
  `.factory/evidence/polish-1-retry-live/`.
- Live Playwright Axe passed with no serious or critical violations on `/`,
  `/demo`, `/log`, `/settings`, `/privacy`, `/terms`, and `/404.html`.

`npx @axe-core/cli` was attempted but cannot start without the system Chrome
binary required by CLI/Selenium. The installed Playwright Chromium ran both the
repository Axe test and a separate cold live Axe audit successfully.

Known product gaps: none.

Run locally with `npm ci && npm test -- --workers=1 && npm run build`; then
`npm run preview` and open `/demo` or `/?demo=1`.
