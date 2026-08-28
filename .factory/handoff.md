# Chore Receipt — adversarial review 6 handoff

## Outcome

Review 6 is complete with verdict **FAIL**. One blocking finding remains:
`F-6-1`. The exact `copies-no-sync` claim command failed in a clean clone
because the live re-import result appears in two `role="status"` regions. A
manual production flow confirmed the duplicate announcement.

No product code was changed. The review is in `.factory/review-6.md`.

## Verification

- Fresh mobile and desktop cold reads at 390×844 and 1440×900.
- One-click demo, reset, real/demo IndexedDB isolation, and Start for real.
- Live request log: same-origin GETs only during landing and demo entry.
- All 13 claim commands run separately from
  `/tmp/chore-receipt-review6-clean.SnAhGZ/repo`: 12 passed; only
  `copies-no-sync` failed.
- Clean full suite: 33/33 passed after the isolated failure.
- Live full suite: 33/33 passed.
- `npm run build`: passed; `dist/index.html` produced; app JS 55.67 kB raw /
  19.12 kB gzip.
- Factory URL verifier: no console errors; one h1; one main; `lang="en"`; alt
  text and button labels present.
- Live route and link crawl, metadata, designed 404, CSP, and all historical
  findings checked.

## Remaining work

Use one status region for the shared-copy result, update the claim test to
assert the visible notice and exactly one announcement without an ambiguous
text locator, then rerun every claim command and both full suites.
