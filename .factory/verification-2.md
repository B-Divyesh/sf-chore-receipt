# Independent product verification — FAIL

**Verdict: FAIL — do not release candidate `1136552cd34862965573cd090de62b3cd0eea25e` without the two remediations below.**

- Tested commit: `1136552cd34862965573cd090de62b3cd0eea25e` (`main`, clean checkout)
- Tested URL: <https://chore-receipt.sociobot.in>
- Test date: 2026-08-28 UTC
- Artifact: local-first offline PWA

The live deployment is this candidate, not the earlier failed deployment. SHA-256
matched local `dist/` byte-for-byte for `index.html`, the JS and CSS chunks,
`sw.js`, manifest, 404/offline pages, fallback stylesheet, and hero image.

## Release-gate result

### Claims — PASS

`.factory/claims.json` exists. From the clean checkout, after `npm ci`, I ran
every declared command separately through the configured production-preview
server and its `/demo` entry point. Every command exited zero.

| Claim | Declared command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS (1/1) |
| `stored-device` | `npm test -- --grep @claim:stored-device` | PASS (1/1) |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS (1/1) |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS (1/1) |
| `json-backup` | `npm test -- --grep @claim:json-backup` | PASS (1/1) |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS (1/1) |
| `qr-share` | `npm test -- --grep @claim:qr-share` | PASS (1/1) |
| `receipt-next-date` | `npm test -- --grep @claim:receipt-next-date` | PASS (1/1) |
| `free` | `npm test -- --grep @claim:free` | PASS (1/1) |

The subsequent complete suite also passed: `npm test` — **13/13** Playwright
tests. `npm run build` passed TypeScript checking and produced `dist/`. No
lint script is defined. `npm ci` installed 53 packages with zero reported
vulnerabilities.

### First read and one-click demo — PASS

Cold live landing page, 1440×900:

- It does: “Record chores when they get done.”
- It is for: “roommates and families who share the work and need to know what
  is due next.”
- Click first: **Try it with sample data**; the adjacent text says it opens a
  working shared chore board.

One click performed a document navigation to `/demo`, showed the persistent
Demo controls, and displayed four realistic seeded chores with four receipts.
There were no console or page errors.

## Release-blocking defects

### HIGH-1 — Leaving demo mode does not discard the demo data

The supplied demo-sandbox contract requires that leaving demo mode discard the
demo data, or explicitly offer to keep it as real data. The **Start for real**
control opens an empty real board, but it leaves the modified demo IndexedDB
database intact.

Fresh live reproduction:

1. Open `/demo` and mark “Water the plants” done.
2. The demo database changes from four to five receipts.
3. Click **Start for real**. The real board is empty and has no demo banner.
4. Inspect `chore-receipt-demo-v1`, or re-open `/demo`: the database still has
   five receipts and the modified completion time.

The banner says “Demo — sample data, nothing is saved,” which is misleading
for this persistence. The real namespace remains isolated (so no real data is
overwritten), but the stated sandbox lifecycle is not met.

**Remediation:** delete the demo namespace when leaving demo mode, or present
one explicit keep-as-real choice and otherwise discard it. Add a claim test
that changes demo data, leaves demo, and proves the demo namespace is gone.

### MEDIUM-1 — Hashed deployed assets lack immutable caching

The live JS, CSS, and `sw.js` have content hashes / a versioned worker cache,
but the deployment sends:

```
cache-control: public, must-revalidate, max-age=30
```

for `assets/index-JruqpkuJ.js`, `assets/index-C7FEihq2.css`, and `sw.js`.
The PWA performance contract requires long-lived immutable caching for hashed
assets. This is an observable production deployment failure, even though the
service worker precache makes repeat offline use work.

**Remediation:** configure the static host response policy so content-hashed
`/assets/*` receive a long immutable `Cache-Control` policy. Keep `sw.js` and
HTML short-lived/revalidated so upgrades are discovered.

## Passing functional evidence

- Normal real-data flow: add “Clean the oven” with one-day recurrence, mark it
  done, receive the dated receipt, reload, and retain the chore — PASS.
- Invalid input/recovery: whitespace chore names give an announced message;
  malformed JSON says nothing was imported; reload continues to the Household
  page — PASS.
- Backup/data ownership: JSON export/import and CSV export (header plus four
  receipts) — PASS.
- Sharing/privacy: a four-receipt household QR was generated and imported into
  a fresh live context. Its payload is after `#join=` rather than `?join=`;
  the recipient made no request containing `join=`. Normal landing, demo,
  completion, and QR flows made only same-origin requests. No analytics,
  remote fonts/scripts, payment, AI, sign-in, or product API endpoint exists.
- Offline/PWA: after a live or local `/demo` first visit, Chromium had an
  active `chore-receipt-d6fb6c1e3d87` worker/cache. With network disabled, a
  document reload retained the demo board and household text without errors.
  A controlled changed-worker variant triggered the in-app “A new Chore
  Receipt is ready. Refresh now” update toast.
- The app is static: no API/unlock/backend endpoint exists, so rate-limit,
  concurrency, persistence-boundary server health, and Entra sign-in checks
  are not applicable.

## Accessibility, responsive, headers, and performance

- `/opt/fleet/lib/verify-url.sh` passed against local preview and live:
  HTTPS 200, title, `lang=en`, one `h1`, `main`, image alt text, labelled
  buttons, and no load errors. Live measured load was 661 ms.
- Axe-core 4.13, with CSP bypass only for the audit injection, found zero
  serious or critical findings on `/`, `/demo`, `/log`, `/settings`,
  `/privacy`, `/terms`, and the deployed 404 page. All normal routes had one
  `h1` and one `main`.
- At 390×844, no visible interactive control was below 44 CSS px; there was no
  horizontal overflow. Keyboard Tab first reached the visible skip link with a
  3 px focus ring. Reduced-motion emulation changed transitions to 0.01 ms.
- Live `/not-a-page` returns HTTP 404 with the styled missing-page content;
  CSP, HSTS, `nosniff`, and strict-origin referrer policy are present. The
  expected 404 resource console message is the sole error on that intentionally
  missing route; normal routes have none.
- Fresh Lighthouse 12.8.2 mobile run: **Performance 99, Accessibility 100,
  Best Practices 100, SEO 100**; FCP 0.9 s, LCP 1.5 s, TBT 130 ms, CLS 0.011.
  Built JS is 44,740 bytes raw / 16,612 bytes gzip, CSS 11,404 / 3,532 bytes
  gzip, and the hero WebP is 93,114 bytes — all within the stated budgets.

## Required next steps

1. Fix demo teardown/explicit transfer and add an outcome-level regression
   claim.
2. Set immutable caching for production hashed assets, then verify the live
   response headers.
3. Re-run this independent verification on the resulting candidate.
