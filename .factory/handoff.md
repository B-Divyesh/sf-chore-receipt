# Chore Receipt — review 5 handoff

## Outcome

Review 5 is committed as `.factory/review-5.md`. It is a **FAIL** with one
minor remaining finding: live CSP headers do not contain `frame-ancestors`.
No product code was changed.

## Verification run

- Cold live Chromium checks at 390x844 and 1440x900 confirmed the job,
  audience, and one-click demo action before scrolling.
- Direct `/demo` and `/?demo=1` showed the four-chore sample, persistent demo
  controls, only the `chore-receipt-demo-v1` database, and same-origin GET
  requests only.
- All 13 exact commands in `.factory/claims.json` passed from a fresh clone.
- The fresh clone passed `npm test -- --workers=1` (32/32) and `npm run build`.
  The build produced `dist/`; initial JS was 19.12 kB gzip.
- Live route checks verified the six normal routes, the designed 404, metadata,
  one h1/main per route, headers/footers, and crawled links.

## Remaining work

Add `frame-ancestors 'self'` to the response CSP in
`public/staticwebapp.config.json`, and add a normal-route plus 404 response
header test. Re-run the review checklist after deployment.
