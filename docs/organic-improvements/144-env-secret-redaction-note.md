# Env Secret Redaction Note

Environment review notes should name required variables without exposing secret values in release evidence.

## Checks
- Share variable names only, not API keys or private endpoints.
- Redact `.env` screenshots before attaching them to issues.
- Confirm preview builds use the intended network labels after env changes.
