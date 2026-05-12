# SDK read-only timeout note

Keep SDK read-only timeout behavior in integration notes so dashboards can recover cleanly from slow Stacks API responses.

## Checklist

- Simulate a slow read-only response from the configured API.
- Confirm the SDK caller reports a recoverable timeout instead of hanging.
