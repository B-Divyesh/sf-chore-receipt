# Chore Receipt independent-verification handoff

## Result: FAIL — do not release

- Candidate: `6d3d9f1ed0372dc357a7c2475cc770e58e211c45`
- Live URL: <https://chore-receipt.sociobot.in>
- Verified: 2026-08-28 UTC
- Full report: [verification.md](verification.md)

The live deployment byte-matches the candidate's inspected application
artifacts. This is a product failure, not a deployment-only failure.

## Release blockers

1. The first-screen **Try it with sample data** action opens an empty board,
   has no demo banner, and uses the real IndexedDB namespace. Only a direct
   `/demo` document load is seeded and isolated.
2. QR joining sends encoded household data to the hosting origin in the
   `?join=` document request despite the “Nothing is sent to us” claim.
3. Household QR generation fails at three completed chores; the shipped sample
   has four and cannot generate a QR.
4. A superficially structured backup with invalid dates is accepted, persists,
   and breaks the receipt log with no effective recovery.
5. Stable cached app asset names can remain stale when an app build changes
   without a byte change to `sw.js`; the update test stayed on version 1.
6. Public capability/privacy statements are missing from `claims.json`, and
   the offline claim test does not perform an offline reload.

Additional defects: broken modal close button, silent whitespace validation,
incorrect “due now” boundary/grammar, undersized mobile touch targets, initial
focus bypassing header/skip navigation, HTTP 200 for unknown routes, and CSP
errors on the standalone 404/offline pages.

## Verification summary

```sh
npm ci
npm test
npm run build
npm audit --audit-level=high
```

- Claim commands: 4/4 passed individually.
- Full suite: 7/7 passed.
- Type/build: passed; `dist/index.html` produced.
- Dependency audit: 0 vulnerabilities.
- No lint script exists.
- Playwright axe: zero serious/critical findings on all application routes.
- Live offline reload: passed in three fresh contexts.
- Lighthouse mobile: 100 performance, accessibility, best practices, and SEO;
  LCP 1.7 s, TBT 50 ms, CLS 0.014.
- Payload: 16,327-byte gzip JS, 3,483-byte gzip CSS, 93,114-byte hero WebP.
- Normal flows had no console errors or third-party runtime requests.

## Reverification focus

Fix and add tests for the landing-to-demo transition/storage isolation, QR
privacy and capacity, imported-data validation/recovery, and a two-version
service-worker update. Then address the interaction/accessibility/routing
findings and make every public claim appear exactly once in `claims.json` with
an outcome-level demo test.
