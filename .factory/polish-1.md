# Polish 1 — perfection-loop closure

Base candidate: `71dfaf178d662c278e85ea11393504e227acdef4`. Review:
`eacc39907cb635a884ed3c0259c3bab6eafb1bd6`. Repair commits:
`d1451c056ac207188d0c20909d6ec762e62a7ed6` and
`c2349126c4bc8ab4809da07cf9c15e396d364efd`. Live check:
<https://chore-receipt.sociobot.in/demo>.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Cache the shell only from successful HTML; a 404 cannot replace it. | `@claim:offline-reload`; cold live 404 then offline `/log` passed. |
| F-1-2 | Keep Household visible and usable at 390 px. | `mobile navigation visibly reaches Household and controls keep their target size`; `evidence/polish-1-retry-live/mobile-household.png`. |
| F-1-3 | Recovery independently imports a valid backup or confirms clearing local data. | `corrupt data can be restored by import or removed after confirmation`. |
| F-1-4 | Focus and politely announce the new h1 after click, Back, and Forward. | `route clicks, Back, and Forward focus and announce the new heading`. |
| F-1-5 | Add edit and confirmed remove controls while retaining historical receipts. | `chores can be edited and removed while their receipts remain`. |
| F-1-6 | Persist real household data and assert exact values after reload. | `@claim:stored-device`. |
| F-1-7 | Restore household, chores, and receipts into an empty real store. | `@claim:json-backup`. |
| F-1-8 | Inspect every QR-flow request method, URL, and body for packet or household data. | `@claim:local-only`. |
| F-1-9 | State that household copies do not synchronize and require another import. | `@claim:copies-no-sync`; live Household check. |
| F-1-10 | Ship and update complete distinct metadata for every real route. | `every real route ships and updates complete route-specific metadata`; cold live route check. |
| F-1-11 | Keep skip link, navigation, legal links, icons, and metadata on the styled 404. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; live 404 check. |
| F-1-12 | Bind the blank-household error and return focus to its field. | `blank household names explain the error and return focus to the input`. |
| F-1-13 | Use “chore” consistently in landing wording. | `the committed copy audit matches every current landing sentence`. |
| F-1-14 | Explain QR privacy in README without browser jargon. | README review; `@claim:local-only`. |
| F-1-15 | Describe claim tests plainly and cover their promised outcomes. | Fresh-clone 11/11 declared claim commands passed. |
| F-1-16 | Remove the untestable public originality promise. | Landing copy audit and cold live landing check. |
| F-1-17 | Provide visual and accessible external-link cues in the footer. | Live `verify-url.sh`; seven-route Axe audit. |
| F-1-18 | Rebuild and regression-test the copy audit against rendered landing text. | `the committed copy audit matches every current landing sentence`. |
| Controller keyboard finding | Render Skip to content outside the asynchronous IndexedDB mount; test that first Tab focuses it while visible. | `the add dialog closes, explains blank names, and keyboard starts at the skip link`; `evidence/polish-1-retry-live/first-tab-skip.png`. |

`@claim:demo-isolation` now also opens `?demo=1` and checks its banner and
sample board; live reset evidence is `evidence/polish-1-retry-live/demo-reset.png`.
All findings are closed: every claim command, the 25-test single-worker suite,
build, local/live URL checks, live 404-offline test, mobile check, and live
seven-route Axe audit passed.
