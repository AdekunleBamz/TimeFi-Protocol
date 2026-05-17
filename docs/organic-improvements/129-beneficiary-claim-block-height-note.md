# Beneficiary Claim Block Height Note

Beneficiary claim reviews should include the current block height and the vault maturity height before a claim is marked blocked.

## Checks
- Compare the displayed claim state with a direct vault read.
- Record both the current block height and maturity height.
- Retry after a fresh block when the UI and contract read disagree.
