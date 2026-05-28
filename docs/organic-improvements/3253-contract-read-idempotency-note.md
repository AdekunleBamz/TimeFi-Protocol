# Contract read idempotency

Readonly contract retries should be safe to repeat and should not trigger write
state transitions in the UI.
