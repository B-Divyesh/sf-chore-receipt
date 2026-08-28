# Chore Receipt — adversarial review 4 handoff

## Work completed

- Reviewed the deployed product cold at 390×844 and 1440×900.
- Read the brief, design, claims, demo documentation, README, all prior
  reviews, all polish records, and the prior handoff.
- Rechecked every earlier finding on the live site and in source/tests.
- Audited landing and README copy, the one-click demo, storage isolation,
  Reset, Start for real, request privacy, offline behavior, routes, metadata,
  links, focus/history, accessibility, 404 design, visual identity, and missed
  leverage.
- Wrote `.factory/review-4.md`. No product code was changed.

## Verdict

**FAIL.** The review records nine findings. Blocking findings are the stale
completion result left by **Reset demo** and repeated claim-coverage
overstatement F-1-15. Re-import also fails to carry removed chores to another
device despite the update instruction.

## Verification

Clean clone: `/tmp/chore-receipt-review4.6b62HE/repo` at
`28290e0aa2797abdd03810e35e2e9159112dc074`.

1. `npm ci` passed with 0 vulnerabilities.
2. Every exact command in `.factory/claims.json` passed individually: 11/11.
3. `npm test -- --workers=1` passed 27/27 in the clean clone.
4. `npm run build` passed and produced `dist/`; initial JS is 53.96 kB raw /
   18.74 kB gzip.
5. After producing the local `dist/` artifact needed by one repository-only
   cache assertion,
   `PLAYWRIGHT_BASE_URL=https://chore-receipt.sociobot.in npm test -- --workers=1`
   passed 27/27.
6. `/opt/fleet/lib/verify-url.sh https://chore-receipt.sociobot.in/ <temp-dir>`
   passed with no console errors and confirmed language, title, h1, main, alt
   text, and labelled buttons.
7. Manual live checks confirmed demo/real IndexedDB separation, Start for real
   deletion, same-origin GET-only request traffic, true-404 then offline
   recovery, six route metadata sets, designed HTTP 404, link status, and
   click/Back/Forward focus announcements.
8. Manual live checks reproduced the two behavior gaps: Reset restored four
   stored receipts but retained the false receipt notice and Undo control; a
   re-import after source removal left the removed chore on the recipient.

## Handoff notes

See `.factory/review-4.md` for exact quotes, evidence, copy counts, every prior
finding, and concrete fixes. The highest-priority repair is to clear transient
state during Reset and add a declared Reset claim test. Then define replacement
versus merge semantics for QR/JSON imports and make the copy and tests match.
