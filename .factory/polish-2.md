# Polish 2 — zero-finding closure

Base candidate: `20024173c0d4ba69cf0891c3611440f51743bd0c`. Review:
`8c1e0f137839b7b14e45d4751b550378c24c08a5`. Repair:
`63245a33b6700011b90bc91f5231d5dfd290594f`. Deployed:
<https://chore-receipt.sociobot.in>.

Every earlier finding was re-read and rechecked. The evidence suite is a clean
clone’s 11 declared claim commands, `npm test -- --workers=1` (26/26),
`npm run build`, the factory URL verifier, and a cold live Playwright/Axe
audit. Live screenshots are under `.factory/evidence/polish-2-live/`.
Mobile Lighthouse on the deployed landing page scored 100 performance and 100
accessibility (LCP 1,509.667 ms; CLS 0.006).

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Successful HTML alone can replace the cached shell. | `@claim:offline-reload`; live true-404 then offline `/log?demo=1` rendered “Every chore receipt.” |
| F-1-2 | Household remains visible at 390 px. | Mobile route test; `live-mobile-demo.png`. |
| F-1-3 | Recovery imports a valid backup or confirms clear-data independently of bad data. | `corrupt data can be restored by import or removed after confirmation`. |
| F-1-4 | SPA navigation, Back, and Forward focus and announce the h1. | `route clicks, Back, and Forward focus and announce the new heading`; live Household h1 focus check. |
| F-1-5 | Board supports edit and confirmed remove while retaining receipts. | `chores can be edited and removed while their receipts remain`. |
| F-1-6 | Real names and chores persist in the real IndexedDB namespace. | `@claim:stored-device`. |
| F-1-7 | JSON restores exact household, chores, and receipts into an empty real store. | `@claim:json-backup`. |
| F-1-8 | QR privacy test checks request method, origin, URL, and body. | `@claim:local-only`. |
| F-1-9 | Landing, Household, and Privacy disclose that copies do not sync. | `@claim:copies-no-sync`; live Household check. |
| F-1-10 | Each real route has static and SPA-updated title, description, canonical, OG, and Twitter data. | `every real route ships and updates complete route-specific metadata`; cold live route audit. |
| F-1-11 | The true 404 has the full skeleton, legal links, icons, and metadata. | Local 404 structure test; live `/no-such-receipt` HTTP 404/Axe check. |
| F-1-12 | Blank household names return focus and announce an error. | `blank household names explain the error and return focus to the input`. |
| F-1-13 | Landing consistently calls records chores. | `the committed copy audit matches every current landing sentence`. |
| F-1-14 | README explains QR privacy in plain language. | README review; `@claim:local-only`. |
| F-1-15 | README describes claim tests plainly and all declared tests are substantive. | Clean-clone claim list: 11/11 passed. |
| F-1-16 | The untestable public originality statement remains absent. | Copy audit and cold live landing review. |
| F-1-17 | Footer visibly and accessibly marks the external Param Factory link. | Route/Axe suite and live verifier. |
| F-1-18 | Copy audit is current and regression-tested. | `the committed copy audit matches every current landing sentence`. |
| F-2-1 | Added labelled Maple Street sample board before “How it works,” with chores, due state, receipt, next date, and a one-click editable demo link. | `the landing page shows a labelled sample board before explaining how it works`; `live-landing-preview.png`; <https://chore-receipt.sociobot.in/>. |
| F-2-2 | Renamed export to **Export JSON backup** and placed it beside import on Household. | `@claim:json-backup`; `live-household-backup.png`; <https://chore-receipt.sociobot.in/settings>. |

## Live spot checks

- `/` cold-loads the preview and first-screen demo action; see
  `live-landing-preview.png`.
- `/?demo=1` immediately opens the isolated four-chore sample with persistent
  banner, Reset demo, and Start for real; see `live-demo-banner.png`.
- `/demo` at 390 px visibly exposes Household; see `live-mobile-demo.png`.
- `/settings` exposes Export JSON backup and JSON import together; see
  `live-household-backup.png`.
- `/no-such-receipt` returns HTTP 404 with title “Missing receipt — Chore
  Receipt” and no serious/critical Axe issue.

No finding remains unresolved.
