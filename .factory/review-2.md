# Adversarial first-read review 2 — Chore Receipt

**Verdict: FAIL.** The core job, cold first read, demo, isolation, offline
behaviour, claims, routing, and prior repairs verify. Two remaining findings
prevent a zero-finding release.

- Reviewed: 2026-08-28 UTC
- Live site: <https://chore-receipt.sociobot.in>
- Repository commit: `20024173c0d4ba69cf0891c3611440f51743bd0c`
- Contexts: fresh Chromium at 390×844 and 1440×900; clean local clone at
  `/tmp/chore-receipt-review2-clean`

## Findings

### Medium

#### F-2-1 — The landing page skips the required product preview

- **Exact location:** the landing page goes from the hero directly to “How it
  works,” then “Keep your household record private.” Its only visual in the
  hero is the decorative paper scene with alt text “A paper-cut kitchen with a
  sink, cleaning cloth, plant, and blank receipt.”
- **Why this fails:** The required landing skeleton calls for “the product
  itself or a live preview of it” before the explanatory steps. In a 30-second
  visit, a person can read the promise and click into a separate page, but
  cannot inspect an actual chore, receipt, due state, or completion result on
  the landing page. The art establishes the identity; it does not show the
  product doing its job.
- **Concrete fix:** Place a non-persistent, visibly labelled sample board on
  the landing page after the hero. It should show Maple Street home, realistic
  chores, a due state, a receipt, and the resulting next date. Keep “Try it
  with sample data” as the one-click route into the editable isolated demo.

### Minor

#### F-2-2 — JSON backup export is labelled vaguely and is not offered beside import

- **Exact location:** the board action says “Export data”; the Household page
  says “Use Export JSON for a full backup.” but provides only an import chooser
  and no export control or link.
- **Why this fails:** “Export data” does not name the result a person gets,
  despite the product promising a JSON backup. On the page where a visitor
  names, shares, and imports household data, the sentence directs them to an
  action that is not present. A first-time visitor has to infer that the
  wordmark returns to the board and that “Export data” means JSON.
- **Concrete fix:** Rename the board control to **Export JSON backup** and add
  the same control beside “Import a backup” on Household (or make “Export JSON”
  a direct link to that control). Retain **Export CSV** as the separate receipt
  export.

## Cold first screen, before scrolling

| Viewport | What it does in plain words | For whom | First action |
| --- | --- | --- | --- |
| 390×844 | Records when household chores are done and shows when they are due again. | Roommates and families sharing recurring work. | “Try it with sample data.” |
| 1440×900 | The same shared chore and receipt board. | Roommates and families sharing recurring work. | “Try it with sample data.” |

Both first screens contain the necessary evidence without scrolling: “Record
chores when they get done,” “For roommates and families who share the work and
need to know what is due next,” and “Try it with sample data,” followed by
“See a working shared chore board.” This is clear and is not a blocking
finding.

## Copy audit

Counts treat paths, hyphenated terms, and quoted labels as one word. Headings
and action labels are included so the audit also checks context and button
language. No listed sentence exceeds 22 words. No banned marketing adjective,
inconsistent chore/task term, or unexplained landing heading was found. The
only action-label issue is F-2-2.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| A household record, not a scorecard | 6 | Pass |
| Record chores when they get done | 6 | Pass |
| For roommates and families who share the work and need to know what is due next. | 16 | Pass |
| Try it with sample data | 5 | Pass — required demo action |
| See a working shared chore board. | 6 | Pass |
| Works offline after setup | 4 | Pass — declared claim |
| Stored on this device | 4 | Pass — declared claim |
| Free to use | 3 | Pass — declared claim |
| Add your first chore | 4 | Pass |
| Keep the outcome. | 3 | Pass |
| Skip the blame. | 3 | Pass |
| How it works | 3 | Pass |
| One receipt, then a clear next date | 7 | Pass |
| Keep a shared list. | 4 | Pass |
| Add chores the household repeats. | 5 | Pass |
| Tap “Mark done.” | 3 | Pass |
| The time becomes a receipt. | 5 | Pass |
| Check what is due. | 4 | Pass |
| Each chore repeats from completion. | 5 | Pass — declared claim |
| Keep your household record private | 5 | Pass |
| Export or share a household copy only when you choose. | 10 | Pass — CSV, JSON, QR, and local-only claims |
| Household copies do not stay in sync. | 7 | Pass — declared claim |
| Scan or import again to update another device. | 8 | Pass — declared claim |
| Read the privacy details | 4 | Pass |
| A local record for recurring chores. | 6 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Chore Receipt | 2 | Pass — title |
| Record shared chores when they get done. | 7 | Pass |
| Chore Receipt is for roommates and families who share recurring work. | 11 | Pass |
| Try the sample at `/demo`; it opens a separate board with four household chores. | 14 | Pass — declared claim |
| Demo changes are deleted when you select Start for real. | 10 | Pass — declared claim |
| What it does | 3 | Pass — heading |
| Records a completion as a time-stamped receipt and calculates the next date. | 12 | Pass — declared claim |
| Exports receipts as CSV and exports or imports a JSON backup. | 11 | Pass — declared claims |
| Shares an opt-in household copy with a QR code. | 9 | Pass — declared claim |
| The copy stays after the # in the link, which browsers do not send to this site. | 17 | Pass — declared claim; plain explanation |
| Works offline after setup. | 4 | Pass — declared claim |
| It is free to use. | 5 | Pass — declared claim |
| Privacy | 1 | Pass — heading |
| Chores, receipts, and the household name are stored in this browser. | 11 | Pass — declared claim |
| The demo uses its own browser database. | 7 | Pass — declared claim |
| See `/privacy` and `/terms` in the app. | 7 | Pass |
| Develop and verify | 3 | Pass — heading |
| Requires Node 20 or newer. | 5 | Pass — developer prerequisite |
| `npm run build` creates the static deploy output in `dist/`, with `index.html` at its root. | 15 | Pass — developer instruction |
| Each public claim has a Playwright test that checks the promised result. | 12 | Pass — verified below |
| Deploy | 1 | Pass — heading |
| Deploy `dist/` to the configured static host. | 7 | Pass — developer instruction |
| `staticwebapp.config.json` provides the application routes, true 404 override, and security headers. | 11 | Pass — developer instruction |
| License | 1 | Pass — heading |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

## Demo and sandbox

The mandatory demo path verifies.

- One click on the cold landing action opened `/demo` and immediately showed
  Maple Street home, four realistic chores, dated receipts, and completion
  controls.
- The persistent banner reads “Demo — sample data, nothing is saved” and has
  both Reset demo and Start for real.
- Marking Water the plants done showed the receipt outcome; Reset demo restored
  the seeded sample. The declared isolation/discard test independently creates
  real data, changes demo data, starts for real, and asserts the real record
  survives while `chore-receipt-demo-v1` is removed.
- `/demo` and `/?demo=1` both enter the separate demo database. There is no
  demo-specific finding.

## Claims and privacy

I cloned the repository fresh, ran `npm ci`, and executed every exact command
in `.factory/claims.json` individually. All 11 exited zero. `npm test --
--workers=1` then passed 25/25 and `npm run build` passed, producing `dist/`.
The build’s initial JavaScript is 50.99 kB raw / 18.23 kB gzip.

| Claim id | Result |
| --- | --- |
| demo-isolation | PASS |
| demo-discard | PASS |
| stored-device | PASS |
| offline-reload | PASS |
| csv-export | PASS |
| json-backup | PASS |
| local-only | PASS |
| qr-share | PASS |
| copies-no-sync | PASS |
| receipt-next-date | PASS |
| free | PASS |

The live privacy request log covered the QR sender and recipient flow: it
created a QR, imported all four sample chores in a fresh context, made only
same-origin GET requests, and contained neither the encoded packet nor
household fields in any request URL or body. The live offline check loaded
`/demo`, waited for service-worker control, visited a true 404, confirmed the
cached shell remained HTTP 200, then went offline and opened `/log`; the result
was “Receipt log — Chore Receipt” with h1 “Every chore receipt.” The only
console message in that sequence was the expected failed-resource message for
the deliberate 404.

All landing and README product claims map to a listed claim above; no unlisted
claim was found. There are no product AI features, provider keys, accounts,
analytics, payment paths, remote fonts, or third-party runtime requests. AI is
not an implied missing feature for this local household record. CSV/JSON export
and an opt-in no-sync QR copy satisfy the valuable transfer functions implied
by the brief.

## History check

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the prior handoff,
then checked each prior finding against current live behaviour and source/tests.
None is repeated under its prior id.

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 | Fixed: true 404 retained an HTTP 200 cached shell; offline `/log` rendered. |
| F-1-2 | Fixed: Household is visible and operable at 390 px. |
| F-1-3 | Fixed: recovery has independent valid-backup import and confirmed clear paths. |
| F-1-4 | Fixed: click, Back, and Forward focus the new h1 and announce it. |
| F-1-5 | Fixed: chores have edit and confirmed removal; receipts remain. |
| F-1-6 | Fixed: real household data persists through reload in the real namespace. |
| F-1-7 | Fixed: import restores exact household, chores, and receipts to an empty real store. |
| F-1-8 | Fixed: QR request test checks method, origin, URL, and body; live log agrees. |
| F-1-9 | Fixed: landing, Household, and Privacy state that copies do not sync. |
| F-1-10 | Fixed: live `/`, `/demo`, `/log`, `/settings`, `/privacy`, and `/terms` have distinct route metadata. |
| F-1-11 | Fixed: live HTTP 404 has a skip link, header, footer, legal links, metadata, and icons. |
| F-1-12 | Fixed: blank household name announces the error and returns focus to the field. |
| F-1-13 | Fixed: current landing uses “chore” consistently. |
| F-1-14 | Fixed: README says “after the # in the link,” not browser jargon. |
| F-1-15 | Fixed: README uses plain test wording; all declared commands passed. |
| F-1-16 | Fixed: the untestable public originality sentence is absent. |
| F-1-17 | Fixed: footer has visible arrow and accessible “(external)” cue. |
| F-1-18 | Fixed: current audit is regression-tested against rendered landing text. |

## Structure, accessibility, and links

The route and accessibility checks pass apart from F-2-1’s missing landing
preview. The live routes `/`, `/demo`, `/log`, `/settings`, `/privacy`,
`/terms`, and `/not-a-page` supplied one h1, one main, header, footer,
route-appropriate title, description, and canonical. `/not-a-page` returned
HTTP 404 and retained the designed paper-slip treatment. Browser route changes
move focus and update the polite announcer. The first keyboard Tab reaches the
visible skip link; no 390 px control measured below 44×44 px. All discovered
internal links returned 200 (or the intended 404 route); the footer’s only
external link is explicitly cued.

The cut-paper receipt system is product-specific rather than a generic SaaS
surface: warm paper, clipped corners, domestic diorama, receipt stamps, and
the documented Georgia/system-sans pairing match `.factory/design.md`.

## What would make this perfect

Add the real sample-board preview to the landing page and make JSON backup
export explicit and available beside import. Then rerun the full fresh-clone
claim list, mobile first-read check, demo sandbox path, live privacy/offline
request logs, route crawl, and accessibility suite. With those two findings
closed and independently verified, this review can be PASS.
