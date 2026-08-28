# Independent product verification — FAIL

**Verdict: FAIL — do not release candidate `6d3d9f1ed0372dc357a7c2475cc770e58e211c45`.**

- Tested commit: `6d3d9f1ed0372dc357a7c2475cc770e58e211c45`
- Tested deployment: <https://chore-receipt.sociobot.in>
- Test date: 2026-08-28 UTC
- Artifact: offline-first PWA
- Repository state at start: clean; `HEAD`, `origin/main`, and the requested candidate were identical

The live deployment is the candidate, not an older failed deployment. SHA-256
digests were byte-identical for `index.html`, `assets/app.js`, `assets/app.css`,
`sw.js`, the manifest, both fallback pages, and all inspected public images.

## Release-gate results

### Claims gate

`.factory/claims.json` exists. I ran every listed command separately before the
general test suite, from the clean checkout and through the configured preview
server/demo entry point:

| Claim | Exact command | Result | Independent evidence |
| --- | --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 1/1 | The declared test only cuts the network and clicks an already-loaded control; it never reloads. Live `/demo` offline reload was separately exercised in three fresh contexts and passed 3/3. |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS, 1/1 | Direct demo export contained the header plus four data rows (5 lines total). |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1/1 | The tested completion flow used only same-origin requests. The wider privacy claim is false for QR joining; see CRITICAL-2. |
| `free` | `npm test -- --grep @claim:free` | PASS, 1/1 | No payment or checkout controls, dependencies, or endpoints were found. |

Although all four commands pass, the claims contract itself fails:

1. The offline test does not perform the reload named by its ID or claim.
2. The public README and UI make unlisted claims about JSON export/import,
   one-tap receipts, recurrence calculation, isolated demo storage, QR copying,
   last-write-wins merge, no background sync, and named receipt privacy.
3. The local-only test permits every same-origin URL and does not detect
   household data in a `?join=` request.
4. The demo-storage and QR claims are false on representative flows.

Under the supplied claims contract, unlisted claims and tests that do not prove
their stated outcome are release-blocking.

### First-read and one-click-demo gate

Cold first read at 1440×900:

- What it does: “Record chores when they get done.”
- For whom: “For roommates and families who share the work and need to know
  what is due next.”
- First click: “Try it with sample data,” with the adjacent explanation “See a
  working shared chore board.”

The language portion passes. The mandatory one-click demo fails. Clicking that
primary action navigates client-side to `/demo`, but shows **0 due now**, **No
chores yet**, no demo banner, and uses IndexedDB `chore-receipt-real-v1`.
Directly loading `/demo` does show the banner, four chores, and four receipts,
which isolates the defect to the advertised landing-page path. Evidence:
`evidence/live-first-read-desktop.png`,
`evidence/live-demo-after-one-click.png`, and `evidence/browser-qa.json`.

## Release-blocking findings

### CRITICAL-1 — The primary demo action is neither sampled nor sandboxed

The application computes demo mode once at document load. Its internal
navigation changes the URL to `/demo` without recomputing that state. The
result is an empty board backed by the real-data database and no persistent
“Demo — sample data, nothing is saved” controls. This directly fails the
explicit automatic-fail condition and the demo-sandbox contract.

Reproduction on both local candidate and live deployment:

1. Open `/` in a fresh browser context.
2. Click **Try it with sample data** once.
3. Observe `/demo`, no banner, zero chores, and `chore-receipt-real-v1`.

### CRITICAL-2 — Household data is sent to the hosting origin in the QR URL

The UI and README state “Nothing is sent to us.” A household QR encodes the
entire household packet in `https://chore-receipt.sociobot.in/?join=...`.
Opening a one-chore live share produced a 476-character document request with
a 442-character `join` query before client code removed it from the address
bar. Therefore chore and receipt data can enter CDN/server access logs, browser
history, and copied URLs. The declared network test misses this because it
allows every same-origin request and never exercises joining.
Evidence: `evidence/qr-privacy-request.json`.

### HIGH-1 — The required household QR fails at three completed chores

The direct demo's ordinary four-chore/four-receipt sample reports: “The
household QR could not be made. Export a JSON backup instead.” No QR image or
share link is produced. An incremental boundary test succeeded for one and two
completed chores, then failed for every size from three through eight. The
brief names a household invite QR as part of the smallest useful product, so
this is a core-flow failure rather than an optional enhancement.

The implementation also silently limits packets to 10 chores and 25 receipts,
despite copy that says the QR imports the current chores and receipts.
Evidence: `evidence/qr-capacity.json`.

### HIGH-2 — A structurally malformed JSON backup can persistently break the app

Invalid JSON syntax correctly returns an inline recovery message. However, a
JSON object with `chores` and `receipts` arrays but invalid receipt dates is
accepted as “Backup imported.” Opening **Receipt log** then throws `Invalid
time value`; after reload, the app only shows “Browser storage is unavailable,”
which is false, and the offered reload repeats the failure. The user receives
no usable recovery path other than manually clearing site data.
Evidence: `evidence/import-validation.json`.

### HIGH-3 — Service-worker updates can leave users on stale application code

The production build uses stable `/assets/app.js` and `/assets/app.css` names,
and the worker serves cached assets first. The build does not couple an app
change to a change in `sw.js` or its fixed `chore-receipt-v1` cache name. In a
controlled two-version test, the server changed `app.js` from version 1 to 2
while `sw.js` stayed byte-identical. `registration.update()` found no new
worker, no update toast appeared, and reload still executed version 1.
Evidence: `evidence/sw-update-qa.json`.

## Other findings

### MEDIUM — Dialog and validation recovery defects

- The visible × **Close add chore form** button leaves the modal open. Escape
  closes it, so pointer users receive a broken advertised control.
- A whitespace-only chore name is considered valid by the browser, then is
  silently ignored by application code. The modal stays open with an empty
  live error region and no instruction.

### MEDIUM — “Due now” includes work that is not due

A chore due in 23 hours is labelled “Due in 1 day” and simultaneously counted
under “2 due now.” A chore overdue by 30 hours reads “1 days overdue.” This
undermines the product's central promise of a trusted next-due record.

### MEDIUM — Keyboard start position and mobile touch targets miss the baseline

Initial rendering programmatically focuses the `<h1>`. The first Tab therefore
jumps to **Try it with sample data**, bypassing the skip link and header links;
the skip link becomes reachable only after cycling through the page. Visible
focus outlines themselves are good.

At 390 px, eight visible interactive elements are under 44 px high, including
both header links (20 px), **Add your first chore** (24 px), the privacy link
(19 px), and footer links (19 px). There is no horizontal overflow.

### MEDIUM — The deployed 404 and fallback pages violate routing/CSP requirements

- `/not-a-page` returns HTTP 200 with the SPA rather than an HTTP 404.
- Direct `/404.html` and `/offline.html` loads log CSP errors because both use
  inline `<style>` while `style-src` is `'self'`; their intended styling is
  blocked.

### LOW — Asset caching does not use the required immutable strategy

The live stable-name JS and CSS receive `cache-control: public,
must-revalidate, max-age=30`, not content-hashed filenames with long-lived
immutable caching. Root/worker short caching is appropriate, but application
assets do not meet the supplied PWA performance policy.

### LOW — Research source file is absent

`.factory/brief.json` is missing from the candidate even though the factory
contract identifies it as the researched scope source. The externally supplied
brief was used for this verification.

## Passing evidence

### Build and automated checks

- `npm ci`: PASS; 53 packages audited, 0 vulnerabilities.
- `npm audit --audit-level=high`: PASS; 0 vulnerabilities.
- `npm test`: PASS; 7/7 Playwright tests.
- `npm run build`: PASS; TypeScript strict check and Vite production build;
  `dist/index.html` produced.
- No lint script exists.

Built payloads:

- JavaScript: 43,475 bytes raw / 16,327 bytes gzip.
- CSS: 11,182 bytes raw / 3,483 bytes gzip.
- Hero WebP: 93,114 bytes.

All are within the supplied 200 KB JS, 50 KB CSS, and 300 KB hero budgets.

### Functional paths

- Direct `/demo` has a separate `chore-receipt-demo-v1` database, four chores,
  four receipts, reset controls, and **Start for real**.
- Adding a normal chore, persistence after reload, one-tap completion, undo,
  JSON export, and a populated five-line demo CSV export work.
- A one-chore QR/share link imports into a fresh context and announces that
  newer receipts were kept; capacity fails at three items as reported above.
- Invalid JSON syntax has a clear inline message.
- Empty states, privacy, and terms pages exist.

### PWA/offline

- Chromium reported a valid manifest with no manifest errors, 192/512 icons,
  standalone display, versioned start URL, and matching colors.
- Live direct-demo first load followed by network-offline reload passed in
  three fresh contexts: four chores remained and there were no console/page
  errors. Evidence: `evidence/offline-live-3-runs.json`.
- The repository claim test passes, but does not itself reload.
- The service-worker upgrade path fails the app-only update test described in
  HIGH-3.

### Accessibility and responsive behavior

- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, title, `lang="en"`, one
  `<h1>`, `<main>`, all image alt attributes, no unlabeled buttons, and no
  load console errors. Its measured load was 800 ms.
- Playwright + axe-core 4.13 found zero serious or critical violations on `/`,
  `/demo`, `/log`, `/settings`, `/privacy`, `/terms`, and an unknown route.
- The same pages have one `<h1>`, one `<main>`, English language, and route
  titles.
- Reduced-motion emulation matched and reduced transitions to 0.01 ms.
- A 200% text-size run at 1280 px had no horizontal overflow or clipped tested
  text/control.
- Desktop and 390 px screenshots are under `evidence/`; the mobile layout has
  no horizontal overflow and retains the primary action above the fold.

### Performance

Lighthouse 12.8.2 mobile against the live URL:

| Category/metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 1.0 s |
| LCP | 1.7 s |
| Total blocking time | 50 ms |
| CLS | 0.014 |

Raw report: `evidence/lighthouse-live-mobile.json`.

### Privacy, requests, headers, and links

- Normal landing/demo/completion flows made only product-origin requests; no
  analytics, runtime third-party scripts, remote fonts, AI services, payment
  providers, or raw secrets were found.
- All crawled internal links and the Param Factory footer link returned 200.
- Live responses include HTTPS/HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive CSP.
- Normal tested routes produced no console or page errors. The standalone
  fallback pages produce the CSP errors reported above.
- This is a static PWA with no product API, unlock endpoint, sign-in, or
  backend. API rate-limit, Entra authority, backend concurrency, persistence
  health, and package-consumer checks are not applicable.

## Required remediation before reverification

1. Make the first-screen demo action perform a real document transition or
   reinitialize storage mode, and prove it never reads/writes real data.
2. Replace URL-query household transport with a design that does not send the
   household payload to the hosting origin; update privacy copy and tests.
3. Make representative household copies work beyond two completed chores and
   test conflict/tombstone and capacity boundaries.
4. Strictly validate imported backups before saving, with a recoverable error.
5. Tie service-worker/cache versions to build assets and test an actual update.
6. Repair modal close/error behavior, due-boundary wording, keyboard order,
   touch targets, true 404 delivery, and CSP-compatible fallback styling.
7. List and independently test every public claim, including the demo and QR
   paths.
