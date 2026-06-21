# Dashboard Empty Vault Note

Dashboard empty states should distinguish a new account from filters, network mismatch, or failed vault reads.

## Checks
- Test an account with no vaults and an account filtered down to no results.
- Confirm network mismatch copy appears before suggesting vault creation.
- Record failed read details when the empty state may hide an API error.
