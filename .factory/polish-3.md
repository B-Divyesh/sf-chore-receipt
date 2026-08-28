# Polish 3 — zero-finding release closure

Base candidate: `40424eacfd3da8b330ecdd9a7b10cc5301e67fc2`. Review:
`8f7a084002d131e7e15f1b685ad01f1cbae91446`. Repair code:
`f49bfed11fc355a4ef1f3e049cba12c8700f3edb`. Deployment:
`6a8ee596-c0be-4576-8ef7-6ace607817f1` to
<https://chore-receipt.sociobot.in>.

All review, prior-polish, and verification findings were re-read. Earlier
functional repairs remain in place and were retested; this round removes the
remaining copy defects, makes the audit complete and exact, and strengthens
the no-sync claim proof.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The service worker only replaces the shell with successful HTML. | `@claim:offline-reload`; cold live true-404 then offline `/log` in `evidence/polish-3-live/live-audit.json`. |
| F-1-2 | Household remains visible at phone width. | `mobile navigation visibly reaches Household and controls keep their target size`; live [demo mobile](evidence/polish-3-live/demo-query-mobile.png). |
| F-1-3 | Recovery imports a backup or confirms clearing corrupt local data. | `corrupt data can be restored by import or removed after confirmation`; live `/settings` route audit. |
| F-1-4 | Route changes, Back, and Forward focus and announce the new h1. | `route clicks, Back, and Forward focus and announce the new heading`; live route audit. |
| F-1-5 | Chores can be edited or removed without erasing receipts. | `chores can be edited and removed while their receipts remain`; live `/demo`. |
| F-1-6 | Real household name and chore state persist in the real IndexedDB namespace. | `@claim:stored-device` from clean clone. |
| F-1-7 | JSON backup restores household, chores, and receipts into an empty real store. | `@claim:json-backup` from clean clone; live `/settings`. |
| F-1-8 | QR privacy testing checks origin, method, URL, and body. | `@claim:local-only`; live sender/recipient GET-only check in `live-audit.json`. |
| F-1-9 | Landing, Household, and Privacy state that copies do not synchronize. | `@claim:copies-no-sync`; live `/` and `/settings` audit. |
| F-1-10 | Every product route has its own title, description, canonical, OG, and Twitter metadata. | `every real route ships and updates complete route-specific metadata`; all six live routes in `live-audit.json`. |
| F-1-11 | The true 404 keeps the paper-slip identity, standard skeleton, legal links, and metadata. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; live `/not-a-page` HTTP 404 audit. |
| F-1-12 | Blank household names announce an error and return focus to the field. | `blank household names explain the error and return focus to the input`; live `/settings`. |
| F-1-13 | Landing uses *chore* consistently. | Exact landing copy-audit regression; live [landing](evidence/polish-3-live/landing-mobile.png). |
| F-1-14 | README explains QR privacy in plain words. | README check plus `@claim:local-only`; live QR privacy audit. |
| F-1-15 | README makes a plain, accurate statement about claim tests; every declared outcome test ran. | All 11 exact `claims.json` commands passed in the clean clone. |
| F-1-16 | The untestable public generated-art originality claim remains absent. | Exact landing copy-audit regression; live landing audit. |
| F-1-17 | Footer shows and announces the external Param Factory destination. | Live route Axe audit (zero serious/critical); [landing mobile](evidence/polish-3-live/landing-mobile.png). |
| F-1-18 | Rebuilt the audit from all cold landing visible units, including skip link, header, action labels, privacy link, and footer; each sentence has its own row. The test now compares the audit’s complete set and counts exactly to rendered copy. | `the committed copy audit matches every current landing copy unit and sentence`; `copy-audit.md`; live landing screenshot. |
| F-2-1 | Landing retains the labelled Maple Street product preview before How it works. | `the landing page shows a labelled sample board before explaining how it works`; [live landing](evidence/polish-3-live/landing-desktop.png). |
| F-2-2 | JSON controls explicitly say **Export JSON backup** and sit beside import on Household. | `@claim:json-backup`; live `/settings` route audit. |
| F-3-1 | Removed the hero slogan caption. | `landing headings name the product sections without slogans`; live [landing mobile](evidence/polish-3-live/landing-mobile.png). |
| F-3-2 | Renamed the preview heading to **Sample chore board**. | `landing headings name the product sections without slogans`; live landing screenshots. |
| F-3-3 | Renamed both preview and board queue headings to **Current chores**. | Targeted heading test; live [direct `?demo=1`](evidence/polish-3-live/demo-query-mobile.png). |
| F-3-4 | Renamed the explanatory heading to **How chore receipts set the next due date**. | Targeted heading test; live landing screenshots. |
| Controller keyboard finding | Skip link is outside the async app mount and remains the first visible Tab target; dialogs return focus and name blank-field errors. | `the add dialog closes, explains blank names, and keyboard starts at the skip link`; live landing audit. |
| Verification HIGH-1 | Leaving demo deletes its separate database; re-entering restores only the shipped sample. | `@claim:demo-discard`; live `?demo=1` completion/reset check. |
| Verification MEDIUM-1 | Hashed assets are immutable while `sw.js` revalidates. | `hashed assets are immutable and the service worker always revalidates`; live `/assets/index-DGB9tstE.js` returned `max-age=31536000, immutable`. |

## Final release evidence

- Clean clone at `/tmp/chore-receipt-polish3-clean.8qGOu0/repo`, commit
  `f49bfed`: `npm ci` succeeded with 0 vulnerabilities; every one of the 11
  commands declared in `.factory/claims.json` passed; `npm test -- --workers=1`
  passed 27/27; `npm run build` produced `dist/`.
- Local verifier: `evidence/polish-3-local/verify.json` has title, `lang`, one
  h1, main landmark, image alt text, labelled buttons, and no errors. Local
  Lighthouse: 99 performance / 100 accessibility / 100 best practices / 100
  SEO.
- Live verifier: `evidence/polish-3-live/verify.json` has no console errors;
  `live-audit.json` records route metadata, zero serious/critical Axe results,
  direct demo, QR privacy, offline, and true-404 checks. Live Lighthouse is
  100/100/100/100 with FCP 908 ms, LCP 1,508 ms, TBT 17 ms, and CLS 0.014.

No finding remains unresolved.
