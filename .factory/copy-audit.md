# Landing copy audit

This is the cold landing page rendered in a fresh browser context. Each row is
one copy unit or sentence, including the skip link, image description,
screen-reader labels, header, footer, and repeated visible text. Locations are
deliberately recorded so duplicate words are not collapsed.

The Playwright test `the committed copy audit matches every current landing
copy unit and sentence` reads the rendered `data-copy-audit` inventory. It
fails when a rendered text node has no inventory location, when the committed
rows differ, when a count is wrong, or when a sentence exceeds 22 words.

Counts treat punctuation, arrows, symbols, and hyphenated terms as part of one
space-separated word. `pass` means the wording is plain, uses the established
terms, and has no banned marketing word.

| Location | Copy | Words | Result |
| --- | --- | ---: | --- |
| skip-link | Skip to content | 3 | pass |
| header-wordmark | Chore Receipt | 2 | pass |
| header-navigation | Main navigation | 2 | pass |
| header-receipt-log | Receipt log | 2 | pass |
| header-household | Household | 1 | pass |
| header-privacy | Privacy | 1 | pass |
| hero-scope | A household record, not a scorecard | 6 | pass |
| hero-heading | Record chores when they get done | 6 | pass |
| hero-audience | For roommates and families who share the work and need to know what is due next. | 16 | pass |
| hero-demo-action | Try it with sample data | 5 | pass |
| hero-demo-note | See a working shared chore board. | 6 | pass |
| hero-offline-fact | Works offline after setup | 4 | pass |
| hero-storage-fact | Stored on this device | 4 | pass |
| hero-price-fact | Free to use | 3 | pass |
| hero-real-action | Add your first chore → | 5 | pass |
| hero-art-description | A paper-cut kitchen with a sink, cleaning cloth, plant, and blank receipt. | 12 | pass |
| preview-kicker | Sample board preview | 3 | pass |
| preview-heading | Sample chore board | 3 | pass |
| preview-description | This is Maple Street home. | 5 | pass |
| preview-description-2 | It is a sample, not your data. | 7 | pass |
| preview-demo-action | Open the editable sample board → | 6 | pass |
| preview-household | Maple Street home | 3 | pass |
| preview-current-heading | Current chores | 2 | pass |
| preview-due-count | 2 due now | 3 | pass |
| preview-bathroom-title | Clean the bathroom | 3 | pass |
| preview-bathroom-detail | 1 day overdue · repeats every 7 days | 8 | pass |
| preview-bathroom-done | Sample chore marked done | 4 | pass |
| preview-plants-title | Water the plants | 3 | pass |
| preview-plants-detail | Due in 3 days · repeats every 5 days | 9 | pass |
| preview-plants-done | Sample chore marked done | 4 | pass |
| preview-receipt-title | Water the plants | 3 | pass |
| preview-receipt-detail | Done Aug 26 · next Aug 31 | 7 | pass |
| how-kicker | How it works | 3 | pass |
| how-heading | How chore receipts set the next due date | 8 | pass |
| how-step-one-title | Keep a shared list. | 4 | pass |
| how-step-one-detail | Add chores the household repeats. | 5 | pass |
| how-step-two-title | Tap “Mark done.” | 3 | pass |
| how-step-two-detail | The time becomes a receipt. | 5 | pass |
| how-step-three-title | Check what is due. | 4 | pass |
| how-step-three-detail | Each chore repeats from completion. | 5 | pass |
| privacy-heading | Keep your household record private | 5 | pass |
| privacy-choice | Export or share a household copy only when you choose. | 10 | pass |
| privacy-sync | Household copies do not stay in sync. | 7 | pass |
| privacy-sync-2 | Scan or import again to update another device. | 8 | pass |
| privacy-link | Read the privacy details | 4 | pass |
| footer-description | A local record for recurring chores. | 6 | pass |
| footer-privacy | Privacy | 1 | pass |
| footer-terms | Terms | 1 | pass |
| footer-factory | Built by Param Factory (external) | 5 | pass |
| footer-version | v1.3.0 | 1 | pass |

## Terminology

| Concept | One word or phrase used |
| --- | --- |
| Recurring household work | chore |
| Completion record | receipt |
| Group using the board | household |
| Isolated trial | demo |
| Cross-device transfer | household copy |
