# timefi-sdk

The official JavaScript SDK for interacting with the **TimeFi Protocol** on the Stacks blockchain.

[![npm version](https://img.shields.io/npm/v/timefi-sdk.svg)](https://www.npmjs.com/package/timefi-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Protocol Client**: Easy-to-use `TimeFiClient` for read and write interactions.
- **On-chain Data**: Fetch TVL, vault status, and lock durations directly from smart contracts.
- **Formatting Utilities**: Standardized formatting for STX (microSTX to STX), addresses, and dates.
- **Mainnet/Testnet Support**: Unified interface for both networks.

## 📦 Installation

```bash
npm install timefi-sdk
```

### Local SDK Development

```bash
cd sdk
npm ci
npm run build
npm test
```

### Running Tests

```bash
npm test
```
From the repository root, run `npm --prefix sdk test` to run the same SDK test command.

From the repository root, use `npm run sdk:build` for SDK build validation before publishing.

## 🛠️ Quick Start

### Initialize Client

```javascript
import { TimeFiClient } from 'timefi-sdk';

// For Mainnet
const mainnetClient = new TimeFiClient('mainnet');

// For Testnet
const testnetClient = new TimeFiClient('testnet');
```

### Fetch Protocol Stats

```javascript
import { TimeFiClient, formatSTX } from 'timefi-sdk';

// Initialize for Stacks Mainnet
const client = new TimeFiClient('mainnet');

// Get Total Value Locked
const tvl = await client.getTVL();
console.log(`Current TVL: ${formatSTX(tvl)} STX`);

// Get Vault Count
const vaultCount = await client.getVaultCount();
console.log(`Total Vaults: ${vaultCount}`);
```

### Query Vault Details

```javascript
import { TimeFiClient, formatSTX } from 'timefi-sdk';

const client = new TimeFiClient('mainnet');

// Get specific vault details
const vault = await client.getVault(1);
console.log(`Vault Owner: ${vault.owner}`);
console.log(`Vault Amount: ${formatSTX(vault.amount)} STX`);

// Check if vault can be withdrawn
const canWithdraw = await client.canWithdraw(1);
console.log(`Can Withdraw: ${canWithdraw}`);

// Get time remaining until unlock
const timeRemaining = await client.getTimeRemaining(1);
console.log(`Time Remaining: ${timeRemaining} seconds`);
```

### Format Utilities

```javascript
import { formatSTX, formatAddress, formatNumber, formatPercent } from 'timefi-sdk';

// Format STX amounts
const stxAmount = formatSTX(1500000); // '1.5'
console.log(`${stxAmount} STX`);

// Truncate addresses
const shortAddress = formatAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N');
console.log(shortAddress); // 'SP3F...GG6N'

// Format numbers
const formatted = formatNumber(1234567.89); // '1,234,567.89'

// Format percentages
const percent = formatPercent(5.25); // '5.25%'
```

## 📖 Documentation

The SDK provides the following exports:

- `TimeFiClient`: Core class for blockchain interactions.
- `formatSTX(microStx)`: Converts microSTX to a human-readable STX string.
- `formatAddress(address)`: Truncates addresses for UI display.
- `CONTRACT_ADDRESS`: The main TimeFi Protocol contract address on Stacks.

## 📄 License

MIT © [AdekunleBamz](https://github.com/AdekunleBamz)
