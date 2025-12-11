# TimeFi Deployment Guide

## Prerequisites
- Clarinet 3.8.0+
- STX for deployment (~0.2 STX)
- Stacks wallet with mainnet STX

## Steps

### 1. Configure Mainnet Wallet
```bash
nano settings/Mainnet.toml
```

Add your mnemonic:
```toml
[network]
name = "mainnet"
stacks_node_rpc_address = "https://api.mainnet.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "your 24 word seed phrase here"
derivation = "m/44'/5757'/0'/0/0"
```

### 2. Generate Deployment Plan
```bash
clarinet deployments generate --mainnet --medium-cost
```

### 3. Review Costs
```bash
cat deployments/default.mainnet-plan.yaml
```

### 4. Deploy
```bash
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

### 5. Verify
Check deployment on [Stacks Explorer](https://explorer.stacks.co)

## Post-Deployment
1. Record contract address
2. Test create-vault with small amount
3. Share contract address for frontend integration
