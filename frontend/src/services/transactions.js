import {
  uintCV,
  boolCV,
  principalCV,
  PostConditionMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES } from '../config/contracts';

/**
 * Transaction Service - Build and submit Stacks blockchain transactions.
 *
 * Provides functions for interacting with TimeFi smart contracts including
 * vault creation, withdrawals, rewards claiming, and governance voting.
 *
 * @module services/transactions
 * @author adekunlebamz
 */

// Determine network from environment variable
const NETWORK = String(import.meta.env.VITE_NETWORK || 'mainnet').trim().toLowerCase();

// Create appropriate Stacks network instance
const STACKS_NETWORK = NETWORK === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();

/**
 * logTxEvent - Debug logging for transaction events.
 * Only logs when VITE_ENABLE_DEBUG is set to 'true' in environment config.
 * No-op in production builds where the flag is not set.
 * @param {...any} args - Arguments to log
 */
function logTxEvent(...args) {
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.log(...args);
  }
}

/**
 * assertVaultId - Validate that vaultId is provided and is a positive integer.
 * Delegates to assertPositiveInteger with the field name 'vaultId'.
 * @param {number|undefined|null} vaultId - Vault ID to validate
 * @throws {Error} If vaultId is missing or not a positive integer
 */
function assertVaultId(vaultId) {
  return assertPositiveInteger(vaultId, 'vaultId');
}

/**
 * assertPositiveInteger - Validate numeric inputs for tx parameters.
 * @param {number|undefined|null} value - Value to validate
 * @param {string} fieldName - Parameter name for error messages
 * @throws {Error} If value is not a positive integer
 */
function assertPositiveInteger(value, fieldName) {
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || Number.isNaN(numericValue) || numericValue <= 0 || numericValue > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return numericValue;
}

/**
 * getContractCallDefaultOptions - Internal helper to get shared transaction options.
 * Returns an options object suitable for passing to openContractCall.
 * @param {string} contractName - Name of the target contract
 * @param {string} functionName - Name of the Clarity function
 * @param {any[]} functionArgs - Arguments for the function call
 * @param {Function} onFinish - Callback on finish
 * @param {Function} onCancel - Callback on cancel
 * @returns {Object} Options object for openContractCall
 * @private
 */
function getContractCallDefaultOptions(contractName, functionName, functionArgs, onFinish, onCancel) {
  return {
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName,
    functionName,
    functionArgs,
    onFinish: (data) => {
      logTxEvent(`${functionName} transaction:`, data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      logTxEvent(`${functionName} cancelled`);
      onCancel?.();
    },
  };
}

/**
 * Build and submit a create-vault transaction
 * @param {Object} params - Transaction parameters
 * @param {number} params.amount - Amount to lock in microSTX
 * @param {number} params.lockDuration - Lock duration in blocks
 * @param {string} params.senderAddress - Sender's address
 * @param {Function} params.onFinish - Callback on transaction completion
 * @param {Function} params.onCancel - Callback on user cancel
 */
export async function createVault({ amount, lockDuration, senderAddress, onFinish, onCancel }) {
  const normalizedAmount = assertPositiveInteger(amount, 'amount');
  const normalizedLockDuration = assertPositiveInteger(lockDuration, 'lockDuration');
  if (!senderAddress || typeof senderAddress !== 'string' || !senderAddress.trim()) {
    throw new Error('senderAddress is required');
  }
  const normalizedSenderAddress = senderAddress.trim();

  const postConditions = [
    makeStandardSTXPostCondition(
      normalizedSenderAddress,
      FungibleConditionCode.Equal,
      normalizedAmount
    ),
  ];

  await openContractCall({
    ...getContractCallDefaultOptions(CONTRACT_NAMES.VAULT, 'create-vault', [uintCV(normalizedAmount), uintCV(normalizedLockDuration)], onFinish, onCancel),
    postConditions,
    postConditionMode: PostConditionMode.Deny,
  });
}

/**
 * Build and submit a withdraw transaction
 * @param {Object} params - Transaction parameters
 * @param {number} params.vaultId - Vault ID to withdraw from
 * @param {Function} params.onFinish - Callback on transaction completion
 * @param {Function} params.onCancel - Callback on user cancel
 */
export async function withdraw({ vaultId, onFinish, onCancel }) {
  const normalizedVaultId = assertVaultId(vaultId);

  await openContractCall({
    ...getContractCallDefaultOptions(CONTRACT_NAMES.VAULT, 'request-withdraw', [uintCV(normalizedVaultId)], onFinish, onCancel),
    postConditionMode: PostConditionMode.Allow,
  });
}

/**
 * Build and submit an emergency withdraw transaction
 * @param {Object} params - Transaction parameters
 * @param {number} params.vaultId - Vault ID to emergency withdraw from
 * @param {Function} params.onFinish - Callback on transaction completion
 * @param {Function} params.onCancel - Callback on user cancel
 */
export async function emergencyWithdraw({ vaultId, onFinish, onCancel }) {
  const normalizedVaultId = assertVaultId(vaultId);

  await openContractCall({
    ...getContractCallDefaultOptions(CONTRACT_NAMES.EMERGENCY, 'request-emergency-withdraw', [uintCV(normalizedVaultId)], onFinish, onCancel),
    postConditionMode: PostConditionMode.Allow,
  });
}

/**
 * Build and submit a claim rewards transaction
 * @param {Object} params - Transaction parameters
 * @param {number} params.vaultId - Vault ID to claim rewards for
 * @param {Function} params.onFinish - Callback on transaction completion
 * @param {Function} params.onCancel - Callback on user cancel
 */
export async function claimRewards({ vaultId, onFinish, onCancel }) {
  const normalizedVaultId = assertVaultId(vaultId);

  await openContractCall({
    ...getContractCallDefaultOptions(CONTRACT_NAMES.REWARDS, 'request-claim-rewards', [uintCV(normalizedVaultId)], onFinish, onCancel),
    postConditionMode: PostConditionMode.Allow,
  });
}

/**
 * Build and submit a vote transaction
 * @param {Object} params - Transaction parameters
 * @param {number} params.proposalId - Proposal ID to vote on
 * @param {number} params.vaultId - Vault ID used as voting power
 * @param {boolean} params.inFavor - Vote in favor or against
 * @param {Function} params.onFinish - Callback on transaction completion
 * @param {Function} params.onCancel - Callback on user cancel
 */
export async function vote({ proposalId, vaultId, inFavor, onFinish, onCancel }) {
  const normalizedProposalId = assertPositiveInteger(proposalId, 'proposalId');
  const normalizedVaultId = assertPositiveInteger(vaultId, 'vaultId');

  await openContractCall({
    ...getContractCallDefaultOptions(CONTRACT_NAMES.GOVERNANCE, 'cast-vote', [uintCV(normalizedProposalId), uintCV(normalizedVaultId), boolCV(Boolean(inFavor))], onFinish, onCancel),
    postConditionMode: PostConditionMode.Deny,
  });
}

/**
 * Build and submit an approve-bot transaction
 * @param {Object} params - Transaction parameters
 * @param {string} params.botAddress - Principal address to approve
 * @param {Function} params.onFinish - Callback on transaction completion
 * @param {Function} params.onCancel - Callback on user cancel
 */
export async function approveBot({ botAddress, onFinish, onCancel }) {
  if (!botAddress || typeof botAddress !== 'string' || !botAddress.trim()) throw new Error('botAddress is required');
  const normalizedBotAddress = botAddress.trim();
  await openContractCall({
    ...getContractCallDefaultOptions(CONTRACT_NAMES.VAULT, 'approve-bot', [principalCV(normalizedBotAddress)], onFinish, onCancel),
    postConditionMode: PostConditionMode.Deny,
  });
}

/**
 * Build and submit a revoke-bot transaction
 * @param {Object} params - Transaction parameters
 * @param {string} params.botAddress - Principal address to revoke
 * @param {Function} params.onFinish - Callback on transaction completion
 * @param {Function} params.onCancel - Callback on user cancel
 */
export async function revokeBot({ botAddress, onFinish, onCancel }) {
  if (!botAddress || typeof botAddress !== 'string' || !botAddress.trim()) throw new Error('botAddress is required');
  const normalizedBotAddress = botAddress.trim();
  await openContractCall({
    ...getContractCallDefaultOptions(CONTRACT_NAMES.VAULT, 'revoke-bot', [principalCV(normalizedBotAddress)], onFinish, onCancel),
    postConditionMode: PostConditionMode.Deny,
  });
}

/**
 * Estimate transaction fee
 * @param {string} functionName - Contract function name
 * @returns {number} Estimated fee in microSTX
 */
export function estimateFee(functionName) {
  // Base fees for different operations (in microSTX)
  const fees = Object.freeze({
    'create-vault': 5000,
    'request-withdraw': 3000,
    'request-emergency-withdraw': 4000,
    'request-claim-rewards': 3000,
    'cast-vote': 2000,
    'approve-bot': 2000,
    'revoke-bot': 2000,
  });

  return fees[functionName] ?? 3000;
}

/**
 * Transaction Service - Build and submit Stacks blockchain transactions.
 */
export default {
  createVault,
  withdraw,
  emergencyWithdraw,
  claimRewards,
  vote,
  approveBot,
  revokeBot,
  estimateFee,
};
