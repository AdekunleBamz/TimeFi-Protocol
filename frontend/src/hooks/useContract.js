import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  stringAsciiCV,
  bufferCV,
  boolCV,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
const VAULT_CONTRACT = 'timefi-vault-v-A2';
const REWARDS_CONTRACT = 'timefi-rewards-v-A2';
const GOVERNANCE_CONTRACT = 'timefi-governance-v-A2';
const EMERGENCY_CONTRACT = 'timefi-emergency-v-A2';

const network = new StacksMainnet();

/**
 * Custom hook for interacting with TimeFi v-A2 contracts
 */
export function useContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txId, setTxId] = useState(null);

  const executeContractCall = useCallback(async (options, stxAddress, stxAmount) => {
    setLoading(true);
    setError(null);
    
    const postConditions = stxAmount && stxAddress ? [
      makeStandardSTXPostCondition(
        stxAddress,
        FungibleConditionCode.LessEqual,
        stxAmount
      ),
    ] : [];

    try {
      await openContractCall({
        ...options,
        network,
        postConditions,
        onFinish: (data) => {
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // ==================== VAULT FUNCTIONS ====================

  const createVault = useCallback((amount, lockBlocks, stxAddress) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: VAULT_CONTRACT,
      functionName: 'create-vault',
      functionArgs: [uintCV(amount), uintCV(lockBlocks)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    }, stxAddress, amount);
  }, [executeContractCall]);

  const requestWithdraw = useCallback((vaultId) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: VAULT_CONTRACT,
      functionName: 'request-withdraw',
      functionArgs: [uintCV(vaultId)],
      postConditionMode: PostConditionMode.Allow,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  const topUpVault = useCallback((vaultId, amount, stxAddress) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: VAULT_CONTRACT,
      functionName: 'top-up-vault',
      functionArgs: [uintCV(vaultId), uintCV(amount)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    }, stxAddress, amount);
  }, [executeContractCall]);

  const extendLock = useCallback((vaultId, additionalBlocks) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: VAULT_CONTRACT,
      functionName: 'extend-lock',
      functionArgs: [uintCV(vaultId), uintCV(additionalBlocks)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  const setBeneficiary = useCallback((vaultId, beneficiary) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: VAULT_CONTRACT,
      functionName: 'set-beneficiary',
      functionArgs: [uintCV(vaultId), principalCV(beneficiary)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  const initiateTransfer = useCallback((vaultId, newOwner) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: VAULT_CONTRACT,
      functionName: 'initiate-transfer',
      functionArgs: [uintCV(vaultId), principalCV(newOwner)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  const acceptTransfer = useCallback((vaultId) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: VAULT_CONTRACT,
      functionName: 'accept-transfer',
      functionArgs: [uintCV(vaultId)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  // ==================== REWARDS FUNCTIONS ====================

  const requestClaimRewards = useCallback((vaultId) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: REWARDS_CONTRACT,
      functionName: 'request-claim-rewards',
      functionArgs: [uintCV(vaultId)],
      postConditionMode: PostConditionMode.Allow,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  // ==================== GOVERNANCE FUNCTIONS ====================

  const createProposal = useCallback((vaultId, title, description, proposalType, actionData) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: GOVERNANCE_CONTRACT,
      functionName: 'create-proposal',
      functionArgs: [
        uintCV(vaultId),
        stringAsciiCV(title),
        stringAsciiCV(description),
        uintCV(proposalType),
        bufferCV(actionData || new Uint8Array()),
      ],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  const castVote = useCallback((proposalId, vaultId, support) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: GOVERNANCE_CONTRACT,
      functionName: 'cast-vote',
      functionArgs: [uintCV(proposalId), uintCV(vaultId), boolCV(support)],
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  // ==================== EMERGENCY FUNCTIONS ====================

  const requestEmergencyWithdraw = useCallback((vaultId) => {
    return executeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: EMERGENCY_CONTRACT,
      functionName: 'request-emergency-withdraw',
      functionArgs: [uintCV(vaultId)],
      postConditionMode: PostConditionMode.Allow,
      anchorMode: AnchorMode.Any,
    });
  }, [executeContractCall]);

  return {
    loading,
    error,
    txId,
    // Vault
    createVault,
    requestWithdraw,
    topUpVault,
    extendLock,
    setBeneficiary,
    initiateTransfer,
    acceptTransfer,
    // Rewards
    requestClaimRewards,
    // Governance
    createProposal,
    castVote,
    // Emergency
    requestEmergencyWithdraw,
  };
}

export default useContract;
