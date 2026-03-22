import {
  uintCV,
  boolCV,
  PostConditionMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES } from '../config/contracts';

const STACKS_NETWORK = import.meta.env.VITE_NETWORK === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();

function logTxEvent(...args) {
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.log(...args);
  }
}

function assertVaultId(vaultId) {
  if (vaultId === undefined || vaultId === null) {
    throw new Error('vaultId is required');
  }
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
  const postConditions = [
    makeStandardSTXPostCondition(
      senderAddress,
      FungibleConditionCode.Equal,
      amount
    ),
  ];

  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.VAULT,
    functionName: 'create-vault',
    functionArgs: [
      uintCV(amount),
      uintCV(lockDuration),
    ],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      logTxEvent('Create vault transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      logTxEvent('Create vault cancelled');
      onCancel?.();
    },
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
  assertVaultId(vaultId);

  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.VAULT,
    functionName: 'request-withdraw',
    functionArgs: [uintCV(vaultId)],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      logTxEvent('Withdraw transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      logTxEvent('Withdraw cancelled');
      onCancel?.();
    },
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
  assertVaultId(vaultId);

  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.EMERGENCY,
    functionName: 'request-emergency-withdraw',
    functionArgs: [uintCV(vaultId)],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      logTxEvent('Emergency withdraw transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      logTxEvent('Emergency withdraw cancelled');
      onCancel?.();
    },
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
  assertVaultId(vaultId);

  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.REWARDS,
    functionName: 'request-claim-rewards',
    functionArgs: [uintCV(vaultId)],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      logTxEvent('Claim rewards transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      logTxEvent('Claim rewards cancelled');
      onCancel?.();
    },
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
  if (proposalId === undefined || proposalId === null) {
    throw new Error('proposalId is required to cast a governance vote');
  }

  if (vaultId === undefined || vaultId === null) {
    throw new Error('vaultId is required to cast a governance vote');
  }

  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.GOVERNANCE,
    functionName: 'cast-vote',
    functionArgs: [
      uintCV(proposalId),
      uintCV(vaultId),
      boolCV(Boolean(inFavor)),
    ],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      logTxEvent('Vote transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      logTxEvent('Vote cancelled');
      onCancel?.();
    },
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
  });
  
  return fees[functionName] ?? 3000;
}

export default {
  createVault,
  withdraw,
  emergencyWithdraw,
  claimRewards,
  vote,
  estimateFee,
};
