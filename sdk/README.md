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

### Running Tests

```bash
npm test
```
## 🛠️ Quick Start

### Fetch Protocol Stats

```javascript
import { TimeFiClient, formatSTX } from 'timefi-sdk';

// Initialize for Stacks Mainnet
const client = new TimeFiClient('mainnet');

// Get Total Value Locked
const tvl = await client.getTVL();
console.log(`Current TVL: ${formatSTX(tvl)} STX`);
```

### Format a Stacks Address

```javascript
import { formatAddress } from 'timefi-sdk';

const shortAddress = formatAddress('SP3...XYZ123');
console.log(shortAddress); // SP3...Z123
```

## 📖 Documentation

The SDK provides the following exports:

- `TimeFiClient`: Core class for blockchain interactions.
- `formatSTX(microStx)`: Converts microSTX to a human-readable STX string.
- `formatAddress(address)`: Truncates addresses for UI display.
- `CONTRACT_ADDRESS`: The main TimeFi Protocol contract address on Stacks.

## 📄 License

MIT © [AdeekunleeBamz](https://github.com/AdeekunleeBamz)
