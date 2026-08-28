# Adversarial first-read review 6 — Chore Receipt

**Verdict: FAIL.** The cold first read, isolated demo, product behavior,
structure, privacy, offline operation, prior repairs, and visual identity
verify. One blocking finding remains: a declared claim command failed in the
clean clone, and the same shared-copy path duplicates a status announcement on
the live site. A PASS requires zero findings and no failed claim test.

- Reviewed: 2026-08-28 UTC
- Live site: <https://chore-receipt.sociobot.in>
- Repository reviewed: `32ced3f05a3ffba551902fce6ce86624e994e5c8`
- Clean clone: `/tmp/chore-receipt-review6-clean.SnAhGZ/repo`
- Contexts: fresh Chromium at 390×844 and 1440×900

## Finding

### Blocking

#### F-6-1 — The shared-copy claim test fails and the live update is announced twice

- **Exact quote/location:** The message “Household copy updated. Chore changes
  and receipt history were imported.” is rendered once by the board notice in
  `src/main.ts` and again by the `hashchange` announcer. The declared test at
  `tests/app.spec.ts:298` uses an unscoped `getByText` for that sentence.
- **Evidence:** The exact clean-clone command `npm test -- --grep
  @claim:copies-no-sync` failed. Playwright found two matches: the visible
  `<p class="notice" role="status">` and the hidden
  `<div class="announcer" role="status" aria-live="polite">`. A separate live
  sender/recipient re-import confirmed both status regions contain the exact
  sentence. The later 33-test local and live runs passed, which demonstrates
  timing-dependent test behavior; it does not erase the required claim-command
  failure.
- **Why this fails:** Any failing declared claim test is blocking. A screen
  reader can also announce the same import result twice, while the regression
  can pass or fail depending on when Playwright observes the second live
  region.
- **Concrete fix:** Give the update one announcement owner. For example, keep
  the visible notice but remove its `role="status"`, then use the dedicated
  announcer once. Scope the visible-copy assertion to `.notice` and separately
  assert one live announcement. Re-run the exact claim command repeatedly and
  the full clean/live suites.

## Cold first screen, before scrolling

| Viewport | What it does, in my words | For whom | First action |
| --- | --- | --- | --- |
| 390×844 | Records completed household chores and shows when each is due again. | Roommates and families sharing recurring work. | **Try it with sample data**. |
| 1440×900 | The same shared chore record with completion receipts and next dates. | Roommates and families sharing recurring work. | **Try it with sample data**. |

All three answers are explicit before scrolling. The exact lines are “Record
chores when they get done,” “For roommates and families who share the work and
need to know what is due next,” and “Try it with sample data,” followed by “See
a working shared chore board.” The first screen is not blocking.

## Copy audit

Counts treat paths, hyphenated terms, arrows, and quoted labels as one word.
The landing inventory includes headings, actions, labels, image description,
header/footer text, and repeated copy. No item exceeds 22 words. No banned
marketing adjective, jargon, inconsistent term, meaningless heading, metaphor,
or non-result-naming action was found.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Chore Receipt | 2 | Pass |
| Main navigation | 2 | Pass |
| Receipt log | 2 | Pass |
| Household | 1 | Pass |
| Privacy | 1 | Pass |
| A household record, not a scorecard | 6 | Pass — `no-scoring` |
| Record chores when they get done | 6 | Pass |
| For roommates and families who share the work and need to know what is due next. | 16 | Pass |
| Try it with sample data | 5 | Pass — demo action |
| See a working shared chore board. | 6 | Pass |
| Works offline after setup | 4 | Pass — `offline-reload` |
| Stored on this device | 4 | Pass — `stored-device` |
| Free to use | 3 | Pass — `free` |
| Add your first chore → | 5 | Pass |
| A paper-cut kitchen with a sink, cleaning cloth, plant, and blank receipt. | 12 | Pass |
| Sample board preview | 3 | Pass |
| Sample chore board | 3 | Pass |
| This is Maple Street home. | 5 | Pass |
| It is a sample, not your data. | 7 | Pass — `demo-isolation` |
| Open the editable sample board → | 6 | Pass — `demo-isolation` |
| Maple Street home | 3 | Pass |
| Current chores | 2 | Pass |
| 2 due now | 3 | Pass |
| Clean the bathroom | 3 | Pass |
| 1 day overdue · repeats every 7 days | 8 | Pass |
| Sample chore marked done | 4 | Pass |
| Water the plants | 3 | Pass |
| Due in 3 days · repeats every 5 days | 9 | Pass |
| Sample chore marked done | 4 | Pass |
| Water the plants | 3 | Pass |
| Done Aug 26 · next Aug 31 | 7 | Pass |
| How it works | 3 | Pass |
| How chore receipts set the next due date | 8 | Pass |
| Keep a shared list. | 4 | Pass |
| Add chores the household repeats. | 5 | Pass |
| Tap “Mark done.” | 3 | Pass |
| The time becomes a receipt. | 5 | Pass |
| Check what is due. | 4 | Pass |
| Each chore repeats from completion. | 5 | Pass — `receipt-next-date` |
| Keep your household record private | 5 | Pass |
| Export or share a household copy only when you choose. | 10 | Pass |
| Household copies do not stay in sync. | 7 | Pass — `copies-no-sync` |
| Scan or import again to update another device. | 8 | Pass — `copies-no-sync` |
| Read the privacy details | 4 | Pass |
| A local record for recurring chores. | 6 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory (external) | 5 | Pass |
| v1.3.0 | 1 | Pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Chore Receipt | 2 | Pass |
| Record shared chores when they get done. | 7 | Pass |
| Chore Receipt is for roommates and families who share recurring work. | 11 | Pass |
| Try the sample at `/demo`; it opens a separate board with four household chores. | 14 | Pass — `demo-isolation` |
| Demo changes are deleted when you select **Start for real**. | 10 | Pass — `demo-discard` |
| What it does | 3 | Pass |
| Records a completion as a time-stamped receipt and calculates the next date. | 12 | Pass — `receipt-next-date` |
| Exports receipts as CSV and exports or imports a JSON backup from Household. | 13 | Pass — export claims |
| Shares an opt-in household copy with a QR code. | 9 | Pass — `qr-share` |
| The copy stays after the # in the link, which browsers do not send to this site. | 17 | Pass — `local-only` |
| Works offline after setup. | 4 | Pass — `offline-reload` |
| It is free to use. | 5 | Pass — `free` |
| Privacy | 1 | Pass |
| Chores, receipts, and the household name are stored in this browser. | 11 | Pass — `stored-device` |
| The demo keeps its sample separate from your household data. | 10 | Pass — demo claims |
| See `/privacy` and `/terms` in the app. | 7 | Pass |
| Develop and verify | 3 | Pass |
| Requires Node 20 or newer. | 5 | Pass |
| `npm ci` | 2 | Pass |
| `npm test` | 2 | Pass |
| `npm run build` | 3 | Pass |
| `npm run build` creates the static deploy output in `dist/`, with `index.html` at its root. | 15 | Pass |
| Product claims and their Playwright checks are listed in `.factory/claims.json`. | 10 | Pass |
| Deploy | 1 | Pass |
| Deploy `dist/` to the configured static host. | 7 | Pass |
| `staticwebapp.config.json` provides the application routes, true 404 override, and security headers. | 11 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

The developer-only Node, build, deployment, and license statements were
checked against the clean clone and committed files. All visitor-facing
landing and README claims map to `.factory/claims.json`; no unlisted claim was
found.

## Demo and sandbox

- One click from the cold landing opened `/demo` and immediately showed Maple
  Street home, four realistic chores, four dated receipts, due states, and
  completion controls.
- The persistent banner says “Demo — sample data, nothing is saved” and has
  **Reset demo** and **Start for real**.
- Completing Water the plants, then resetting, restored four chores and four
  receipts, removed the stale result and Undo action, announced the reset, and
  returned focus to **Reset demo**.
- A real “Private kitchen reset” chore was unchanged after demo completion and
  reset. **Start for real** deleted `chore-receipt-demo-v1` and retained the
  exact `chore-receipt-real-v1` record.
- The landing-to-demo request log contained only same-origin GET requests with
  no bodies. The privacy claim test checks the full QR sender/recipient flow.
- Offline navigation after a true 404 passed in the declared claim test and
  the full local/live suites.

The demo itself is realistic, one-click, isolated, resettable, and usable.
F-6-1 concerns the later household-copy announcement and its claim gate.

## Claims

Every exact command in `.factory/claims.json` was run separately from the
clean clone.

| Claim id | Exact-command result |
| --- | --- |
| `demo-isolation` | PASS |
| `demo-reset` | PASS |
| `demo-discard` | PASS |
| `no-scoring` | PASS |
| `stored-device` | PASS |
| `offline-reload` | PASS |
| `csv-export` | PASS |
| `json-backup` | PASS |
| `local-only` | PASS |
| `qr-share` | PASS |
| `copies-no-sync` | **FAIL — F-6-1** |
| `receipt-next-date` | PASS |
| `free` | PASS |

After the individual failure, the clean full suite passed 33/33 and the live
full suite passed 33/33. This disagreement is evidence that F-6-1 is
nondeterministic. `npm run build` passed and produced `dist/index.html`; the
initial app bundle is 55.67 kB raw / 19.12 kB gzip.

## Earlier finding verification

Every earlier review, polish record, and handoff was read. Each item below was
checked against the current live site and its implementing source/test. The
underlying shared-copy edit/removal behavior in F-4-2 works; F-6-1 is a new
duplicate-announcement and claim-gate defect on that path.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Fixed: a true 404 does not replace the cached shell; offline demo/log tests pass. |
| F-1-2 | Fixed: Household is visible and touch-sized at 390 px. |
| F-1-3 | Fixed: corrupt-state recovery offers valid import and confirmed local clearing. |
| F-1-4 | Fixed: link, Back, and Forward navigation focus and announce the route h1. |
| F-1-5 | Fixed: chores can be edited and removed while receipts remain. |
| F-1-6 | Fixed: exact real household data survives reload in the real namespace. |
| F-1-7 | Fixed: JSON restores household, chores, receipts, and removal history. |
| F-1-8 | Fixed: QR privacy checks inspect origin, method, URL, and body. |
| F-1-9 | Fixed: Landing, Household, and Privacy disclose that copies do not sync. |
| F-1-10 | Fixed: all six application routes have distinct complete metadata. |
| F-1-11 | Fixed: the HTTP 404 keeps the skeleton, legal links, icons, and metadata. |
| F-1-12 | Fixed: blank household names explain the error and refocus the input. |
| F-1-13 | Fixed: landing instructions consistently use “chore.” |
| F-1-14 | Fixed: README explains the `#` behavior without browser jargon. |
| F-1-15 | Fixed: the broad coverage assertion is absent; scoped claims are registered. |
| F-1-16 | Fixed: the untestable public originality claim remains absent. |
| F-1-17 | Fixed: the footer visibly and accessibly identifies its external link. |
| F-1-18 | Fixed: the committed 50-unit copy inventory matches rendered landing copy. |
| F-2-1 | Fixed: the labelled sample board precedes the explanation. |
| F-2-2 | Fixed: **Export JSON backup** is explicit and sits beside import. |
| F-3-1 | Fixed: the hero slogan is absent. |
| F-3-2 | Fixed: the preview heading is **Sample chore board**. |
| F-3-3 | Fixed: preview and board queues use **Current chores**. |
| F-3-4 | Fixed: the explanation heading names how receipts set the next due date. |
| F-4-1 | Fixed: Reset restores the exact seed, clears stale state, announces, and refocuses. |
| F-4-2 | Fixed functionally: re-import applies edits/removals and preserves destination-only chores. |
| F-4-3 | Fixed: the no-score promise is declared and outcome-tested. |
| F-4-4 | Fixed: the editable-demo promise is declared and outcome-tested. |
| F-4-5 | Fixed: the 404 uses direct page-not-found language. |
| F-4-6 | Fixed: board instructions name the chore and repeat interval. |
| F-4-7 | Fixed: actions read **View all receipts** and **Undo receipt**. |
| F-4-8 | Fixed: README describes demo separation in plain language. |
| F-5-1 | Fixed: live normal and 404 responses send `frame-ancestors 'self'`. |

## Structure, accessibility, and identity

- `/`, `/demo`, `/log`, `/settings`, `/privacy`, and `/terms` returned 200. A
  random missing path returned the designed HTTP 404. Every actual internal
  link and the cued external Param Factory link resolved.
- Each route has one h1, one main, `lang="en"`, a route-specific title,
  description, canonical, Open Graph/Twitter metadata, favicon, and consistent
  header/footer. `robots.txt`, `sitemap.xml`, Privacy, and Terms are present.
- The factory URL verifier found no console errors, missing alt text, or
  unlabeled buttons. The live 33-test suite includes seven-route Axe checks,
  keyboard focus, 200% text, and touch-target coverage.
- The warm paper, clipped receipts, domestic paper-cut art, serif/sans pairing,
  and moss/clay palette implement `.factory/design.md` and are distinct from a
  generic SaaS template.

F-6-1 is the one accessibility/claim-gate exception.

## Missed leverage

No additional feature is implied. CSV export, JSON backup/import, and an
explicit no-sync QR household copy cover ownership and transfer. AI would add
cost and data disclosure to a deterministic local record without improving its
core job. No analytics, remote fonts, third-party runtime scripts, payment
path, provider key, or decorative AI feature was found.

## What would make this perfect

Remove the duplicate shared-copy status announcement and make its declared
claim test deterministic while checking both visible feedback and one live
announcement. Then rerun all 13 exact claim commands, the clean and live full
suites, and the same-tab QR re-import with a screen-reader-oriented status
count. With that one finding closed, there would be nothing left to do.
