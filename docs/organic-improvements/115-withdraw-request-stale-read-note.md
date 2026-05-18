# Withdraw Request Stale Read

## Summary
Withdrawal request views should explain when indexer data may lag behind a confirmed transaction.

## Checks
- Show pending refresh copy after broadcast.
- Include the tx ID in support notes when the chain state differs from the UI state.
- Avoid marking payouts failed until read-only calls confirm the state.
