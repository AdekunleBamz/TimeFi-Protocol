# API Error Redaction

## Summary
API error messages should remove secrets, keys, and private endpoint details before display or logging.

## Checks
- Trigger failed API calls in local testing.
- Confirm user-facing errors do not expose headers.
- Keep diagnostic ids available for support.
