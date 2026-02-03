import {
  callReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV,
  uintCV,
} from '@stacks/transactions';
import { STACKS_NETWORK, CONTRACT_ADDRESS, CONTRACT_NAMES } from '../utils/constants';

/**
 * Base API configuration
 */
const HIRO_API_URL = 'https://api.mainnet.hiro.so';

/**
 * Fetch wrapper with error handling
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

  return response.json();
}

/**
 * Get current block height
 * @returns {Promise<number>} Current block height
 */
export async function getBlockHeight() {
  const data = await fetchAPI('/extended/v1/block?limit=1');
  return data.results[0]?.height || 0;
}

/**
 * Get account STX balance
 * @param {string} address - Stacks address
 * @returns {Promise<Object>} Account balance info
 */
export async function getAccountBalance(address) {
  const data = await fetchAPI(`/extended/v1/address/${address}/stx`);
  return {
    balance: parseInt(data.balance, 10),
    locked: parseInt(data.locked, 10),
    totalSent: parseInt(data.total_sent, 10),
    totalReceived: parseInt(data.total_received, 10),
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
  const data = await fetchAPI(
    `/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`
  );
  
  return {
    transactions: data.results.map(normalizeTransaction),
    total: data.total,
    hasMore: offset + limit < data.total,
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
 * Normalize transaction data
 */
function normalizeTransaction(tx) {
  return {
    txId: tx.tx_id,
    type: tx.tx_type,
    status: tx.tx_status,
    sender: tx.sender_address,
    fee: parseInt(tx.fee_rate, 10),
    nonce: tx.nonce,
    blockHeight: tx.block_height,
    blockTime: tx.block_time * 1000,
    contractCall: tx.contract_call ? {
      contractId: tx.contract_call.contract_id,
      functionName: tx.contract_call.function_name,
      functionArgs: tx.contract_call.function_args,
    } : null,
  };
}

/**
 * Call a read-only contract function
 * @param {string} contractName - Contract name
 * @param {string} functionName - Function name
 * @param {Array} functionArgs - Function arguments as Clarity Values
 * @param {string} senderAddress - Sender address for simulation
 * @returns {Promise<any>} Function result
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
  
  return parseInt(result.value, 10);
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
  
  return parseInt(result.value, 10);
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
