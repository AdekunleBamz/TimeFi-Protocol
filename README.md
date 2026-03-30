# 🕰️ TimeFi Protocol

A time-locked vault protocol built on the Stacks blockchain using Clarity 4 features.

[![npm version](https://img.shields.io/npm/v/timefi-sdk.svg?style=flat-square)](https://www.npmjs.com/package/timefi-sdk)
[![npm downloads](https://img.shields.io/npm/dm/timefi-sdk.svg?style=flat-square)](https://www.npmjs.com/package/timefi-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-orange)](https://stacks.co)
[![Clarity 4](https://img.shields.io/badge/Clarity-4-blue)](https://clarity-lang.org)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)
[![Semantic Versioning](https://img.shields.io/badge/semver-2.0.0-blue.svg?style=flat-square)](https://semver.org)
[![Testing: Vitest](https://img.shields.io/badge/testing-vitest-blue.svg)](https://vitest.dev)
[![Maintenance: Active](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/AdekunleBamz/TimeFi-Protocol/graphs/commit-activity)
[![Security Policy](https://img.shields.io/badge/security-policy-brightgreen.svg)](SECURITY.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Twitter](https://img.shields.io/twitter/follow/TimeFiProtocol?style=social)](https://twitter.com/TimeFiProtocol)
[![Discord](https://img.shields.io/discord/1234567890?label=discord&logo=discord&style=social)](https://discord.gg/timefi)
[![GitHub stars](https://img.shields.io/github/stars/AdekunleBamz/TimeFi-Protocol?style=social)](https://github.com/AdekunleBamz/TimeFi-Protocol)
[![Build Status](https://img.shields.io/github/actions/workflow/status/AdekunleBamz/TimeFi-Protocol/ci.yml?branch=main&style=flat-square)](https://github.com/AdekunleBamz/TimeFi-Protocol/actions)
[![Coverage Status](https://img.shields.io/coveralls/github/AdekunleBamz/TimeFi-Protocol?style=flat-square)](https://coveralls.io/github/AdekunleBamz/TimeFi-Protocol)
[![Documentation Status](https://img.shields.io/badge/docs-latest-brightgreen?style=flat-square)](docs/API.md)
[![GitHub Forks](https://img.shields.io/github/forks/AdekunleBamz/TimeFi-Protocol?style=social)](https://github.com/AdekunleBamz/TimeFi-Protocol)
[![Style: Conventional Commits](https://img.shields.io/badge/style-conventional%20commits-brightgreen.svg?style=flat-square)](https://conventionalcommits.org)

## 🏗️ Project Structure

TimeFi-Protocol/
 - 📂 `contracts/` — Clarity smart contracts
 - 📂 `frontend/` — React-based web dashboard
 - 📂 `sdk/` — JavaScript/TypeScript SDK
 - 📂 `deployments/` — Clarinet deployment plans
 - 📂 `settings/` — Network configuration
 - 📂 `tests/regressions/` — Regression and edge-case suites
 - 📂 `tests/` — Contract testing suite
 - 📂 `docs/` — Additional documentation

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
 
- [Clarinet](https://github.com/hirosystems/clarinet) installed
 - Node.js 18+
 - Access to a Stacks node API for the network you are targeting (mainnet by default)
 
 ### 🛠️ Development
 
 For detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).
 
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

# Run frontend tests from root
npm run frontend:test

# Start devnet
clarinet devnet start

# Run frontend (Vite)
npm run frontend:dev

# Build SDK package
npm run sdk:build
```

### 💻 Frontend Dashboard
 
 ```bash
 cd frontend
 npm ci
 npm run dev
 ```
 
 ### 📦 SDK Library
 
 ```bash
 cd sdk
 npm ci
 npm run build
 ```

### 🔗 SDK Library Integration

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

### 🔓 Public Contract Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `create-vault` | `(amount uint) (lock-secs uint)` | Create a new time-locked vault |
| `withdraw` | `(id uint)` | Withdraw from an unlocked vault |
| `approve-bot` | `(bot principal)` | Approve a trading bot contract |

### 🔍 Read-Only Contract Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `get-vault` | `(id uint)` | Get vault details |
| `is-active` | `(id uint)` | Check if vault is active |
| `get-time-remaining` | `(id uint)` | Get seconds to unlock |
| `can-withdraw` | `(id uint)` | Check withdrawal readiness |
| `is-bot` | `(sender principal)` | Check if sender is approved bot |

## ⚙️ Configuration

 ### 🔢 Protocol Constants
 
 ```clarity
 MIN_DEPOSIT: 10,000 microSTX (0.01 STX)
MIN_LOCK: 3,600 seconds (1 hour)
MAX_LOCK: 31,536,000 seconds (1 year)
FEE_BPS: 50 (0.5%)
```

## 🧱 Infrastructure
  - Mainnet testing and funding flows: `docs/MAINNET_TESTING.md`
  - **Audit Status**: [Internal Audit v1.0] (Pending External Review)
  - **Security Bounty**: Bug bounty program coming Q2 2026.
  - **Emergency Pause**: Protocol can be paused by multisig in case of critical vulnerability.
  - **Formal Verification**: Clarity contracts are being verified using TLA+.
  
   ### 🌐 Network API Endpoints
 
 - **Mainnet**: `https://stacks-node-api.mainnet.stacks.co`
 - **Testnet**: `https://stacks-node-api.testnet.stacks.co`
 
  ### ⚙️ Deployment Settings
  - **Clarinet Settings**: [settings/Clarinet.toml](settings/Clarinet.toml)
  - **Mainnet Plan**: [deployments/default.mainnet-plan.yaml](deployments/default.mainnet-plan.yaml)
  - **Testnet Plan**: [deployments/default.testnet-plan.yaml](deployments/default.testnet-plan.yaml)
  
  ## 🗳️ Governance
 
 TimeFi Protocol is governed by its community. Future proposals will be handled via the on-chain governance module.
 
 ## 👥 Community
 
 - **Discord**: [Join our Discord](https://discord.gg/timefi)
 - **Twitter**: [@TimeFiProtocol](https://twitter.com/TimeFiProtocol)
 
 ## 🪐 Ecosystem
 
 - **Mainnet Explorer**: [View on Stacks Explorer](https://explorer.hiro.so/?chain=mainnet)
 - **Testnet Explorer**: [View on Stacks Explorer](https://explorer.hiro.so/?chain=testnet)
 - **Console.xyz**: [Community discussions and governance](https://console.xyz)
 
 ## ❓ FAQ
 
 **Q: What is microSTX?**
 A: It is the smallest unit of STX. 1 STX = 1,000,000 microSTX.
 
 **Q: What is the minimum lock period?**
 A: The minimum lock period is 3,600 seconds (1 hour).
 
 ## 🗺️ Roadmap 2026
 
 - **Q1 2026**: Mobile Wallet Support & SDK v2
 - **Q2 2026**: Multi-sig Vaults & Fee Sharing
 
 - **Q3 2026**: L2 Integrations (Starknet/Arbitrum) & L3 Hyperchains
 - **Q4 2026**: Decentralized Frontend & DAO Governance
 
 ## 📖 Operations Docs
 
 - Mainnet testing and funding flows: [MAINNET_TESTING.md](docs/MAINNET_TESTING.md)
 - Technical Specification: [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md)
 
 ## 📦 Package Metadata
 - **Name**: `timefi-sdk`
 - **Version**: `0.1.0`
 - **Architecture**: ES Modules
 - **License**: MIT
 
 ## 🤝 Acknowledgments
 
 - **Stacks Foundation**: For the Clarity 4 development tools.
 - **Hiro Systems**: For the Stacks/Transactions library.
 
 ## 👤 Contributors
 
 - **AdekunleBamz**: Lead Developer
 
 ## 📄 License
 
 - [Security Policy](SECURITY.md)
 - [Code of Conduct](CODE_OF_CONDUCT.md)
 
 MIT License - Copyright (c) 2026 TimeFi Protocol Team
 
 ---
 Made with ❤️ by the [TimeFi Team](https://github.com/AdekunleBamz/TimeFi-Protocol)
