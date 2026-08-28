# Demo sandbox

Open `/demo` or `/?demo=1`. The demo seeds four shared chores and four dated
receipts. It uses IndexedDB database `chore-receipt-demo-v1`, separate from
real data in `chore-receipt-real-v1`.

The banner says **Demo — sample data, nothing is saved**. **Reset demo** clears
only the demo database and restores the sample. **Start for real** leaves the
demo namespace and opens a blank real household board. The service worker
caches the app shell, so the demo can be opened offline after its first visit.
