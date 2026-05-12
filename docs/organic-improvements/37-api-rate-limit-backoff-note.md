# API rate-limit backoff note

Keep API rate-limit backoff behavior in integration notes so repeated vault reads do not overload the configured Stacks endpoint.

## Checklist

- Trigger a rate-limited response in staging or a mocked client.
- Confirm retries back off and expose a recoverable message.
