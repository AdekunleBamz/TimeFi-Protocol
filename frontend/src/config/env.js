/**
 * Environment configuration
 * Centralized access to environment variables with defaults
 */

const normalizeNetwork = (value) => String(value || '').trim().toLowerCase();
const SUPPORTED_NETWORKS = ['mainnet', 'testnet', 'devnet'];
export { SUPPORTED_NETWORKS };
const parseBoolean = (value) => String(value || '').trim().toLowerCase() === 'true';

export const env = {
  // Network
  network: normalizeNetwork(import.meta.env.VITE_NETWORK) || 'mainnet',
  
  // Contract Configuration
  contractAddress: (import.meta.env.VITE_CONTRACT_ADDRESS || 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N').trim(),
  contracts: {
    vault: (import.meta.env.VITE_VAULT_CONTRACT || 'timefi-vault-v-A2').trim(),
    rewards: (import.meta.env.VITE_REWARDS_CONTRACT || 'timefi-rewards-v-A2').trim(),
    governance: (import.meta.env.VITE_GOVERNANCE_CONTRACT || 'timefi-governance-v-A2').trim(),
    emergency: (import.meta.env.VITE_EMERGENCY_CONTRACT || 'timefi-emergency-v-A2').trim(),
  },
  
  // API Configuration
  hiroApiUrl: (import.meta.env.VITE_HIRO_API_URL || 'https://api.mainnet.hiro.so').trim(),
  explorerUrl: (import.meta.env.VITE_EXPLORER_URL || 'https://explorer.hiro.so').trim(),
  
  // App Info
  appName: (import.meta.env.VITE_APP_NAME || 'TimeFi Protocol').trim(),
  appDescription: (import.meta.env.VITE_APP_DESCRIPTION || 'Time-locked vaults on Stacks').trim(),
  
  // Feature Flags
  enableTestnet: parseBoolean(import.meta.env.VITE_ENABLE_TESTNET),
  enableDebug: parseBoolean(import.meta.env.VITE_ENABLE_DEBUG),
  
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

  get isKnownNetwork() {
    return SUPPORTED_NETWORKS.includes(this.network);
  },

  get explorerChain() {
    return this.isKnownNetwork ? this.network : 'mainnet';
  },
  
  // Helper to get full contract ID
  getContractId(contractName) {
    const name = this.contracts[contractName] ?? contractName;
    if (!name) {
      throw new Error('contractName is required');
    }
    return `${this.contractAddress}.${name}`;
  },
  
  // Helper to get explorer URL for address
  getExplorerAddressUrl(address) {
    return `${this.explorerUrl}/address/${address}?chain=${this.explorerChain}`;
  },
  
  // Helper to get explorer URL for transaction
  getExplorerTxUrl(txId) {
    return `${this.explorerUrl}/txid/${txId}?chain=${this.explorerChain}`;
  },
};

export default env;
