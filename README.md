# TimeFi Protocol

A time-locked vault protocol built on the Stacks blockchain using Clarity 4 features.

## 🏗️ Project Structure

```
timefi-protocol/
├── contracts/
│   └── timefi-vault.clar    # Main vault contract
├── frontend/                # React app for end users
├── sdk/                     # TypeScript SDK package
├── deployments/             # Clarinet deployment plans
├── settings/                # Network configuration
└── tests/                   # Contract tests
```

## ✨ Features

### Smart Contract Features
- **Create Vaults** - Deposit STX with time-lock
- **Withdraw** - Claim funds after lock period
- **Bot Approval** - Approve automated trading bots via `contract-hash?`
- **Fee Collection** - 0.5% fee on deposits

### Clarity 4 Functions Used
- `stacks-block-time` - For unlock time calculation
- `contract-hash?` - For bot verification

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
clarinet test

# Start devnet
clarinet devnet start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### SDK

```bash
cd sdk
npm install
npm run build
```

## 📝 Contract Functions

### Public Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `create-vault` | `(amount uint) (lock-secs uint)` | Create a new time-locked vault |
| `withdraw` | `(id uint)` | Withdraw from an unlocked vault |
| `approve-bot` | `(bot principal)` | Approve a trading bot contract |

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
MIN_LOCK: 3,600 seconds (1 hour)
MAX_LOCK: 31,536,000 seconds (1 year)
FEE_BPS: 50 (0.5%)
```

## 📄 License

MIT License
