# TimeFi Protocol

A time-locked vault protocol built on the Stacks blockchain using Clarity 4 features.

## 🏗️ Project Structure

timefi-protocol/
├── contracts/       # Clarity smart contracts
├── frontend/        # React-based web dashboard
├── sdk/             # JavaScript/TypeScript SDK
├── scripts/         # Deployment and maintenance scripts
├── settings/        # Network configuration
├── tests/           # Contract testing suite
└── docs/            # Additional documentation
## ✨ Features

### Smart Contract Features
- **Create Vaults** - Deposit STX with time-lock
- **Withdraw Flow** - User requests withdrawal, deployer processes payout
- **Bot Approval** - Approve automated trading bots by principal allowlist
- **Fee Collection** - 0.5% fee on deposits

### Clarity 4 Functions Used
- `tenure-height` - For unlock height calculation
- `map-get?` / `map-set` - For bot allowlist and vault state

## 🚀 Getting Started

### Prerequisites
- Clarinet installed
- Node.js 18+

### Development

```bash
# Install dependencies
npm install

# Check contracts
clarinet check

# Run tests
npm test

# Start devnet
clarinet devnet start
```

### SDK Integration

The `@timefi/sdk` provides a clean interface for interacting with the protocol:

```javascript
import { TimeFiClient } from './sdk/src/client.js';

const client = new TimeFiClient('testnet');
const vault = await client.getVault(1);
```

## 🛠️ Tech Stack

- **Smart Contracts**: Clarity 4 (Stacks Blockchain)
- **Frontend**: React + Vite + Vanilla CSS
- **SDK**: JavaScript / `@stacks/transactions`
- **Tooling**: Clarinet, Vitest

## 📝 Contract Functions

### Public Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `create-vault` | `(amount uint) (lock-blocks uint)` | Create a new time-locked vault |
| `request-withdraw` | `(id uint)` | Request withdrawal after unlock |
| `process-withdraw` | `(id uint)` | Process payout (deployer only) |
| `approve-bot` | `(bot principal)` | Approve a trading bot principal |

### Read-Only Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `get-vault` | `(id uint)` | Get vault details |
| `is-active` | `(id uint)` | Check if vault is active |
| `is-bot` | `(sender principal)` | Check if sender is approved bot |

## ⚙️ Configuration

### Constants

```clarity
MIN_DEPOSIT: 10,000 microSTX (0.01 STX)
MIN_LOCK: 6 blocks (~1 hour)
MAX_LOCK: 52,560 blocks (~1 year)
FEE_BPS: 50 (0.5%)
```

## 📄 License

MIT License
