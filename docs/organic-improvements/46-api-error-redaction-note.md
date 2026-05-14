# API Error Redaction

## Summary
Support notes should include API status and request timing without exposing secrets.

## Checks
- Redact API keys, wallet mnemonics, and private keys.
- Keep transaction ids and public addresses when useful.
- Note whether the error came from API, wallet, or contract simulation.
