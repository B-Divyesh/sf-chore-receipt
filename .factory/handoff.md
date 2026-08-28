# Chore Receipt handoff

## Shipped

- Offline-first Vite PWA using IndexedDB with separate real and demo databases.
- Shared, unassigned chore board; one-tap dated receipts; repeat-after dates;
  neutral receipt history; undo for the newest receipt.
- Isolated `/demo` with realistic sample chores, reset, and Start for real.
- JSON backup import/export, CSV receipt export, and opt-in QR household copies.
  Imported copies use last-write-wins by `updatedAt`, while receipt history stays visible.
- Paper-cut diorama visual system, including original generated kitchen art.
- Real routes for log, household, privacy, terms, and a styled 404.

## Run and verify

```sh
npm install
npm test
npm run build
```

`npm test` passed on 2026-08-28: 7 Playwright checks passed. The checks cover
the required claims, keyboard add flow, 390px mobile landing, and no serious or
critical axe findings. `npm run build` passed and writes `dist/index.html`.

Build output: JavaScript 16.56 KB gzip; CSS 3.48 KB gzip; hero WebP 91 KB.
Those are below the 200 KB JS, 50 KB CSS, and 300 KB hero budgets.

The Lighthouse CLI could not run in this container because its Chrome tab
crashed at launch. The equivalent automated accessibility check passed with
zero serious/critical axe findings; the performance payload figures are above.

## Privacy and offline

No runtime third-party scripts, fonts, analytics, or network calls are used.
The `@claim:local-only` check intercepts demo requests. The service worker
pre-caches the stable application shell; `@claim:offline-reload` takes the
demo offline and verifies a receipt can still be created.

## Known gaps / next steps

- Household QR copies are opt-in snapshots, not live background sync. This is
  intentional for a static local-first v1; a future peer-to-peer transport can
  reuse the existing conflict-safe merge routine.
- The browser owns local data. People should export JSON before clearing site
  storage or replacing a device.
