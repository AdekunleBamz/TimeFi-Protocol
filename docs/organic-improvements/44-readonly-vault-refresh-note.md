# Readonly Vault Refresh

## Summary
Readonly vault views should recover cleanly after API latency or stale cache.

## Checks
- Test refresh after disconnecting the wallet.
- Confirm stale data labels disappear after a successful refresh.
- Capture the API endpoint used in the handoff note.
