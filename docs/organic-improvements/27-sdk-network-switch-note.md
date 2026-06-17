# SDK network switch note

Keep SDK network switching in regression notes so examples do not accidentally reuse mainnet clients for testnet vault checks.

## Checklist

- Instantiate clients for mainnet and testnet in a local smoke script.
- Confirm each client reads from the expected API and contract address.
