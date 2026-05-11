import { useCallback } from 'react';
import {
  makeContractCall,
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  bufferCV,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const CONTRACT_ADDRESS = 'SP000000000000000000002Q6VF78'; // Replace with deployed address
const CONTRACT_NAME = 'timefi-vault';

const network = import.meta.env.VITE_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

/**
 * useContract - Hook for building TimeFi vault contract call options.
 *
 * Provides typed builder functions for every write contract entry point.
 * Each function returns a `txOptions` object ready to pass to the
 * Stacks Connect `openContractCall` or `openContractDeploy` API — no
 * transaction is broadcast directly from the hook.
 *
 * @returns {{ createVault: Function, withdraw: Function, approveBot: Function, revokeBot: Function, emergencyWithdraw: Function, claimRewards: Function }}
 */
export function useContract() {
  /**
   * createVault - Build tx options for creating a new time-locked vault.
   * @param {number} amount - Deposit amount in micro-STX
   * @param {number} lockDuration - Lock duration in blocks
   * @returns {Promise<Object>} Contract call options object
   */
  const createVault = useCallback(async (amount, lockDuration) => {
    if (!Number.isFinite(Number(amount)) || !Number.isFinite(Number(lockDuration))) {
      throw new Error('createVault: amount and lockDuration must be valid numbers');
    }
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-vault',
      functionArgs: [uintCV(amount), uintCV(lockDuration)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };
    
    return txOptions;
  }, []);

  /**
   * withdraw - Build tx options to withdraw from a vault after its lock period.
   * @param {number} vaultId - The vault ID to withdraw from
   * @returns {Promise<Object>} Contract call options object
   * @throws {Error} if vaultId is not a valid non-negative number
   */
  const withdraw = useCallback(async (vaultId) => {
    if (!Number.isFinite(Number(vaultId)) || Number(vaultId) < 0) {
      throw new Error('withdraw: vaultId must be a valid non-negative number');
    }
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'withdraw',
      functionArgs: [uintCV(vaultId)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };
    
    return txOptions;
  }, []);

  /**
   * approveBot - Build tx options to approve an automation bot for a vault.
   * @param {number} vaultId - The vault ID
   * @param {string} botAddress - Bot principal address (Stacks)
   * @returns {Promise<Object>} Contract call options object
   */
  const approveBot = useCallback(async (vaultId, botAddress) => {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'approve-bot',
      functionArgs: [uintCV(vaultId), principalCV(botAddress)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };
    
    return txOptions;
  }, []);

  /**
   * revokeBot - Build tx options to revoke a previously approved bot.
   * @param {number} vaultId - The vault ID whose bot approval should be removed
   * @returns {Promise<Object>} Contract call options object
   */
  const revokeBot = useCallback(async (vaultId) => {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'revoke-bot',
      functionArgs: [uintCV(vaultId)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };
    
    return txOptions;
  }, []);

  return {
    createVault,
    withdraw,
    approveBot,
    revokeBot,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    network,
  };
}

export default useContract;
