# TimeFi Frontend

React-based frontend for the TimeFi Protocol time-locked vault system on Stacks.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Blockchain**: Stacks (via @stacks/connect, @stacks/transactions)
- **Styling**: CSS Modules with custom properties

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
npm install
```

### Development

```bash
npm run dev
```

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

Contract addresses and network configuration are in `src/config/contracts.js`:

```javascript
export const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
export const NETWORK = 'mainnet';
```

## Environment Variables

Create a `.env` file:

```env
VITE_NETWORK=mainnet
VITE_CONTRACT_ADDRESS=SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
