# TimeFi Mainnet Testing Guide

This guide documents how to run the mainnet stress and coverage scripts safely.

## Prerequisites

- Node.js 18+
- A funded mainnet wallet in `test/wallets.json` position `wallets[0]`
- `@stacks/transactions` and `@stacks/network` installed via `npm install`

## Scripts Covered

- `test/fund-wallets.js`: pre-funds test wallets from wallet 1.
- `test/full-test-333.js`: runs a 333 confirmed transaction flow across vault, rewards, governance, and emergency contracts.

Both scripts target Hiro mainnet API and the `*-v-A2` contract set by default.

## Default Mainnet Values

- `full-test-333.js` uses `GAS_FEE=1000` microSTX (`0.001 STX`) by default.
- `fund-wallets.js` currently uses `GAS_FEE=1000` microSTX and `AMOUNT_PER_WALLET=200000` microSTX (`0.2 STX`).

## Running Full Test

```bash
node test/full-test-333.js
```

### Wallet Funding

```bash
node test/fund-wallets.js
```

Wallet ordering assumptions:

- `wallets[0]` is treated as funding wallet
- `wallets.slice(1)` are recipients/test actors

You can override runtime values with environment variables:

```bash
MAX_TXS=50 GAS_FEE=1000 CREATE_AMOUNT=10000 node test/full-test-333.js
```

## Funding Formula

`fund-wallets.js` computes:

`walletsToFund * (AMOUNT_PER_WALLET + GAS_FEE)`

## Full-Test Phases

- Phase 1: per-wallet contract coverage (`vault`, `rewards`, `governance`, `emergency`)
- Phase 2: filler loop until `MAX_TXS` confirmed transactions

A transaction is counted as "confirmed" when it reaches terminal on-chain status (`success` or `abort_*`).

## Output Artifacts

- `test/full-test-results.json`: transaction timeline and aggregate summary
- `test/funding-results.json`: wallet funding transaction outcomes

## Safety Behavior

- `full-test-333.js` traps `SIGINT` and exits cleanly after finishing the active step.
- Progress is persisted repeatedly, so interrupted runs still preserve partial state.

## Current Caveat in Local Simnet Tests

The local `timefi-vault.clar` withdrawal path can return `u4` in tests due to chain-time lookup behavior.
This affects local assertions and does not automatically imply a mainnet regression.

## Practical Funding Targets

- Per-wallet operational floor in full test loop: `0.04 STX`
- Per-wallet one-time pre-fund target to avoid frequent top-ups: `0.09 STX`

## Troubleshooting

- `INSUFFICIENT BALANCE` in `fund-wallets.js` means wallet 1 cannot cover `walletsToFund * (amount + gas)`.
- Top-up transfer fees (`TRANSFER_FEE`) are separate from contract call fees (`GAS_FEE`) in `full-test-333.js`.
- Governance steps can still confirm on-chain with abort status if no active proposal exists.

## Preflight Sanity Checks

- Confirm wallet 1 nonce can be fetched before funding starts.
- Confirm each recipient address is unique in `test/wallets.json`.
