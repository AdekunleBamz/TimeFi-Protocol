# Readonly Mode Disabled Action

## Summary
Readonly mode should disable write actions with a reason instead of hiding them unexpectedly.

## Checks
- Load vault details without a wallet connection.
- Confirm create and mutation actions explain requirements.
- Keep readonly data visible when writes are unavailable.
