# 💎 Diamond Hands Protocol V3

**Lock. Earn. Prove Your Commitment.**

Non-custodial time-locked DeFi vaults built on Stacks blockchain with a gamified points system. Lock your STX or sBTC, earn points based on commitment level, and prove you're a true HODLer.

## 🌟 Overview

Diamond Hands Protocol V3 is a decentralized vault system that rewards users for locking their assets for extended periods. The longer you lock, the more points you earn. Features include vault naming, tier-based multipliers, and a leaderboard system to track top point holders.

## ✨ Key Features

### 🎯 Core Features
- **Multi-Asset Support**: Lock STX or sBTC in time-locked vaults
- **Points System**: Earn points based on amount, lock duration, and tier multiplier
- **Vault Naming**: Personalize your vaults with custom names (up to 50 characters)
- **Tier System**: Four tiers (Bronze, Silver, Gold, Diamond) with increasing multipliers
- **Leaderboard**: Compete with other users for top point rankings
- **Non-Custodial**: Your assets stay in smart contracts with direct withdrawal access
- **Permissionless**: No admin approval needed—withdraw directly when unlocked

### 🏆 Points & Tiers

| Tier | Lock Duration | Multiplier | Points Formula |
|------|---------------|------------|----------------|
| **BRONZE** | 7-29 days | 1x | Amount × Days × 1 |
| **SILVER** | 30-59 days | 1.5x | Amount × Days × 1.5 |
| **GOLD** | 60-89 days | 2x | Amount × Days × 2 |
| **DIAMOND** | 90 days | 3x | Amount × Days × 3 |

**sBTC Bonus**: sBTC vaults earn **10x bonus points** on top of tier multipliers!

### 💰 Fee Structure
- **Creation Fee**: 0.25% (reduced from 0.5%)
- **Early Withdrawal Penalty**: 10% of locked amount
- **Early Withdrawal Points Penalty**: 50% of earned points forfeited

### 📊 Vault Parameters
- **Minimum STX Deposit**: 1 STX
- **Minimum sBTC Deposit**: 0.0001 sBTC
- **Lock Period**: 7-90 days
- **Withdrawal**: Direct withdrawal after unlock (no admin needed)
- **Early Withdrawal**: Available with 10% penalty + 50% points forfeiture

## 🏗️ Architecture

### Smart Contract
- **Contract Name**: `diamond-hands-v3`
- **Network**: Stacks Mainnet
- **Contract Address**: `SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N`
- **Clarity Version**: 4
- **Epoch**: 3.3

### Frontend
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Wallet Integration**: Stacks Connect
- **Network**: Stacks Mainnet

## 🔧 Clarity 4 Features

The protocol leverages all 5 Clarity 4 functions:

1. **`stacks-block-time`** - Real-time vault unlock logic using blockchain timestamps
2. **`secp256r1-verify`** - Passkey authentication for enhanced security
3. **`contract-hash?`** - Verified contract integration capabilities
4. **`restrict-assets?`** - Asset protection mechanisms
5. **`to-ascii?`** - Human-readable vault receipts

## 📝 Contract Functions

### STX Vault Functions
- `create-stx-vault` - Create a new STX vault with custom name
- `withdraw-stx` - Withdraw STX after unlock period
- `early-withdraw-stx` - Withdraw early with penalty

### sBTC Vault Functions
- `create-sbtc-vault` - Create a new sBTC vault with custom name
- `withdraw-sbtc` - Withdraw sBTC after unlock period
- `early-withdraw-sbtc` - Withdraw early with penalty

### Read-Only Functions
- `get-vault` - Get vault details by ID
- `get-vault-info` - Get comprehensive vault information
- `get-user-stats` - Get user statistics (vaults, points, locked amounts)
- `get-user-points` - Get user's total points
- `get-protocol-stats` - Get protocol-wide statistics
- `estimate-points` - Estimate points before creating vault
- `get-tier-name` - Get tier name based on lock duration
- `get-vault-receipt` - Get human-readable vault receipt
- `get-contract-info` - Get contract information and features

### Admin Functions
- `set-fee-recipient` - Update fee recipient address (owner only)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Clarinet 3.8.0+
- Stacks wallet (Hiro Wallet, Xverse, etc.)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Contract Development

```bash
# Check contract syntax
clarinet check

# Start local devnet
clarinet integrate

# Run tests
npm test
```

## 📦 Deployment

### Mainnet Deployment

1. **Configure Mainnet Wallet**
   ```bash
   nano settings/Mainnet.toml
   ```
   Add your mnemonic phrase.

2. **Generate Deployment Plan**
   ```bash
   clarinet deployments generate --mainnet --medium-cost
   ```

3. **Review Costs**
   ```bash
   cat deployments/default.mainnet-plan.yaml
   ```

4. **Deploy**
   ```bash
   clarinet deployments apply -p deployments/default.mainnet-plan.yaml
   ```

5. **Verify**
   Check deployment on [Stacks Explorer](https://explorer.stacks.co)

### Contract Addresses

- **Mainnet Contract**: `SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.diamond-hands-v3`
- **sBTC Token**: `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Contract Tests
```bash
npm test
```

Tests cover:
- Vault creation and validation
- Points calculation across tiers
- Withdrawal functionality
- Early withdrawal penalties
- User statistics
- Protocol statistics

## 📱 Frontend Features

### User Interface
- **Dashboard**: View protocol stats, your vaults, and leaderboard
- **Create Vault Modal**: Select asset (STX/sBTC), set amount, lock period, and name
- **Vault Cards**: Display vault details, time remaining, points earned, and actions
- **Leaderboard**: Top 10 point holders with rankings
- **Stats Display**: Real-time protocol statistics including TVL for both assets

### Key UI Components
- Asset selector (STX/sBTC)
- Tier preview with multipliers
- Points estimation calculator
- Time remaining countdown
- Progress bars for lock periods
- Responsive design for mobile and desktop

## 🔐 Security Features

- **Non-Custodial**: Assets held in smart contracts, not by a central party
- **Permissionless Withdrawals**: No admin approval required
- **Immutable Logic**: Contract functions cannot be modified after deployment
- **Passkey Support**: Optional hardware passkey authentication
- **Asset Protection**: Built-in asset restriction checks

## 📊 Points Calculation

### Formula
```
Points = (Amount / 1,000,000) × Lock_Days × Tier_Multiplier / 10,000
```

For sBTC:
```
Points = Base_Points × 10
```

### Example
- **1 STX locked for 90 days (Diamond tier)**
  - Base: 1 × 90 × 3 = 270 points
  
- **1 sBTC locked for 90 days (Diamond tier)**
  - Base: 1 × 90 × 3 = 270 points
  - With sBTC bonus: 270 × 10 = 2,700 points

## 🎮 How to Use

1. **Connect Wallet**: Click "Connect Wallet" and authorize with your Stacks wallet
2. **Create Vault**: 
   - Click "Create Diamond Vault"
   - Select asset (STX or sBTC)
   - Enter vault name
   - Set amount and lock period (7-90 days)
   - Review estimated points
   - Confirm transaction
3. **Monitor Vault**: View your vaults with time remaining and points earned
4. **Withdraw**: After unlock period, click "Claim" to withdraw (points retained)
5. **Early Withdraw**: Click "Paper Hands" to withdraw early (10% penalty + 50% points lost)

## 📈 Protocol Statistics

The protocol tracks:
- Total vaults created
- Total Value Locked (STX + sBTC)
- Total points distributed
- Total fees collected
- User-specific statistics

## 🔗 Links

- **Contract Explorer**: [View on Stacks Explorer](https://explorer.stacks.co/txid/SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.diamond-hands-v3?chain=mainnet)
- **GitHub Repository**: [TimeFi-Protocol](https://github.com/AdekunleBamz/TimeFi-Protocol)

## 📄 License

See [LICENSE](LICENSE) file for details.

## 👥 Contributors

- **Bamzz** - Protocol Developer

## 🏆 Competition

Built for Stacks Builder Challenges Week 1 (Dec 10-14, 2024)

---

**💎 Diamond Hands Protocol V3 - Lock. Earn. Prove Your Commitment.**
