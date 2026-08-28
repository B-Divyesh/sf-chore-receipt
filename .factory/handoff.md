# Adversarial review 1 handoff — FAIL

Reviewed the live Chore Receipt PWA and repository at base
`61751991bc9835d2260c04bee33289f07637cc88`. The complete report is
`.factory/review-1.md`.

No product code was changed. The review found two blockers: a live 404 can
replace the cached app shell and break later offline navigation, and the 390 px
layout hides the only Household link. Additional findings cover corrupt-store
recovery, SPA route focus/announcements, missing chore edit/remove controls,
claim-test coverage, no-sync disclosure, route/404 metadata, a silent form
error, copy, and documentation drift.

Verification performed:

- Cold live reads at 390×844 and 1440×900.
- One-click live demo, Reset, Start for real, pre-existing real-data isolation,
  QR request interception, and normal offline reload.
- Live 404 cache-poison reproduction while offline.
- Live route/title/h1/header/footer/metadata audit and link crawl.
- Live keyboard focus, 44 px targets, 200% text, verify-url, and axe checks.
- Every command in `.factory/claims.json` from a fresh temporary clone: all 10
  passed.
- Full clean-clone `npm test`: 16/16 passed.
- Clean-clone `npm run build`: passed and produced `dist/` (16.95 kB gzip JS).
- All earlier handoff repairs independently checked and confirmed fixed.

Start repair work with F-1-1 and F-1-2, add the regressions specified in the
report, then rerun the complete checklist. The repository is buildable; only
this review and handoff are intended to be committed by this work order.
