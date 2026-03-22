# TimeFi Mainnet Testing Guide

This guide documents how to run the mainnet stress and coverage scripts safely.

## Prerequisites

- Node.js 18+
- A funded mainnet wallet in `test/wallets.json` position `wallets[0]`
- `@stacks/transactions` and `@stacks/network` installed via `npm install`

## Scripts Covered

- `test/fund-wallets.js`: pre-funds test wallets from wallet 1.
- `test/full-test-333.js`: runs a 333 confirmed transaction flow across vault, rewards, governance, and emergency contracts.

## Default Mainnet Values

- `full-test-333.js` uses `GAS_FEE=1000` microSTX (`0.001 STX`) by default.
- `fund-wallets.js` currently uses `GAS_FEE=1000` microSTX and `AMOUNT_PER_WALLET=200000` microSTX (`0.2 STX`).

## Running Full Test

```bash
node test/full-test-333.js
```
