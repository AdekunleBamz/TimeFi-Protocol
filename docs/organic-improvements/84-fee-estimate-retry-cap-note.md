# Fee Estimate Retry Cap

## Summary
Fee estimate reads should cap retries and offer manual refresh after repeated failures.

## Checks
- Simulate repeated estimate failures.
- Confirm forms remain editable.
- Keep stale fee labels visible until refresh succeeds.
