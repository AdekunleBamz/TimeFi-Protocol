# Lock Extension Boundary

## Summary
Lock extension forms should reject zero, negative, and overflowing duration inputs before signing.

## Checks
- Test boundary duration values.
- Confirm the original unlock time is preserved after rejected inputs.
- Keep error messages near the duration field.
