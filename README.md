# TimeFi Protocol

Time-locked DeFi vaults built on Stacks with **all 5 Clarity 4 functions**.

## Clarity 4 Features Used

1. **stacks-block-time** - Real-time vault unlock logic
2. **secp256r1-verify** - Passkey authentication  
3. **contract-hash?** - Verified trading bot integration
4. **restrict-assets?** - Asset protection checks
5. **to-ascii?** - Human-readable vault receipts

## Core Functions

- `create-vault` - Deposit STX with time lock (7-90 days)
- `request-withdraw` - Request withdrawal after unlock
- `process-withdraw` - Admin processes withdrawal
- `early-withdraw` - Withdraw early with 10% penalty
- `passkey-request` - Hardware passkey secured requests

## Deployment
```bash
clarinet check
clarinet deployments generate --mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

## Competition

Built for Stacks Builder Challenges Week 1 (Dec 10-14, 2024)
