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
  if (value === '' || value === null || value === undefined) return fallback;
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
  const trimmedEndpoint = String(endpoint || '').trim();
  const url = `${HIRO_API_URL}${trimmedEndpoint}`;
  const { timeout = 15000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || `API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {};
    }

    return response.json();
  } finally {
    clearTimeout(timerId);
  }
}

/**
 * getBlockHeight - Fetch the current Stacks blockchain height.
 *
 * Retrieves the most recent block height from the Hiro API,
 * used for time-lock calculations and UI display.
 *
 * @returns {Promise<number>} Current block height as an integer
 * @throws {Error} If the API request fails
 * @example
 * const height = await getBlockHeight();
 * console.log(`Current block: ${height}`);
 */
export async function getBlockHeight() {
  const data = await fetchAPI('/extended/v1/block?limit=1');
  const height = safeParseInt(data.results?.[0]?.height);
  return height > 0 ? height : 0;
}

/**
 * getAccountBalance - Fetch STX balance information for an address.
 *
 * Retrieves comprehensive balance data including liquid balance,
 * locked balance, and total sent/received amounts from the Hiro API.
 *
 * @param {string} address - Stacks wallet address to query
 * @returns {Promise<Object>} Account balance information
 * @property {number} balance - Liquid STX balance in microSTX
 * @property {number} locked - Locked STX balance in microSTX
 * @property {number} totalSent - Total STX sent from this address
 * @property {number} totalReceived - Total STX received by this address
 * @throws {Error} If the API request fails
 * @example
 * const { balance, locked } = await getAccountBalance('SP...');
 * console.log(`Balance: ${balance} microSTX`);
 */
export async function getAccountBalance(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('A valid address is required');
  }
  const data = await fetchAPI(`/extended/v1/address/${address.trim()}/stx`);
  return {
    balance: safeParseInt(data.balance),
    locked: safeParseInt(data.locked),
    totalSent: safeParseInt(data.total_sent),
    totalReceived: safeParseInt(data.total_received),
  };
}

/**
 * getAccountTransactions - Fetch transaction history for an address.
 *
 * Retrieves paginated transaction history from the Hiro API,
 * normalized to a consistent format for display in the UI.
 *
 * @param {string} address - Stacks wallet address to query
 * @param {Object} [options={}] - Pagination and filtering options
 * @param {number} [options.limit=20] - Number of transactions to fetch (1-50)
 * @param {number} [options.offset=0] - Number of transactions to skip
 * @returns {Promise<Object>} Paginated transaction list
 * @property {Array} transactions - Array of normalized transaction objects
 * @property {number} total - Total number of transactions for this address
 * @property {boolean} hasMore - Whether more transactions are available
 * @throws {Error} If the API request fails
 * @example
 * const { transactions, hasMore } = await getAccountTransactions('SP...', { limit: 10 });
 */
export async function getAccountTransactions(address, options = {}) {
  if (!address || typeof address !== 'string') {
    throw new Error('A valid address is required');
  }
  const { limit = 20, offset = 0 } = options;
  const safeLimit = Math.max(1, Math.min(50, safeParseInt(limit, 20)));
  const safeOffset = Math.max(0, safeParseInt(offset, 0));
  const data = await fetchAPI(
    `/extended/v1/address/${address.trim()}/transactions?limit=${safeLimit}&offset=${safeOffset}`
  );

  return {
    transactions: (data.results || []).map(normalizeTransaction),
    total: safeParseInt(data.total),
    hasMore: safeOffset + safeLimit < safeParseInt(data.total),
  };
}

/**
 * getTransaction - Fetch details for a specific transaction.
 *
 * Retrieves full transaction details from the Hiro API by transaction ID,
 * normalized to the standard transaction format used throughout the app.
 *
 * @param {string} txId - Transaction ID (hex string, with or without 0x prefix)
 * @returns {Promise<Object>} Normalized transaction details
 * @throws {Error} If the transaction is not found or API request fails
 * @example
 * const tx = await getTransaction('0x1234...abcd');
 * console.log(`Transaction status: ${tx.status}`);
 */
export async function getTransaction(txId) {
  if (!txId || typeof txId !== 'string') {
    throw new Error('A valid transaction ID is required');
  }
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
    nonce: safeParseInt(tx.nonce),
    blockHeight: safeParseInt(tx.block_height),
    blockTime: safeParseInt(tx.block_time) * 1000,
    contractCall: tx.contract_call ? {
      contractId: tx.contract_call.contract_id,
      functionName: tx.contract_call.function_name,
      functionArgs: tx.contract_call.function_args,
    } : null,
  };
}

/**
 * callReadOnly - Execute read-only Clarity function calls.
 *
 * Provides a standardized interface for calling read-only functions
 * on TimeFi smart contracts via the Stacks blockchain.
 *
 * @param {string} contractName - Name of the contract to call
 * @param {string} functionName - Name of the read-only function to execute
 * @param {Array} [functionArgs=[]] - Arguments to pass to the function
 * @param {string} [senderAddress] - Address to simulate the call from
 * @returns {Promise<Object>} Parsed result from the Clarity function
 * @throws {Error} On network errors or invalid contract calls
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
 * getVaultDetails - Fetch detailed information for a specific vault.
 *
 * Retrieves vault data from the TimeFi smart contract via read-only
 * function call, including owner, amount, unlock height, and status.
 *
 * @param {number} vaultId - Unique vault identifier
 * @returns {Promise<Object|null>} Vault details or null if not found
 * @property {number} id - Vault ID
 * @property {string} owner - Vault owner's Stacks address
 * @property {number} amount - Deposited amount in microSTX
 * @property {number} unlockHeight - Block height when vault unlocks
 * @property {boolean} withdrawn - Whether the vault has been withdrawn
 * @property {boolean} emergencyUnlocked - Whether emergency unlock was triggered
 * @throws {Error} On contract call errors
 * @example
 * const vault = await getVaultDetails(1);
 * if (vault) console.log(`Owner: ${vault.owner}`);
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
    amount: safeParseInt(vault.amount.value),
    unlockHeight: safeParseInt(vault['unlock-height'].value),
    withdrawn: vault.withdrawn.value,
    emergencyUnlocked: vault['emergency-unlocked']?.value || false,
  };
}

/**
 * getUserVaults - Fetch all vault IDs owned by an address.
 *
 * Queries the TimeFi smart contract to retrieve a list of vault IDs
 * associated with a specific wallet address.
 *
 * @param {string} address - Stacks wallet address to query
 * @returns {Promise<Array<number>>} Array of vault IDs owned by the address
 * @throws {Error} On contract call errors
 * @example
 * const vaultIds = await getUserVaults('SP...');
 * console.log(`User has ${vaultIds.length} vaults`);
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

  return result.value.map(v => safeParseInt(v.value));
}

/**
 * getVaultCount - Fetch the total number of vaults created.
 *
 * Queries the TimeFi smart contract to retrieve the total count
 * of vaults that have been created on the protocol.
 *
 * @returns {Promise<number>} Total number of vaults created
 * @throws {Error} On contract call errors
 * @example
 * const count = await getVaultCount();
 * console.log(`Total vaults: ${count}`);
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
 * getPendingRewards - Fetch pending reward amount for a vault.
 *
 * Queries the rewards contract to retrieve the amount of rewards
 * that have accumulated and are available for claiming.
 *
 * @param {number} vaultId - Vault identifier to check rewards for
 * @returns {Promise<number>} Pending rewards amount in microSTX
 * @throws {Error} On contract call errors
 * @example
 * const rewards = await getPendingRewards(1);
 * console.log(`Pending rewards: ${rewards} microSTX`);
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
