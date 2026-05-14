# Dashboard TVL Null State

## Summary
TVL cards should handle unavailable values without rendering misleading zeros.

## Checks
- Simulate failed TVL reads.
- Confirm true zero and unavailable values look different.
- Keep retry actions near the affected card.
