/**
 * Environment configuration
 * Centralized access to environment variables with defaults
 */

export const env = {
  // Network
  network: import.meta.env.VITE_NETWORK || 'mainnet',
  
  // Contract Configuration
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N',
  contracts: {
    vault: import.meta.env.VITE_VAULT_CONTRACT || 'vault-v-A2',
    rewards: import.meta.env.VITE_REWARDS_CONTRACT || 'rewards-v-A2',
    governance: import.meta.env.VITE_GOVERNANCE_CONTRACT || 'governance-v-A2',
    emergency: import.meta.env.VITE_EMERGENCY_CONTRACT || 'emergency-v-A2',
  },
  
  // API Configuration
  hiroApiUrl: import.meta.env.VITE_HIRO_API_URL || 'https://api.mainnet.hiro.so',
  explorerUrl: import.meta.env.VITE_EXPLORER_URL || 'https://explorer.hiro.so',
  
  // App Info
  appName: import.meta.env.VITE_APP_NAME || 'TimeFi Protocol',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Time-locked vaults on Stacks',
  
  // Feature Flags
  enableTestnet: import.meta.env.VITE_ENABLE_TESTNET === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // Derived values
  get isMainnet() {
    return this.network === 'mainnet';
  },
  
  get isTestnet() {
    return this.network === 'testnet';
  },
  
  get isDevnet() {
    return this.network === 'devnet';
  },
  
  // Helper to get full contract ID
  getContractId(contractName) {
    const name = this.contracts[contractName] || contractName;
    return `${this.contractAddress}.${name}`;
  },
  
  // Helper to get explorer URL for address
  getExplorerAddressUrl(address) {
    return `${this.explorerUrl}/address/${address}?chain=${this.network}`;
  },
  
  // Helper to get explorer URL for transaction
  getExplorerTxUrl(txId) {
    return `${this.explorerUrl}/txid/${txId}?chain=${this.network}`;
  },
};

export default env;
