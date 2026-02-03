import {
  makeContractCall,
  uintCV,
  PostConditionMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { STACKS_NETWORK, CONTRACT_ADDRESS, CONTRACT_NAMES } from '../utils/constants';

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
      console.log('Create vault transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      console.log('Create vault cancelled');
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
  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.VAULT,
    functionName: 'withdraw',
    functionArgs: [uintCV(vaultId)],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      console.log('Withdraw transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      console.log('Withdraw cancelled');
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
  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.EMERGENCY,
    functionName: 'emergency-withdraw',
    functionArgs: [uintCV(vaultId)],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      console.log('Emergency withdraw transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      console.log('Emergency withdraw cancelled');
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
  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.REWARDS,
    functionName: 'claim-rewards',
    functionArgs: [uintCV(vaultId)],
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      console.log('Claim rewards transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      console.log('Claim rewards cancelled');
      onCancel?.();
    },
  });
}

/**
 * Build and submit a vote transaction
 * @param {Object} params - Transaction parameters
 * @param {number} params.proposalId - Proposal ID to vote on
 * @param {boolean} params.inFavor - Vote in favor or against
 * @param {Function} params.onFinish - Callback on transaction completion
 * @param {Function} params.onCancel - Callback on user cancel
 */
export async function vote({ proposalId, inFavor, onFinish, onCancel }) {
  await openContractCall({
    network: STACKS_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.GOVERNANCE,
    functionName: 'vote',
    functionArgs: [
      uintCV(proposalId),
      inFavor ? uintCV(1) : uintCV(0),
    ],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Vote transaction:', data.txId);
      onFinish?.(data);
    },
    onCancel: () => {
      console.log('Vote cancelled');
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
  const fees = {
    'create-vault': 5000,
    'withdraw': 3000,
    'emergency-withdraw': 4000,
    'claim-rewards': 3000,
    'vote': 2000,
  };
  
  return fees[functionName] || 3000;
}

export default {
  createVault,
  withdraw,
  emergencyWithdraw,
  claimRewards,
  vote,
  estimateFee,
};
