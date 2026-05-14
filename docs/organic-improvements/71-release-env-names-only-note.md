# Release Env Names Only

## Summary
Release handoffs should list environment variable names without exposing values.

## Checks
- Compare local, preview, and production variable names.
- Redact values from screenshots and logs.
- Confirm optional variables have safe fallbacks.
