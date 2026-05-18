# Vault processing API rate limit note

Custodian processing smoke tests should record whether Hiro requests used authenticated or public rate limits.

If public limits are used, lower the batch size or increase the delay before retrying a failed processing run.

This helps separate API throttling from contract-level withdrawal failures.
