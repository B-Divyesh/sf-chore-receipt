# Chore Receipt

Record shared chores when they get done.

Chore Receipt is for roommates and families who share recurring work. Try the
sample at `/demo`; it opens a separate board with four household chores. Demo
changes are deleted when you select **Start for real**.

## What it does

- Records a completion as a time-stamped receipt and calculates the next date.
- Exports receipts as CSV and exports or imports a JSON backup from Household.
- Shares an opt-in household copy with a QR code. The copy stays after the #
  in the link, which browsers do not send to this site.
- Works offline after setup. It is free to use.

## Privacy

Chores, receipts, and the household name are stored in this browser. The demo
uses its own browser database. See `/privacy` and `/terms` in the app.

## Develop and verify

Requires Node 20 or newer.

```sh
npm ci
npm test
npm run build
```

`npm run build` creates the static deploy output in `dist/`, with `index.html`
at its root. Each public claim has a Playwright test that checks the promised
result.

## Deploy

Deploy `dist/` to the configured static host. `staticwebapp.config.json`
provides the application routes, true 404 override, and security headers.

## License

MIT. See [LICENSE](LICENSE).
