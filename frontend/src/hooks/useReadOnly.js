import { useState, useCallback } from 'react';
import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
const VAULT_CONTRACT = 'timefi-vault-v-A2';
const REWARDS_CONTRACT = 'timefi-rewards-v-A2';
const GOVERNANCE_CONTRACT = 'timefi-governance-v-A2';
const EMERGENCY_CONTRACT = 'timefi-emergency-v-A2';

const network = new StacksMainnet();

/**
 * Custom hook for read-only contract queries - v-A2
 */
export function useReadOnly() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callReadOnly = useCallback(async (contractName, functionName, functionArgs = []) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName,
        functionName,
        functionArgs,
        network,
        senderAddress: CONTRACT_ADDRESS,
      });
      
      return cvToJSON(result);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== VAULT READ FUNCTIONS ====================

  const getVault = useCallback(async (vaultId) => {
    return callReadOnly(VAULT_CONTRACT, 'get-vault', [uintCV(vaultId)]);
  }, [callReadOnly]);

  const getTVL = useCallback(async () => {
    return callReadOnly(VAULT_CONTRACT, 'get-tvl', []);
  }, [callReadOnly]);

  const getTotalFees = useCallback(async () => {
    return callReadOnly(VAULT_CONTRACT, 'get-total-fees', []);
  }, [callReadOnly]);

  const getVaultCount = useCallback(async () => {
    return callReadOnly(VAULT_CONTRACT, 'get-vault-count', []);
  }, [callReadOnly]);

  const getTimeRemaining = useCallback(async (vaultId) => {
    return callReadOnly(VAULT_CONTRACT, 'get-time-remaining', [uintCV(vaultId)]);
  }, [callReadOnly]);

  const canWithdraw = useCallback(async (vaultId) => {
    return callReadOnly(VAULT_CONTRACT, 'can-withdraw', [uintCV(vaultId)]);
  }, [callReadOnly]);

  const isPaused = useCallback(async () => {
    return callReadOnly(VAULT_CONTRACT, 'is-paused', []);
  }, [callReadOnly]);

  // ==================== REWARDS READ FUNCTIONS ====================

  const calculateRewards = useCallback(async (vaultId) => {
    return callReadOnly(REWARDS_CONTRACT, 'calculate-rewards', [uintCV(vaultId)]);
  }, [callReadOnly]);

  const getRewardsPool = useCallback(async () => {
    return callReadOnly(REWARDS_CONTRACT, 'get-rewards-pool', []);
  }, [callReadOnly]);

  const hasClaimed = useCallback(async (vaultId) => {
    return callReadOnly(REWARDS_CONTRACT, 'has-claimed', [uintCV(vaultId)]);
  }, [callReadOnly]);

  // ==================== GOVERNANCE READ FUNCTIONS ====================

  const getProposal = useCallback(async (proposalId) => {
    return callReadOnly(GOVERNANCE_CONTRACT, 'get-proposal', [uintCV(proposalId)]);
  }, [callReadOnly]);

  const getProposalCount = useCallback(async () => {
    return callReadOnly(GOVERNANCE_CONTRACT, 'get-proposal-count', []);
  }, [callReadOnly]);

  const calculateVotingPower = useCallback(async (vaultId) => {
    return callReadOnly(GOVERNANCE_CONTRACT, 'calculate-voting-power', [uintCV(vaultId)]);
  }, [callReadOnly]);

  const hasVoted = useCallback(async (proposalId, voter) => {
    return callReadOnly(GOVERNANCE_CONTRACT, 'has-voted', [uintCV(proposalId), principalCV(voter)]);
  }, [callReadOnly]);

  // ==================== EMERGENCY READ FUNCTIONS ====================

  const isEmergencyMode = useCallback(async () => {
    return callReadOnly(EMERGENCY_CONTRACT, 'is-emergency-mode', []);
  }, [callReadOnly]);

  const calculateEmergencyPayout = useCallback(async (vaultId) => {
    return callReadOnly(EMERGENCY_CONTRACT, 'calculate-emergency-payout', [uintCV(vaultId)]);
  }, [callReadOnly]);

  return {
    loading,
    error,
    // Vault
    getVault,
    getTVL,
    getTotalFees,
    getVaultCount,
    getTimeRemaining,
    canWithdraw,
    isPaused,
    // Rewards
    calculateRewards,
    getRewardsPool,
    hasClaimed,
    // Governance
    getProposal,
    getProposalCount,
    calculateVotingPower,
    hasVoted,
    // Emergency
    isEmergencyMode,
    calculateEmergencyPayout,
  };
}

export default useReadOnly;
