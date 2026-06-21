# Early withdrawal error note

Capture early-withdrawal errors during testing so support can separate expected lock enforcement from unexpected contract failures.

## Checklist

- Attempt withdrawal before the unlock height in a test wallet.
- Record the visible message and contract error code together.
