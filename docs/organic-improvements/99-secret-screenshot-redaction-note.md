# Secret Screenshot Redaction

## Summary
Screenshots used for support or release handoff should redact keys, addresses, and private endpoint values.

## Checks
- Redact `.env` values and API keys.
- Keep tx ids only when needed for debugging.
- Store raw evidence outside public docs.
