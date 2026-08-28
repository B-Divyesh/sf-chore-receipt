# Chore Receipt

Record shared chores when they get done.

Chore Receipt is for roommates and families who share recurring work. It keeps
a neutral, time-stamped receipt and calculates the next due date from the last
completion. There are no accounts, scores, names on receipts, or background
sync.

Try the isolated sample at `/demo`. It uses separate browser storage and never
touches your real chores.

## What it does

- Keeps an unassigned shared chore board.
- Marks a chore done in one tap and records the completion time.
- Repeats tasks after 1, 3, 7, 14, or 30 days.
- Exports a full JSON backup or the receipt history as CSV.
- Makes an opt-in QR household copy that merges newer records on another device.
- Works offline after the first visit.

## Privacy

Chores, receipts, and the household name stay in IndexedDB on the device.
Nothing is sent to us. Sharing a QR copy or downloading an export happens only
when a person chooses it. Read the in-app `/privacy` and `/terms` pages for
the full details.

## Develop and verify

Requires Node 20 or newer.

```sh
npm install
npm run dev
npm test
npm run build
```

`npm run build` creates the static deploy output in `dist/`, with `index.html`
at its root. `npm test` runs the Playwright sandbox checks, including offline
reload, CSV export, and local-only network behavior.

## Deploy

Deploy the contents of `dist/` to a static host with SPA fallbacks enabled.
`staticwebapp.config.json` is included for Azure Static Web Apps.

## License

MIT. See [LICENSE](LICENSE).
