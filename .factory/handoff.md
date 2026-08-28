# Chore Receipt — polish 2 handoff

## Delivered

Repair commit `63245a33b6700011b90bc91f5231d5dfd290594f` closes every finding from
`.factory/review-1.md` and `.factory/review-2.md`.

- The landing page now contains a clearly labelled, non-persistent Maple
  Street sample board before “How it works.” It shows chores, a due state, a
  dated receipt, and its next date; its link opens the editable isolated demo.
- JSON export is now named **Export JSON backup** on the board and log, and is
  present beside JSON import on Household.
- The existing local-first PWA, separate demo IndexedDB namespace, service
  worker, legal routes, real 404, route metadata, recovery, QR copy, and
  cut-paper receipt visual identity were retained.
- Catalog copy is now: “Record shared chores, track receipts, and see the next
  due date.”

## Exact verification

Clean clone: `/tmp/chore-receipt-polish2.meoE6X` from repair commit `63245a3`.

1. `npm ci` completed with 0 vulnerabilities.
2. Every exact command in `.factory/claims.json` ran separately and passed:
   `@claim:demo-isolation`, `@claim:demo-discard`, `@claim:stored-device`,
   `@claim:offline-reload`, `@claim:csv-export`, `@claim:json-backup`,
   `@claim:local-only`, `@claim:qr-share`, `@claim:copies-no-sync`,
   `@claim:receipt-next-date`, and `@claim:free` (11/11).
3. `npm test -- --workers=1` passed 26/26, including route metadata, focus and
   Back/Forward, mobile targets and 200% text, recovery, privacy request-body
   checks, demo isolation/reset, service-worker offline handling, and Axe
   serious/critical checks on every local route and 404.
4. `npm run build` passed and produced `dist/index.html`; initial JS is
   52.32 kB raw / 18.47 kB gzip and CSS is 14.41 kB raw / 4.10 kB gzip.
5. Deployed with `/opt/fleet/lib/deploy-static.sh chore-receipt dist`.
   Azure upload deployment `821f3976-f965-4f54-8ca6-454ee0e8c56e` succeeded.
6. Cold live verification of `https://chore-receipt.sociobot.in/` passed via
   `/opt/fleet/lib/verify-url.sh`: HTTP 200, title/lang/one h1/main/alt
   checks, and zero console errors. Evidence:
   `.factory/evidence/polish-2-live/verify.json` and its desktop/mobile
   screenshots.
7. A fresh live Playwright audit checked `/`, `/demo`, `/log`, `/settings`,
   `/privacy`, `/terms`, and a true 404 for titles, canonical metadata, one
   h1/main, and zero serious/critical Axe findings. It also confirmed the
   preview, `?demo=1` banner/reset/start-real, mobile Household navigation,
   Household JSON backup next to import, h1 focus after navigation, and the
   404-poisoning offline regression. The deliberate missing-route request
   generated the expected browser failed-resource 404 message; no other page
   errors occurred. Screenshots are in `.factory/evidence/polish-2-live/`.
8. Mobile Lighthouse on the deployed landing page scored 100 performance and
   100 accessibility; LCP was 1,509.667 ms and CLS 0.006. Evidence:
   `.factory/evidence/polish-2-live/lighthouse-mobile.json`.

## Run locally

```sh
npm ci
npm test -- --workers=1
npm run build
npm run preview
```

Open `/demo` or `/?demo=1` for the isolated sample board.

## Known gaps

None.
