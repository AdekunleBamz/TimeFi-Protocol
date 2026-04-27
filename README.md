# 🕰️ TimeFi Protocol

A time-locked vault protocol built on the Stacks blockchain using Clarity smart contract features.

[![npm version](https://img.shields.io/npm/v/timefi-sdk.svg?style=flat-square)](https://www.npmjs.com/package/timefi-sdk)
[![npm downloads](https://img.shields.io/npm/dm/timefi-sdk.svg?style=flat-square)](https://www.npmjs.com/package/timefi-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-orange)](https://stacks.co)
[![Clarity 4](https://img.shields.io/badge/Clarity-4-blue)](https://clarity-lang.org)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)
[![Semantic Versioning](https://img.shields.io/badge/semver-2.0.0-blue.svg?style=flat-square)](https://semver.org)
[![Testing: Vitest](https://img.shields.io/badge/testing-vitest-blue.svg)](https://vitest.dev)
[![Maintenance: Active](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/AdekunleBamz/TimeFi-Protocol/graphs/commit-activity)
[![Security Policy](https://img.shields.io/badge/security-policy-brightgreen.svg)](SECURITY.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)
[![Twitter](https://img.shields.io/twitter/follow/TimeFiProtocol?style=social)](https://twitter.com/TimeFiProtocol)
[![GitHub stars](https://img.shields.io/github/stars/AdekunleBamz/TimeFi-Protocol?style=social)](https://github.com/AdekunleBamz/TimeFi-Protocol)
[![Documentation Status](https://img.shields.io/badge/docs-latest-brightgreen?style=flat-square)](docs/API.md)
[![GitHub Forks](https://img.shields.io/github/forks/AdekunleBamz/TimeFi-Protocol?style=social)](https://github.com/AdekunleBamz/TimeFi-Protocol)

## 🏗️ Project Structure

```text
TimeFi-Protocol/
 - 📂 `contracts/` — Clarity smart contracts
 - 📂 `frontend/` — React-based web dashboard
 - 📂 `sdk/` — JavaScript/TypeScript SDK
 - 📂 `deployments/` — Clarinet deployment plans
 - 📂 `tests/regressions/` — Regression and edge-case suites
 - 📂 `tests/` — Contract testing suite
 - 📂 `docs/` — Additional documentation
```

## 🌟 Features

### 🔒 Smart Contract Features
- **Create Vaults** - Deposit STX with time-lock
- **Withdraw Requests** - Queue withdrawals once the lock matures
- **Custodian Processing** - Let the deployer process mature withdrawal payouts
- **Bot Approval** - Approve automated bot principals directly
- **Fee Collection** - 0.5% fee on deposits

### 📜 Clarity 4 Functions Used
- `tenure-height` - For block-based lock timing
- `stx-transfer?` - For deposit and withdrawal settlement

## 🚀 Getting Started

### 📋 Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) installed
- Node.js 18+ (LTS recommended)
- npm package manager (`npm ci` preferred for clean installs)
- Access to a Stacks node API for the network you are targeting (mainnet by default)
- Wallet network should match the configured API target before running write flows
 
### 🛠️ Development

For detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
# Install dependencies
npm ci

# Check contracts
npm run contracts:check

# Validate with project script
npm run check

# Open Clarinet console
npm run contracts:console

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

### ✅ Local Verification Checklist

Before opening a PR or pushing to `main`, run:

Ensure frontend dependencies are installed first (`npm --prefix frontend ci`).

```bash
npm run contracts:check
npm run sdk:test
npm run frontend:test
npm run verify:local
```

### 💻 Frontend Dashboard

```bash
npm --prefix frontend ci
npm run frontend:dev
```

### 📦 SDK Library

```bash
npm --prefix sdk ci
npm run sdk:build
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
| `create-vault` | `(amount uint) (lock-blocks uint)` | Create a new time-locked vault |
| `request-withdraw` | `(id uint)` | Queue a withdrawal after maturity |
| `process-withdraw` | `(id uint)` | Settle a mature withdrawal as deployer |
| `approve-bot` | `(bot principal)` | Approve a bot principal |
| `revoke-bot` | `(bot principal)` | Remove an approved bot principal |

### 🔍 Read-Only Contract Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `get-vault` | `(id uint)` | Get vault details |
| `is-active` | `(id uint)` | Check if vault is active |
| `get-time-remaining` | `(id uint)` | Get blocks remaining to unlock |
| `can-withdraw` | `(id uint)` | Check withdrawal readiness |
| `is-bot` | `(sender principal)` | Check if sender is approved bot |
| `get-tvl` | — | Get total value locked in microSTX |
| `get-vault-count` | — | Get total number of vaults created |
| `get-total-fees` | — | Get accumulated protocol fees |

## ⚙️ Configuration

### 🔢 Protocol Constants

```clarity
MIN_DEPOSIT: 10,000 microSTX (0.01 STX)
MIN_LOCK: 6 blocks (~1 hour)
MAX_LOCK: 52,560 blocks (~1 year)
FEE_BPS: 50 (0.5%)
```

## 🧱 Infrastructure

- **Audit Status**: Internal audit v1.0 complete (external review pending).
- **Security Bounty**: Bug bounty program coming Q2 2026.
- **Emergency Pause**: Protocol can be paused by multisig in case of critical vulnerability.
- **Formal Verification**: Clarity contracts are being verified using TLA+.

### 🌐 Network API Endpoints

- **Mainnet**: `https://api.mainnet.hiro.so`
- **Testnet**: `https://api.testnet.hiro.so`

### ⚙️ Deployment Settings
- **Clarinet Settings**: [Clarinet.toml](Clarinet.toml)

## 🗳️ Governance

TimeFi Protocol is governed by its community. Future proposals will be handled via the on-chain governance module (currently under active development).

## 👥 Community

- **Twitter**: [@TimeFiProtocol](https://twitter.com/TimeFiProtocol)
- **GitHub**: [AdekunleBamz](https://github.com/AdekunleBamz)

## 🪐 Ecosystem

- **Mainnet Explorer**: [View on Stacks Explorer](https://explorer.hiro.so/?chain=mainnet)
- **Testnet Explorer**: [View on Stacks Explorer](https://explorer.hiro.so/?chain=testnet)
- **Console.xyz**: [Community discussions and governance](https://console.xyz)

## ❓ FAQ

**Q: What is microSTX?**
A: It is the smallest unit of STX. 1 STX = 1,000,000 microSTX.

**Q: What is the minimum lock period?**
A: The minimum lock period is 6 Stacks blocks, or about 1 hour.

## 🗺️ Roadmap 2026

- **Q1 2026**: Mobile Wallet Support & SDK v2
- **Q2 2026**: Multi-sig Vaults & Fee Sharing
- **Q3 2026**: Cross-chain integrations and L3 experimentation
- **Q4 2026**: Decentralized Frontend & DAO Governance

## 📖 Operations Docs

- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Mainnet testing and funding flows: [MAINNET_TESTING.md](docs/MAINNET_TESTING.md)
- API reference: [API.md](docs/API.md)
- Security policy: [SECURITY.md](SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## 📦 SDK Package Metadata

- **Name**: `timefi-sdk`
- **Version**: `0.1.0`
- **Architecture**: ES Modules
- **License**: MIT

## 🤝 Acknowledgments

- **Stacks Foundation**: For the Clarity 4 development tools.
- **Hiro Systems**: For the Stacks/Transactions library.

## 👤 Contributors

- **AdekunleBamz**: Lead Developer & Maintainer

## 📄 License

- [License](LICENSE)
- [Security Policy](SECURITY.md)

MIT License - Copyright (c) 2026 TimeFi Protocol Team

---
Made with care by the [TimeFi Team](https://github.com/AdekunleBamz/TimeFi-Protocol)
