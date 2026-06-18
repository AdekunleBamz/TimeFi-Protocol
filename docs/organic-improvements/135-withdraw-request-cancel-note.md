# Withdraw Request Cancel Note

Withdrawal request cancellation checks should prove users can stop before signing without leaving a pending request.

## Checks
- Cancel the confirmation before the wallet prompt opens.
- Reject the wallet prompt and confirm the request state remains unchanged.
- Record the vault ID when a canceled request still appears pending.
