# Test Wallet Funding

## Summary
Test wallet funding should happen before write-flow smoke tests.

## Checks
- Fund wallets before create, top-up, and withdraw smoke runs.
- Confirm balances are checked on the expected network.
- Avoid committing wallet secrets or seed material.
