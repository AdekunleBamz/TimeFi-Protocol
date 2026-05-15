# Vault ID Support

## Summary
Support handoffs for vault issues should include the vault ID and network.

## Checks
- Include tx ID when a write transaction was attempted.
- Include owner address only when it is needed for lookup.
- Do not request private keys or seed phrases.
