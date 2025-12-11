# TimeFi Protocol Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│              (Web App / Mobile / CLI)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 TIMEFI VAULT CONTRACT                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   CREATE    │  │   REQUEST   │  │   PROCESS   │     │
│  │   VAULT     │  │  WITHDRAW   │  │  WITHDRAW   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │            CLARITY 4 FEATURES                     │   │
│  │  • stacks-block-time  • secp256r1-verify         │   │
│  │  • contract-hash?     • restrict-assets?         │   │
│  │  • to-ascii?                                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  STACKS BLOCKCHAIN                       │
│                   (Clarity 4 / Epoch 3.3)               │
└─────────────────────────────────────────────────────────┘
```

## Flow

1. **Deposit**: User → create-vault → STX to Deployer
2. **Lock**: Contract tracks unlock time using stacks-block-time
3. **Request**: User → request-withdraw → Event emitted
4. **Process**: Deployer → process-withdraw → STX to User
