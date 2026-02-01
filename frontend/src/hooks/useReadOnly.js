import { useState, useCallback } from 'react';
import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const CONTRACT_ADDRESS = 'SP000000000000000000002Q6VF78'; // Replace with deployed address
const CONTRACT_NAME = 'timefi-vault';

const network = import.meta.env.VITE_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

/**
 * Custom hook for read-only contract queries
 */
export function useReadOnly() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute a read-only function call
   */
  const callReadOnly = useCallback(async (functionName, functionArgs = [], senderAddress) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        network,
        senderAddress: senderAddress || CONTRACT_ADDRESS,
      });
      
      return cvToJSON(result);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get vault details by ID
   */
  const getVault = useCallback(async (vaultId) => {
    return callReadOnly('get-vault', [uintCV(vaultId)]);
  }, [callReadOnly]);

  /**
   * Get total value locked in the protocol
   */
  const getTVL = useCallback(async () => {
    return callReadOnly('get-tvl', []);
  }, [callReadOnly]);

  /**
   * Get total fees collected
   */
  const getTotalFees = useCallback(async () => {
    return callReadOnly('get-total-fees', []);
  }, [callReadOnly]);

  /**
   * Get total vault count
   */
  const getVaultCount = useCallback(async () => {
    return callReadOnly('get-vault-count', []);
  }, [callReadOnly]);

  /**
   * Get time remaining for a vault
   */
  const getTimeRemaining = useCallback(async (vaultId) => {
    return callReadOnly('get-time-remaining', [uintCV(vaultId)]);
  }, [callReadOnly]);

  /**
   * Check if vault can be withdrawn
   */
  const canWithdraw = useCallback(async (vaultId) => {
    return callReadOnly('can-withdraw', [uintCV(vaultId)]);
  }, [callReadOnly]);

  /**
   * Check if address is vault owner
   */
  const isVaultOwner = useCallback(async (vaultId, owner) => {
    return callReadOnly('is-vault-owner', [uintCV(vaultId), principalCV(owner)]);
  }, [callReadOnly]);

  /**
   * Check if address is approved bot
   */
  const isBot = useCallback(async (vaultId, bot) => {
    return callReadOnly('is-bot', [uintCV(vaultId), principalCV(bot)]);
  }, [callReadOnly]);

  /**
   * Calculate fee for an amount
   */
  const calculateFee = useCallback(async (amount) => {
    return callReadOnly('calculate-fee', [uintCV(amount)]);
  }, [callReadOnly]);

  return {
    loading,
    error,
    getVault,
    getTVL,
    getTotalFees,
    getVaultCount,
    getTimeRemaining,
    canWithdraw,
    isVaultOwner,
    isBot,
    calculateFee,
    callReadOnly,
  };
}

export default useReadOnly;
