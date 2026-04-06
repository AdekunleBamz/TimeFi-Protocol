import {
  callReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV,
  uintCV,
} from '@stacks/transactions';
import { STACKS_NETWORK, CONTRACT_ADDRESS, CONTRACT_NAMES } from '../utils/constants';
import { env } from '../config/env';

/**
 * API Service - Hiro API and read-only contract queries.
 *
 * Provides low-level access to Stacks blockchain data via the Hiro API
 * and read-only Clarity function calls. Used by hooks and higher-level
 * services for data fetching.
 *
 * @module services/api
 */
/**
 * HIRO_API_URL - Base URL for Hiro API requests.
 *
 * Determined from environment configuration with fallback to
 * the configured network's core API URL or mainnet default.
 * @type {string}
 */
const HIRO_API_URL = env.hiroApiUrl || STACKS_NETWORK?.coreApiUrl || 'https://api.mainnet.hiro.so';

/**
 * safeParseInt - Safely parse integer values with fallback.
 *
 * Handles various input types and provides a default value
 * when parsing fails or input is invalid.
 *
 * @param {string|number|undefined|null} value - Value to parse as integer
 * @param {number} [fallback=0] - Default value if parsing fails
 * @returns {number} Parsed integer or fallback value
 * @example
 * safeParseInt('123') // returns 123
 * safeParseInt('abc', 42) // returns 42
 * safeParseInt(null, 10) // returns 10
 */
function safeParseInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * fetchAPI - Internal fetch wrapper with standardized error handling.
 *
 * Provides a consistent interface for making API requests to the Hiro API
 * with automatic error handling and response parsing.
 *
 * @param {string} endpoint - API endpoint path (will be appended to base URL)
 * @param {Object} [options={}] - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Object>} Parsed JSON response data
 * @throws {Error} On non-OK HTTP response or network error
 * @example
 * const data = await fetchAPI('/extended/v1/block?limit=1');
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${HIRO_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

/**
 * Get current block height
 * @returns {Promise<number>} Current block height
 */
export async function getBlockHeight() {
  const data = await fetchAPI('/extended/v1/block?limit=1');
  return safeParseInt(data.results?.[0]?.height);
}

/**
 * Get account STX balance
 * @param {string} address - Stacks address
 * @returns {Promise<Object>} Account balance info
 */
export async function getAccountBalance(address) {
  const data = await fetchAPI(`/extended/v1/address/${address}/stx`);
  return {
    balance: safeParseInt(data.balance),
    locked: safeParseInt(data.locked),
    totalSent: safeParseInt(data.total_sent),
    totalReceived: safeParseInt(data.total_received),
  };
}

/**
 * Get account transactions
 * @param {string} address - Stacks address
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Transactions list
 */
export async function getAccountTransactions(address, options = {}) {
  const { limit = 20, offset = 0 } = options;
  const safeLimit = Math.max(1, Math.min(50, safeParseInt(limit, 20)));
  const safeOffset = Math.max(0, safeParseInt(offset, 0));
  const data = await fetchAPI(
    `/extended/v1/address/${address}/transactions?limit=${safeLimit}&offset=${safeOffset}`
  );
  
  return {
    transactions: (data.results || []).map(normalizeTransaction),
    total: safeParseInt(data.total),
    hasMore: safeOffset + safeLimit < safeParseInt(data.total),
  };
}

/**
 * Get transaction by ID
 * @param {string} txId - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export async function getTransaction(txId) {
  const data = await fetchAPI(`/extended/v1/tx/${txId}`);
  return normalizeTransaction(data);
}

/**
 * normalizeTransaction - Transform Hiro API transaction format to app format.
 *
 * Converts raw transaction data from the Hiro API into a standardized
 * format used throughout the application for consistent display and processing.
 *
 * @param {Object} tx - Raw transaction object from Hiro API
 * @returns {Object} Normalized transaction with standardized fields
 * @property {string} txId - Transaction ID
 * @property {string} type - Transaction type (contract_call, token_transfer, etc.)
 * @property {string} status - Transaction status (success, pending, failed)
 * @property {string} sender - Sender address
 * @property {number} fee - Transaction fee in microSTX
 * @property {number} nonce - Transaction nonce
 * @property {number} blockHeight - Block height where transaction was included
 * @property {number} blockTime - Block timestamp in milliseconds
 * @property {Object|null} contractCall - Contract call details if applicable
 */
function normalizeTransaction(tx) {
  return {
    txId: tx.tx_id,
    type: tx.tx_type,
    status: tx.tx_status,
    sender: tx.sender_address,
    fee: safeParseInt(tx.fee_rate),
    nonce: tx.nonce,
    blockHeight: tx.block_height,
    blockTime: safeParseInt(tx.block_time) * 1000,
    contractCall: tx.contract_call ? {
      contractId: tx.contract_call.contract_id,
      functionName: tx.contract_call.function_name,
      functionArgs: tx.contract_call.function_args,
    } : null,
  };
}

/**
 * API Service - HTTP client for TimeFi backend API.
 *
 * Provides a centralized fetch wrapper with automatic base URL handling,
 * request/response interception, and error normalization.
 *
 * @module services/api
 * @author adekunlebamz
 */
export async function callReadOnly(contractName, functionName, functionArgs = [], senderAddress) {
  const result = await callReadOnlyFunction({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName,
    functionName,
    functionArgs,
    senderAddress: senderAddress || CONTRACT_ADDRESS,
  });
  
  return cvToJSON(result);
}

/**
 * Get vault details
 * @param {number} vaultId - Vault ID
 * @returns {Promise<Object>} Vault details
 */
export async function getVaultDetails(vaultId) {
  const result = await callReadOnly(
    CONTRACT_NAMES.VAULT,
    'get-vault-details',
    [uintCV(vaultId)]
  );
  
  if (result.type === 'none') {
    return null;
  }
  
  const vault = result.value;
  return {
    id: vaultId,
    owner: vault.owner.value,
    amount: parseInt(vault.amount.value, 10),
    unlockHeight: parseInt(vault['unlock-height'].value, 10),
    withdrawn: vault.withdrawn.value,
    emergencyUnlocked: vault['emergency-unlocked']?.value || false,
  };
}

/**
 * Get user vaults
 * @param {string} address - User address
 * @returns {Promise<Array>} User's vault IDs
 */
export async function getUserVaults(address) {
  const result = await callReadOnly(
    CONTRACT_NAMES.VAULT,
    'get-user-vaults',
    [standardPrincipalCV(address)]
  );
  
  if (result.type === 'none') {
    return [];
  }
  
  return result.value.map(v => parseInt(v.value, 10));
}

/**
 * Get total vault count
 * @returns {Promise<number>} Total number of vaults
 */
export async function getVaultCount() {
  const result = await callReadOnly(
    CONTRACT_NAMES.VAULT,
    'get-vault-count',
    []
  );
  
  return safeParseInt(result.value);
}

/**
 * Get pending rewards for a vault
 * @param {number} vaultId - Vault ID
 * @returns {Promise<number>} Pending rewards in microSTX
 */
export async function getPendingRewards(vaultId) {
  const result = await callReadOnly(
    CONTRACT_NAMES.REWARDS,
    'get-pending-rewards',
    [uintCV(vaultId)]
  );
  
  return safeParseInt(result.value);
}

export default {
  getBlockHeight,
  getAccountBalance,
  getAccountTransactions,
  getTransaction,
  callReadOnly,
  getVaultDetails,
  getUserVaults,
  getVaultCount,
  getPendingRewards,
};
