# Demo sandbox

Open `/demo` or `/?demo=1`. The demo seeds four shared chores and four dated
receipts. It uses IndexedDB database `chore-receipt-demo-v1`, separate from
real data in `chore-receipt-real-v1`.

The banner says **Demo — sample data, nothing is saved**. **Reset demo** clears
only the demo database and restores the sample. **Start for real** deletes the
demo database before it opens the real household board. Re-entering the demo
starts again with the four original receipts. The service worker caches the app
shell, so the demo can be opened offline after its first visit.
