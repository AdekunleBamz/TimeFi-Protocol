import { useCallback, useState } from 'react';
import { principalCV } from 'timefi-sdk';
import { useWallet } from '../context/WalletContext';
import { createVault as createVaultTx, withdraw as withdrawTx, emergencyWithdraw as emergencyWithdrawTx, claimRewards as claimRewardsTx } from '../services/transactions';

/**
 * useContract - Hook for interacting with TimeFi vault smart contracts.
 *
 * Provides methods for creating vaults, withdrawing funds, and managing
 * bot approvals. Handles wallet connection checks and transaction state.
 *
 * @returns {{ createVault: Function, withdraw: Function, emergencyWithdraw: Function, claimRewards: Function, approveBot: Function, loading: boolean, error: string|null }} Contract interaction methods and state
 * @returns {Function} returns.createVault - Create a new time-locked vault
 * @returns {Function} returns.withdraw - Withdraw from an unlocked vault
 * @returns {Function} returns.emergencyWithdraw - Emergency withdrawal
 * @returns {Function} returns.claimRewards - Claim pending rewards
 * @returns {Function} returns.approveBot - Generate bot approval transaction
 * @returns {boolean} returns.loading - Whether a transaction is in progress
 * @returns {string|null} returns.error - Last error message if any
 * @example
 * const { createVault, withdraw, loading, error } = useContract();
 * await createVault(100, 3600, { onFinish: (txId) => console.log(txId) });
 */
export function useContract() {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  const getErrorMessage = useCallback((error) => {
    // Log the error for internal debugging
    console.error('[Contract Error]:', error);

    if (error instanceof Error) {
      // Handle Stacks-specific error patterns if present in the message
      if (error.message.includes('User denied transaction')) {
        return 'Transaction was cancelled in your wallet';
      }
      return error.message;
    }

    return String(error || 'An unexpected error occurred during the transaction');
  }, []);

  const ensureConnected = useCallback(() => {
    if (!address) {
      throw new Error('Connect your wallet to continue');
    }
  }, [address]);

  const wrapTxCallbacks = useCallback((callbacks = {}) => {
    const { onFinish, onCancel } = callbacks;

    return {
      onFinish: (data) => {
        setLoading(false);
        setLastError(null);
        onFinish?.(data);
      },
      onCancel: () => {
        setLoading(false);
        onCancel?.();
      },
    };
  }, []);

  /**
   * Create a new time-locked vault
   */
  const createVault = useCallback(async (amountSTX, lockDurationBlocks, callbacks = {}) => {
    ensureConnected();

    const numericAmount = Number(amountSTX);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('amountSTX must be a positive number');
    }
    if (!Number.isInteger(lockDurationBlocks) || lockDurationBlocks <= 0) {
      throw new Error('lockDurationBlocks must be a positive integer');
    }

    setLoading(true);
    setLastError(null);

    try {
      const amount = Math.floor(numericAmount * 1_000_000);
      await createVaultTx({
        amount,
        lockDuration: lockDurationBlocks,
        senderAddress: address,
        ...wrapTxCallbacks(callbacks),
      });
    } catch (error) {
      setLoading(false);
      setLastError(getErrorMessage(error));
      throw error;
    }
  }, [ensureConnected, getErrorMessage, wrapTxCallbacks]);

  /**
   * Withdraw from a vault after lock period
   */
  const withdraw = useCallback(async (vaultId, callbacks = {}) => {
    ensureConnected();
    setLoading(true);
    setLastError(null);

    try {
      await withdrawTx({
        vaultId,
        ...wrapTxCallbacks(callbacks),
      });
    } catch (error) {
      setLoading(false);
      setLastError(getErrorMessage(error));
      throw error;
    }
  }, [ensureConnected, getErrorMessage, wrapTxCallbacks]);

  const emergencyWithdraw = useCallback(async (vaultId, callbacks = {}) => {
    ensureConnected();
    setLoading(true);
    setLastError(null);

    try {
      await emergencyWithdrawTx({
        vaultId,
        ...wrapTxCallbacks(callbacks),
      });
    } catch (error) {
      setLoading(false);
      setLastError(getErrorMessage(error));
      throw error;
    }
  }, [ensureConnected, getErrorMessage, wrapTxCallbacks]);

  const claimRewards = useCallback(async (vaultId, callbacks = {}) => {
    ensureConnected();
    setLoading(true);
    setLastError(null);

    try {
      await claimRewardsTx({
        vaultId,
        ...wrapTxCallbacks(callbacks),
      });
    } catch (error) {
      setLoading(false);
      setLastError(getErrorMessage(error));
      throw error;
    }
  }, [ensureConnected, getErrorMessage, wrapTxCallbacks]);

  /**
   * Approve a bot to manage vault
   */
  const approveBot = useCallback((botAddress) => {
    return {
      functionName: 'approve-bot',
      functionArgs: [principalCV(botAddress)],
    };
  }, []);

  return {
    createVault,
    withdraw,
    emergencyWithdraw,
    claimRewards,
    approveBot,
    loading,
    error: lastError,
  };
}

export default useContract;
