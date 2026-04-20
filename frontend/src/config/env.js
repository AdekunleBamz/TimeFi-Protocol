/**
 * Environment Configuration - Centralized env var access.
 *
 * Provides typed, validated access to all environment variables
 * with sensible defaults for each network (mainnet, testnet, devnet).
 *
 * @module config/env
 * @author adekunlebamz
 * @example
 * import { env } from './config/env';
 *
 * // Access network
 * console.log(env.network); // 'mainnet' | 'testnet' | 'devnet'
 *
 * // Get contract ID
 * const vaultId = env.getContractId('vault');
 *
 * // Explorer URLs
 * const txUrl = env.getExplorerTxUrl('0x123...');
 */

/**
 * normalizeNetwork - Normalize network string to lowercase.
 * @param {string} value - Raw network value
 * @returns {string} Normalized network name
 */
const normalizeNetwork = (value) => String(value || '').trim().toLowerCase();
const SUPPORTED_NETWORKS = ['mainnet', 'testnet', 'devnet'];
export { SUPPORTED_NETWORKS };
/**
 * parseBoolean - Parse string to boolean.
 * @param {string} value - String value to parse
 * @returns {boolean} Parsed boolean
 */
const parseBoolean = (value) => String(value || '').trim().toLowerCase() === 'true';
const configuredNetwork = normalizeNetwork(import.meta.env.VITE_NETWORK) || 'mainnet';
const resolvedNetwork = SUPPORTED_NETWORKS.includes(configuredNetwork) ? configuredNetwork : 'mainnet';

export const env = {
  // Network
  network: resolvedNetwork,
  
  // Contract Configuration
  contractAddress: (import.meta.env.VITE_CONTRACT_ADDRESS || 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N').trim(),
  contracts: {
    vault: (import.meta.env.VITE_VAULT_CONTRACT || 'timefi-vault-v-A2').trim(),
    rewards: (import.meta.env.VITE_REWARDS_CONTRACT || 'timefi-rewards-v-A2').trim(),
    governance: (import.meta.env.VITE_GOVERNANCE_CONTRACT || 'timefi-governance-v-A2').trim(),
    emergency: (import.meta.env.VITE_EMERGENCY_CONTRACT || 'timefi-emergency-v-A2').trim(),
  },
  
  // API Configuration
  hiroApiUrl: (
    import.meta.env.VITE_HIRO_API_URL
    || (resolvedNetwork === 'testnet' ? 'https://api.testnet.hiro.so' : 'https://api.mainnet.hiro.so')
  ).trim(),
  explorerUrl: (import.meta.env.VITE_EXPLORER_URL || 'https://explorer.hiro.so').trim(),
  
  // App Info
  appName: (import.meta.env.VITE_APP_NAME || 'TimeFi Protocol').trim(),
  appDescription: (import.meta.env.VITE_APP_DESCRIPTION || 'Time-locked STX vaults on Stacks').trim(),
  appVersion: (import.meta.env.VITE_APP_VERSION || '1.0.0').trim(),
  
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
    const key = String(contractName || '').trim();
    const name = this.contracts[key] ?? key;
    if (!name) {
      throw new Error(`Unknown contract: "${contractName}"`);
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

  // Human-readable network label for display in the UI
  getNetworkLabel() {
    const labels = { mainnet: 'Mainnet', testnet: 'Testnet', devnet: 'Devnet' };
    return labels[this.network] || 'Unknown';
  },
};

export default env;
