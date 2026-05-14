# Vault Maturity Clock Source

## Summary
Keep maturity messaging tied to the same block-height source used by the contract read path.

## Checks
- Compare displayed maturity against the current API block height.
- Re-check after switching networks.
- Note stale API responses in the release handoff.
