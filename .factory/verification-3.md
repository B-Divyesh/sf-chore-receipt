# Independent product verification — PASS

**Verdict: PASS — candidate `b022171f7223dd9715bc2b4d45cb13f3576a19dc` is releasable.**

- Tested commit: `b022171f7223dd9715bc2b4d45cb13f3576a19dc` (`main`, clean checkout)
- Tested URL: <https://chore-receipt.sociobot.in>
- Test date: 2026-08-28 UTC
- Artifact: local-first offline PWA

This independent run confirms the repaired deployment rather than relying on
the prior repair handoff. The live HTML, JS, CSS, service worker, manifest,
hero art, 404 page, and offline page matched the fresh local production build
byte-for-byte (SHA-256). No release-blocking defects were found.

## First read and demo

Cold live load at 1440×900 said exactly what is needed:

- **Does:** “Record chores when they get done.”
- **For whom:** “For roommates and families who share the work and need to
  know what is due next.”
- **First click:** **Try it with sample data**, with adjacent text “See a
  working shared chore board.”

The link navigated in one click to `/demo`, populated a four-chore/four-receipt
sample, and showed persistent Demo, Reset demo, and Start for real controls.
The cold-load network consisted only of the document and same-origin JS, CSS,
and hero art; there were no console or page errors.

## Release gates

### Claims — PASS

`.factory/claims.json` exists and declares ten outcome tests. From the clean
checkout after `npm ci`, I ran every listed command against the configured
production-preview demo entry point; each exited zero. A later `npm test` run
also passed all 16 Playwright tests.

| Claim | Result |
| --- | --- |
| `demo-isolation` | PASS |
| `demo-discard` | PASS |
| `stored-device` | PASS |
| `offline-reload` | PASS |
| `csv-export` | PASS |
| `json-backup` | PASS |
| `local-only` | PASS |
| `qr-share` | PASS |
| `receipt-next-date` | PASS |
| `free` | PASS |

### Local build and tests — PASS

- `npm ci`: 53 packages installed; audit reported 0 vulnerabilities.
- `npm run build`: PASS (`tsc -b` then Vite); `dist/` produced.
- `npm test`: **16/16** Playwright tests passed.
- No separate lint script is defined in `package.json`.
- Production bundle: JS **45,071 B raw / 16,950 B gzip**; CSS **11,544 B raw /
  3,550 B gzip**; hero WebP **93,114 B**. These are within the PWA budgets.

## Independent live product exercise — PASS

- Real-data path: blank chore name gave the live announced recovery message;
  adding “Clean the oven” on a one-day recurrence, marking it done, receiving
  the receipt/next date, and reloading retained the chore.
- Invalid-data recovery: malformed JSON showed “That file is not a valid Chore
  Receipt backup. Nothing was imported.” without corrupting the board.
- Demo/data ownership: completing the sample chore, clicking Start for real,
  and re-entering demo left only the real IndexedDB database after exit and
  restored the original four receipts on re-entry.
- Exports and transfer: the changed live demo CSV had its required header and
  six lines (header plus five receipts); QR share used `#join=`, imported in a
  fresh context, and placed no `join=` value in any request URL.
- Privacy: sender and recipient flows made only same-origin requests. There
  are no analytics, remote fonts/scripts, accounts, payments, AI calls, or
  server-side product endpoints. Rate limiting, backend health/concurrency,
  and Entra authentication checks are therefore not applicable.
- PWA: after the first live `/demo` visit, Chromium controlled the page with
  `sw.js` and cache `chore-receipt-766c961efcf9`. With the context offline, a
  document reload still rendered “Shared chore board” with no errors. A
  changed service-worker response in a disposable local copy of the exact
  production build displayed “A new Chore Receipt is ready. Refresh now”,
  proving the update notification path.

## Accessibility, responsive behavior, security, and performance — PASS

- `/opt/fleet/lib/verify-url.sh` passed against the live URL: HTTPS 200,
  title, `lang=en`, one `h1`, one `main`, complete image alt text, labelled
  buttons, no errors; measured load was 695 ms. Evidence is in
  `.factory/evidence/verification-3/`.
- Axe-core 4.13 (with CSP bypass only for the local audit injection) found
  **zero serious or critical** findings on `/`, `/demo`, `/log`, `/settings`,
  `/privacy`, `/terms`, and `/not-a-page`. The intended 404 route alone logs
  the expected failed-resource message and returned HTTP 404; normal routes
  had no errors.
- At 390×844, keyboard Tab first reached the skip link, every visible
  interactive control was at least 44×44 CSS px, and 200% text caused neither
  horizontal overflow nor clipped controls. Reduced-motion computed transition
  duration was `0.00001s`.
- Response policy was correct: hashed JS/CSS are `max-age=31536000, immutable`;
  `sw.js` is `max-age=0, must-revalidate`; HTML is short-lived/revalidated.
  Live responses supplied CSP, HSTS, `nosniff`, and strict-origin referrer
  policy.
- Live Lighthouse 12.8.2 mobile: **Performance 99, Accessibility 100, Best
  Practices 100, SEO 100**; FCP 0.9 s, LCP 1.8 s, TBT 80 ms, CLS 0.011.

## Defects

None found at blocker, high, medium, or low severity.
