# RPC Network Parity

## Summary
RPC endpoint fallbacks should stay on the same network as the selected contract map.

## Checks
- Force primary RPC failure.
- Confirm the fallback endpoint uses the expected network.
- Log endpoint names without secret tokens.
