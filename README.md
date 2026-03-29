# 🕰️ TimeFi Protocol

A time-locked vault protocol built on the Stacks blockchain using Clarity 4 features.

[![npm version](https://img.shields.io/npm/v/timefi-sdk.svg?style=flat-square)](https://www.npmjs.com/package/timefi-sdk)
[![npm downloads](https://img.shields.io/npm/dm/timefi-sdk.svg?style=flat-square)](https://www.npmjs.com/package/timefi-sdk)

## 🏗️ Project Structure

TimeFi-Protocol/
├── contracts/       # Clarity smart contracts
├── frontend/        # React-based web dashboard
├── sdk/             # JavaScript/TypeScript SDK
├── deployments/     # Clarinet deployment plans
├── settings/        # Network configuration
├── tests/regressions/ # Regression and edge-case suites
├── tests/           # Contract testing suite
└── docs/            # Additional documentation

## 🌟 Features

### 🔒 Smart Contract Features
- **Create Vaults** - Deposit STX with time-lock
- **Withdraw** - Claim funds after lock period
- **Bot Approval** - Approve automated trading bots via `contract-hash?`
- **Fee Collection** - 0.5% fee on deposits

### 📜 Clarity 4 Functions Used
- `get-stacks-block-info?` - For block-time based unlock calculation
- `contract-hash?` - For bot verification

## 🚀 Getting Started

### 📋 Prerequisites
- Clarinet installed
- Node.js 18+
- Access to a Stacks node API for the network you are targeting (mainnet by default)

### 🧪 Development

```bash
# Install dependencies
npm ci

# Check contracts
clarinet check

# Validate with project script
npm run check

# Run tests
npm run test

# Run tests with coverage + costs
npm run test:report

# Start devnet
clarinet devnet start

# Run frontend (Vite)
npm run frontend:dev

# Build SDK package
npm run sdk:build
```

### 💻 Frontend

```bash
cd frontend
npm ci
npm run dev
```

### 📦 SDK

```bash
cd sdk
npm ci
npm run build
```

### 🔗 SDK Integration

The `timefi-sdk` package provides a clean interface for interacting with the protocol:

```javascript
import { TimeFiClient } from 'timefi-sdk';

const client = new TimeFiClient('testnet');
const vault = await client.getVault(1);
const tvl = await client.getTVL();
```

## 🔧 Tech Stack

- **Smart Contracts**: Clarity 4 (Stacks Blockchain)
- **Frontend**: React + Vite + Vanilla CSS
- **SDK**: JavaScript / `@stacks/transactions`
- **Tooling**: Clarinet, Vitest

## 🧾 Contract Functions

### 🔓 Public Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `create-vault` | `(amount uint) (lock-secs uint)` | Create a new time-locked vault |
| `withdraw` | `(id uint)` | Withdraw from an unlocked vault |
| `approve-bot` | `(bot principal)` | Approve a trading bot contract |

### 🔍 Read-Only Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `get-vault` | `(id uint)` | Get vault details |
| `is-active` | `(id uint)` | Check if vault is active |
| `get-time-remaining` | `(id uint)` | Get seconds to unlock |
| `can-withdraw` | `(id uint)` | Check withdrawal readiness |
| `is-bot` | `(sender principal)` | Check if sender is approved bot |

## ⚙️ Configuration

### 🔢 Constants

```clarity
MIN_DEPOSIT: 10,000 microSTX (0.01 STX)
MIN_LOCK: 3,600 seconds (1 hour)
MAX_LOCK: 31,536,000 seconds (1 year)
FEE_BPS: 50 (0.5%)
```

## 🧱 Infrastructure
 
 - Mainnet testing and funding flows: `docs/MAINNET_TESTING.md`
 
 ### 🌐 Network Endpoints
 - **Mainnet**: `https://stacks-node-api.mainnet.stacks.co`
 - **Testnet**: `https://stacks-node-api.testnet.stacks.co`
 
 ## 🗳️ Governance
 
 TimeFi Protocol is governed by its community. Future proposals will be handled via the on-chain governance module.
 
 ## 👥 Community
 
 - **Discord**: [Join our Discord](https://discord.gg/timefi)
 - **Twitter**: [@TimeFiProtocol](https://twitter.com/TimeFiProtocol)
 
 ## 🪐 Ecosystem
 
 - **Stacks Explorer**: View protocol transactions on-chain.
 - **Console.xyz**: Community discussions and governance.
 
 ## 📖 Operations Docs

## 📄 License

MIT License
