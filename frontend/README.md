# TimeFi Frontend

React-based frontend for the TimeFi Protocol time-locked vault system on Stacks.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Blockchain**: Stacks (via @stacks/connect, @stacks/transactions)
- **Styling**: Component CSS files with shared custom properties

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── index.html
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Stacks wallet (Hiro Wallet recommended)

### Installation

```bash
cd frontend
npm ci
```

### Development

```bash
npm run dev
```

From the repository root, `npm run frontend:dev` provides the same local dev entrypoint.

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Components

### UI Components

| Component | Description |
|-----------|-------------|
| Button | Primary button with variants |
| Input | Text input with validation |
| Modal | Dialog overlay |
| Toast | Notification system |
| Tabs | Tabbed navigation |
| Card | Content container |
| Badge | Status indicators |
| Progress | Progress bars |
| Skeleton | Loading placeholders |
| Avatar | User/wallet avatars |

### Feature Components

| Component | Description |
|-----------|-------------|
| Header | Navigation and wallet |
| VaultCard | Vault display |
| CreateVaultForm | Vault creation |
| Countdown | Lock timer |

## Hooks

| Hook | Description |
|------|-------------|
| `useWallet` | Wallet connection state |
| `useContract` | Contract interactions |
| `useReadOnly` | Read-only contract calls |
| `useBlockHeight` | Current block tracking |
| `useDebounce` | Input debouncing |
| `useLocalStorage` | Persistent state |
| `useAsync` | Async operation handling |

## Configuration

Contract addresses are re-exported from `src/config/contracts.js`, while network selection is resolved from `src/config/env.js` and `.env` variables:

```javascript
export const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
// in .env
VITE_NETWORK=mainnet
```

> [!TIP]
> Always ensure your wallet is connected to the same network configured by `VITE_NETWORK`.

## Environment Variables

Copy `.env.example` to `.env` and adjust the values for your deployment:

```env
VITE_NETWORK=mainnet
VITE_CONTRACT_ADDRESS=SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N
VITE_VAULT_CONTRACT=timefi-vault-v-A2
VITE_REWARDS_CONTRACT=timefi-rewards-v-A2
VITE_GOVERNANCE_CONTRACT=timefi-governance-v-A2
VITE_EMERGENCY_CONTRACT=timefi-emergency-v-A2
VITE_HIRO_API_URL=https://api.mainnet.hiro.so
VITE_EXPLORER_URL=https://explorer.hiro.so
VITE_APP_NAME=TimeFi Protocol
VITE_APP_DESCRIPTION=Time-locked vaults on Stacks
VITE_ENABLE_TESTNET=false
VITE_ENABLE_DEBUG=false
```

When `VITE_NETWORK` changes, update `VITE_HIRO_API_URL` and `VITE_EXPLORER_URL` in the same edit.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
