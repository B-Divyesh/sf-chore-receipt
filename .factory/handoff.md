# Chore Receipt — polish 4 handoff

## Outcome

All cumulative findings from `.factory/review-1.md` through
`.factory/review-4.md` are fixed and verified. Chore Receipt remains a static,
local-first offline PWA with the existing paper-cut household identity.

The released product is <https://chore-receipt.sociobot.in>. Product commits
are `76a040c`, `a86da60`, and `6dd0fa3`. The final production deployment ID is
`bcabe938-7437-4ee4-b1fd-f6e67a8a029c`.

## What changed

- Reset now removes stale completion/Undo state, restores the exact sample,
  announces the reset, returns focus, and leaves real household data intact.
- QR and JSON copies carry chore-removal tombstones. Repeat imports apply
  edits and removals while retaining receipt history and destination-only
  chores. Same-tab `#join` navigation now imports immediately.
- `.factory/claims.json` now contains 13 scoped claims. Reset, editable demo,
  and no-scoring outcomes have declared tests; a registry test enforces one
  tagged test per claim.
- The 404, board introduction, receipt actions, README privacy copy, catalog
  description, and claim wording use direct, consistent language.
- The styled JSON chooser now hides its native input correctly on mobile.
- The paper-cut diorama, receipt shapes, warm paper palette, moss/clay colors,
  serif/sans type, and restrained motion remain unchanged.

The complete finding-by-finding mapping is in `.factory/polish-4.md`.

## Verification

Final clean clone: `/tmp/chore-receipt-polish4-release.lN2REJ/repo` at
`6dd0fa34083511f54ef9f5db679ddcc856b21465`.

1. `npm ci` passed with 0 vulnerabilities.
2. All 13 exact claim commands from `.factory/claims.json` passed separately.
3. `npm test -- --workers=1` passed 30/30 in that clean clone. Two additional
   plain-copy regressions then raised the current local suite to 32/32.
4. `npm run build` passed and produced `dist/index.html`. Initial JavaScript is
   55.67 kB raw / 19.12 kB gzip; CSS is 14.44 kB raw / 4.12 kB gzip.
5. `PLAYWRIGHT_BASE_URL=https://chore-receipt.sociobot.in npm test -- --workers=1`
   passed 32/32 against the final deployment.
6. The factory URL verifier found no console errors and confirmed the title,
   language, one h1, one main, alt text, and labelled buttons.
7. The live seven-route Axe integration reported no serious or critical
   issues. Mobile 200% text, 44px targets, keyboard/dialog behavior, route
   focus/announcements, reduced motion, privacy requests, and offline reload
   all pass in the suite.
8. Live Lighthouse scored 100 in performance, accessibility, best practices,
   and SEO. FCP was 955 ms, LCP 1,555 ms, TBT 0 ms, and CLS 0.014.
9. The final cold browser audit confirmed all six 200 routes, the real 404,
   direct `?demo=1`, Reset, same-tab repeat import, mobile navigation, no
   horizontal overflow, route metadata, legal links, and zero console errors.

Evidence is under `.factory/evidence/polish-4-live/`, especially
`live-audit.json`, `verify.json`, `lighthouse-mobile.json`,
`demo-reset-mobile.png`, `copy-reimport-mobile.png`, `settings-mobile.png`, and
`404-mobile.png`.

## Run and deploy

```sh
npm ci
npm test -- --workers=1
npm run build
```

Deploy `dist/` with the configured static work order. No backend, account,
payment service, analytics, remote font, or runtime AI dependency is required.

## Known gaps and next steps

None within the researched brief or cumulative review scope. No follow-up is
required for release.
