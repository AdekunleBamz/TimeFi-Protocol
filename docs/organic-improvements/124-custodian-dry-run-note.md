# Custodian dry-run note

Before processing real withdrawals, run the custodian workflow in dry-run mode when available.

Capture the vault IDs, expected payout count, and skipped vault count before signing any transactions.

This reduces accidental processing of immature or already-settled vaults.
