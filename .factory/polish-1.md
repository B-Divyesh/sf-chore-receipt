# Polish 1 — review finding closure

Repair code: `d1451c056ac207188d0c20909d6ec762e62a7ed6`. Production check:
<https://chore-receipt.sociobot.in/demo>. Desktop and 390 px captures are in
`.factory/evidence/polish-1-live/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The worker only replaces the shell with an OK HTML response; a real 404 leaves the good shell intact. | `@claim:offline-reload`; cold live offline check passed. |
| F-1-2 | Household remains a visible, wrapped mobile navigation link. | `mobile navigation visibly reaches Household`; live 390 px check. |
| F-1-3 | Corrupt-store recovery now has working backup import and confirmed clear-data actions independent of the bad record. | `corrupt data can be restored by import or removed after confirmation`. |
| F-1-4 | Route headings are focusable, focused after click/Back/Forward, and announced politely. | `route clicks, Back, and Forward focus and announce the new heading`. |
| F-1-5 | Every board chore has edit and confirmed remove controls; historical receipts remain. | `chores can be edited and removed while their receipts remain`. |
| F-1-6 | The storage claim now creates real data, saves a household name, reloads, and checks exact persisted values. | `@claim:stored-device`. |
| F-1-7 | JSON import restores exported household, chores, and receipts into an empty real store. | `@claim:json-backup`. |
| F-1-8 | QR sender/recipient traffic asserts GET-only requests and rejects packet and household data in both URL and body. | `@claim:local-only`. |
| F-1-9 | Landing, Household, and Privacy explain that copies do not sync and how to update them. | `@claim:copies-no-sync`; live `/demo` → Household check. |
| F-1-10 | Built static HTML exists per route with route-specific title, description, canonical, Open Graph, and Twitter metadata; SPA updates it too. | `every real route ships and updates complete route-specific metadata`; cold live metadata check. |
| F-1-11 | The paper-slip 404 now has skip link, header, footer/legal links, favicon, theme color, and social metadata. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; live `/missing-live-check` returned 404. |
| F-1-12 | Blank household names are explained in the bound live message and focus returns to the field. | `blank household names explain the error and return focus to the input`. |
| F-1-13 | Landing terminology consistently says “chore.” | `the committed copy audit matches every current landing sentence`. |
| F-1-14 | README now explains the QR copy in plain language: it stays after `#`. | README review; `@claim:local-only`. |
| F-1-15 | README now says plain-language claim tests check promised results; the strengthened claims cover storage, import, and request bodies. | Fresh-clone declared-claim run: 11/11 passed. |
| F-1-16 | Removed the public originality promise; provenance remains in the design record. | Landing copy audit and live cold landing check. |
| F-1-17 | The footer supplies both visual and accessible external-link cues. | Live `verify-url.sh` capture; `all product routes and the 404 have no serious or critical axe findings`. |
| F-1-18 | Rebuilt the copy audit with current text/counts and made it a regression test. | `the committed copy audit matches every current landing sentence`. |

Additional production evidence: `verify-url.sh` passed at `/demo` with no
console errors, one h1, main, language, title, and image/button checks. A
Playwright axe audit (CSP-bypass injection only) passed all landing, app,
legal, and 404 routes with no serious or critical findings.
