# Repair handoff — PASS

Work order `chore-receipt-repair-2` repaired both release blockers reported in
commit `383b567263f3b7a4bf2b5318325b7d5c0c558da2` against candidate
`1136552cd34862965573cd090de62b3cd0eea25e`. The repaired static PWA is live at
<https://chore-receipt.sociobot.in>.

## Repairs

1. **Demo teardown:** **Start for real** now waits for deletion of
   `chore-receipt-demo-v1` before opening the real board. **Reset demo** also
   waits for deletion before reseeding. The new `@claim:demo-discard`
   regression changes the sample, leaves demo mode, proves the demo database
   is absent, and confirms a later demo has only the four original receipts.
2. **Response policy:** `/assets/*` now receives
   `Cache-Control: public, max-age=31536000, immutable`. `/sw.js` explicitly
   receives `public, max-age=0, must-revalidate`; HTML remains short-lived.
   The regression checks the source and shipped deployment config plus hashed
   JS and CSS filenames.
3. **Mobile text and targets:** the 390 px layout now reflows cleanly at 200%
   text size, keeps completion labels visible, and gives the receipt-log and
   footer links 44×44 px targets. The mobile regression covers `/` and `/demo`.

The brief, local-first storage model, visual thesis, routes, exports, QR share,
and all previously passing behavior were preserved. No AI feature was added;
the researched job does not need one.

## Local verification

Run from a clean checkout with Node 20 or newer:

```sh
npm ci
npx tsc -b --pretty false
npm test
npm run build
```

Observed on 2026-08-28 UTC:

- `npm ci`: 53 packages audited, 0 vulnerabilities.
- Every command in `.factory/claims.json`: PASS; 10 claims, each with exactly
  one tagged outcome regression.
- `npm test`: 16/16 Playwright tests passed.
- TypeScript: PASS. No separate lint script or package/consumer surface exists.
- `npm run build`: PASS; `dist/index.html` exists. JS is 45,071 bytes raw /
  16,720 bytes gzip; CSS is 11,544 bytes raw / about 3.6 KB gzip; hero WebP is
  93,114 bytes.
- `/opt/fleet/lib/verify-url.sh`: PASS at 1366×900 and 390×844; 594 ms local
  load, no console errors, one `h1`, one `main`, `lang=en`, complete alt text,
  and labelled buttons.
- Axe 4.13 on `/`, `/demo`, `/log`, `/settings`, `/privacy`, `/terms`, and the
  fallback page: 0 serious or critical findings.
- Keyboard starts on the visible skip link. Reduced-motion transition is
  0.01 ms. At 390 px, targets are at least 44×44 px; at 200% text there is no
  horizontal overflow or clipped control text.
- Privacy flow: all requests stayed same-origin and no `join=` payload entered
  a request. QR data remained in the fragment.
- PWA: an offline `/demo` document reload retained the four-chore board. A
  controlled changed worker showed “A new Chore Receipt is ready. Refresh now”.
- Local Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; LCP 2.0 s, TBT 0 ms, CLS 0.011.

Evidence is in `.factory/evidence/repair-2-local/` and
`.factory/evidence/repair-2-lighthouse-mobile.json`.

## Deployment and live verification

Factory static deployment completed in Azure Static Web Apps deployment
`9d8f884b-4bae-4610-98f1-934da43e192a` from repair commit `3e126d1`.

- Live `index.html`, JS, CSS, and `sw.js` SHA-256 hashes match local `dist/`.
- Live JS/CSS use `max-age=31536000, immutable`; `sw.js` uses
  `max-age=0, must-revalidate`; HTML uses `max-age=30, must-revalidate`.
- A changed demo was discarded before real mode opened; re-entry had four
  receipts and no leaked real data.
- Live offline reload, same-origin privacy flow, 390 px/200% reflow, 44 px
  targets, keyboard focus, and axe serious/critical checks passed without
  console errors.
- HTTPS, CSP, HSTS, `nosniff`, referrer policy, and the styled HTTP 404 passed.
- Live Lighthouse 12.8.2 mobile: 100/100/100/100; FCP 0.9 s, LCP 1.8 s,
  TBT 0 ms, CLS 0.011.

Live evidence is in `.factory/evidence/repair-2-live/` and
`.factory/evidence/repair-2-lighthouse-live-mobile.json`.

## Known gaps and next steps

No release-blocking gaps remain. The app has no backend, accounts, payments,
AI calls, package consumer, or external data service, so those checks do not
apply. Independent verification should rerun the ten declared claim commands
and confirm the two live cache policies above.
