# Chore Receipt — polish 6 handoff

## Outcome

Perfection-loop round 6 is complete. The sole new blocker, F-6-1, is fixed:
the shared-copy result has one visible notice and exactly one `role=status`
announcement. Every finding from reviews 1–6 was rechecked through its focused
regression and on the deployed site. No finding remains open.

The repair preserves the static offline PWA, separate real/demo IndexedDB
namespaces, paper-cut household visual system, and existing product scope.
The catalog line is now the 65-character verb-first sentence: “Record shared
chores when they get done and see what is due next.”

## Repair and deployment

- Repair commit: `19f3633b03cce5e6aa568a0da4bb8b101a15d045`.
- Deployment ID: `85fe0d7b-3129-44b5-8554-c5f15f2fcffe`.
- Live product: <https://chore-receipt.sociobot.in>.
- Demo entry: <https://chore-receipt.sociobot.in/?demo=1>.
- Full finding map: [polish-6.md](polish-6.md).

## Exact verification evidence

- Fresh remote clone: `/tmp/chore-receipt-polish6-clean.LpNooG/repo` at the
  repair commit. `npm ci` completed with zero vulnerabilities.
- All 13 commands declared in `.factory/claims.json` passed one by one:
  `demo-isolation`, `demo-reset`, `demo-discard`, `no-scoring`,
  `stored-device`, `offline-reload`, `csv-export`, `json-backup`, `local-only`,
  `qr-share`, `copies-no-sync`, `receipt-next-date`, and `free`.
- The repaired `copies-no-sync` claim passed 10 consecutive local runs. Its
  test asserts the visible `.notice` separately, then asserts exactly one
  `[role=status]` region containing the shared-copy result.
- Clean-clone `npm test -- --workers=1`: 33/33 passed. This includes browser,
  keyboard/focus, 390px/200%-text, seven-route Axe, request privacy, offline
  after a true 404, IndexedDB isolation, import/export, metadata, CSP, and 404
  coverage.
- Work-order gate `npm ci && npm test -- --workers=1 && npm run build`: passed.
- Production `PLAYWRIGHT_BASE_URL=https://chore-receipt.sociobot.in npm test
  -- --workers=1`: 33/33 passed after deployment.
- Build output: `dist/index.html`; initial JavaScript 55,660 bytes raw / 18,832
  bytes gzip; CSS 14,443 bytes raw / 4,130 bytes gzip.
- Factory URL check: [verify.json](evidence/polish-6-live/verify.json) records
  zero console errors, the correct title and language, one h1, one main,
  complete alt text, and labelled buttons.
- Cold production audit: [live-audit.json](evidence/polish-6-live/live-audit.json)
  records `statusRegionCount: 1`, correct click/Back/Forward focus, direct demo
  reset/isolation, same-origin GET-only traffic, six route titles/canonicals,
  true 404, `frame-ancestors`, and zero serious/critical Axe findings.
- Visual evidence: [landing mobile](evidence/polish-6-live/landing-390.png),
  [landing desktop](evidence/polish-6-live/landing-1440.png),
  [direct demo](evidence/polish-6-live/demo-query-390.png),
  [Household](evidence/polish-6-live/settings-390.png),
  [Privacy](evidence/polish-6-live/privacy-390.png),
  [shared-copy result](evidence/polish-6-live/shared-copy-390.png), and
  [404](evidence/polish-6-live/missing-390.png).
- [Live mobile Lighthouse](evidence/polish-6-live/lighthouse-mobile.json):
  performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.0s,
  LCP 1.7s, TBT 130ms, CLS 0.014.

## Run and verify

```sh
npm ci
npm test -- --workers=1
npm run build
PLAYWRIGHT_BASE_URL=https://chore-receipt.sociobot.in npm test -- --workers=1
```

## Known gaps and next steps

None. No TODOs, deferred minor items, or known product defects remain.
