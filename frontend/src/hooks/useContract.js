import { useCallback, useState } from 'react';
import { principalCV } from 'timefi-sdk';
import { useWallet } from '../context/WalletContext';
import { createVault as createVaultTx, withdraw as withdrawTx, emergencyWithdraw as emergencyWithdrawTx, claimRewards as claimRewardsTx } from '../services/transactions';

/**
 * Custom hook for interacting with TimeFi vault contract (Transactions)
 */
export function useContract() {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  const getErrorMessage = useCallback((error) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return String(error || 'Unexpected transaction error');
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
  const approveBot = useCallback(async (botAddress) => {
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
