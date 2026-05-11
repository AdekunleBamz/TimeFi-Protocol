import { useState, useCallback } from 'react';
import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const CONTRACT_ADDRESS = 'SP000000000000000000002Q6VF78'; // Replace with deployed address
const CONTRACT_NAME = 'timefi-vault';

const network = import.meta.env.VITE_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

/**
 * useReadOnly - Hook for invoking read-only TimeFi contract functions.
 *
 * Provides typed wrappers around callReadOnlyFunction for every public
 * read-only entry point exposed by the timefi-vault contract. All calls
 * are network-aware and return ClarityValue-parsed JSON.
 *
 * @returns {{ loading: boolean, error: string|null, getVault: Function, getTVL: Function, getTotalFees: Function, getVaultCount: Function, getTimeRemaining: Function, canWithdraw: Function, isVaultOwner: Function, isBot: Function, calculateFee: Function, callReadOnly: Function }}
 */
export function useReadOnly() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * callReadOnly - Execute an arbitrary read-only contract function.
   * @param {string} functionName - Clarity function name
   * @param {Array} [functionArgs=[]] - Encoded Clarity arguments
   * @param {string} [senderAddress] - Optional sender principal
   * @returns {Promise<Object>} Parsed Clarity value as JSON
   */
  const callReadOnly = useCallback(async (functionName, functionArgs = [], senderAddress) => {
    if (!functionName || typeof functionName !== 'string') {
      throw new Error('callReadOnly: functionName must be a non-empty string');
    }
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
   * getVault - Fetch vault data by its on-chain ID.
   * @param {number} vaultId - Vault identifier
   * @returns {Promise<Object>} Vault data
   */
  const getVault = useCallback(async (vaultId) => {
    return callReadOnly('get-vault', [uintCV(vaultId)]);
  }, [callReadOnly]);

  /**
   * getTVL - Fetch the total value locked across all vaults.
   * @returns {Promise<Object>} TVL value in micro-STX
   */
  const getTVL = useCallback(async () => {
    return callReadOnly('get-tvl', []);
  }, [callReadOnly]);

  /**
   * getTotalFees - Fetch total protocol fees collected to date.
   * @returns {Promise<Object>} Accumulated fees in micro-STX
   */
  const getTotalFees = useCallback(async () => {
    return callReadOnly('get-total-fees', []);
  }, [callReadOnly]);

  /**
   * getVaultCount - Fetch the total number of vaults created.
   * @returns {Promise<Object>} Vault count as a Clarity uint
   */
  const getVaultCount = useCallback(async () => {
    return callReadOnly('get-vault-count', []);
  }, [callReadOnly]);

  /**
   * getTimeRemaining - Fetch the number of blocks remaining until vault unlock.
   * @param {number} vaultId - Vault identifier
   * @returns {Promise<Object>} Remaining block count
   */
  const getTimeRemaining = useCallback(async (vaultId) => {
    return callReadOnly('get-time-remaining', [uintCV(vaultId)]);
  }, [callReadOnly]);

  /**
   * canWithdraw - Check whether a vault is eligible for withdrawal.
   * @param {number} vaultId - Vault identifier
   * @returns {Promise<Object>} Boolean Clarity value
   */
  const canWithdraw = useCallback(async (vaultId) => {
    return callReadOnly('can-withdraw', [uintCV(vaultId)]);
  }, [callReadOnly]);

  /**
   * isVaultOwner - Check whether a principal is the owner of a vault.
   * @param {number} vaultId - Vault identifier
   * @param {string} owner - Stacks principal address
   * @returns {Promise<Object>} Boolean Clarity value
   */
  const isVaultOwner = useCallback(async (vaultId, owner) => {
    return callReadOnly('is-vault-owner', [uintCV(vaultId), principalCV(owner)]);
  }, [callReadOnly]);

  /**
   * isBot - Check whether a principal is an approved automation bot.
   * @param {number} vaultId - Vault identifier
   * @param {string} bot - Stacks principal address
   * @returns {Promise<Object>} Boolean Clarity value
   */
  const isBot = useCallback(async (vaultId, bot) => {
    return callReadOnly('is-bot', [uintCV(vaultId), principalCV(bot)]);
  }, [callReadOnly]);

  /**
   * calculateFee - Calculate the protocol fee for a given STX amount.
   * @param {number} amount - Amount in micro-STX
   * @returns {Promise<Object>} Fee amount in micro-STX
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
