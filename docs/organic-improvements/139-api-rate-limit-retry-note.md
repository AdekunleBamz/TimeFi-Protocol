# API Rate Limit Retry Note

API rate-limit handling should tell users whether a vault action is delayed, retrying, or safe to try again.

## Checks
- Trigger a non-production rate-limit response where possible.
- Confirm retry copy does not imply a transaction was submitted.
- Record the endpoint and retry-after value when available.
