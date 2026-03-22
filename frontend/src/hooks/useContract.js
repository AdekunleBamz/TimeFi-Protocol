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
    if (!address) {
      throw new Error('Connect your wallet to continue');
    }

    setLoading(true);
    setLastError(null);

    try {
      const amount = Math.floor(Number(amountSTX) * 1_000_000);
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
  }, [address, getErrorMessage, wrapTxCallbacks]);

  /**
   * Withdraw from a vault after lock period
   */
  const withdraw = useCallback(async (vaultId, callbacks = {}) => {
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
  }, [getErrorMessage, wrapTxCallbacks]);

  const emergencyWithdraw = useCallback(async (vaultId, callbacks = {}) => {
    setLoading(true);
    setLastError(null);

    try {
      await emergencyWithdrawTx({
        vaultId,
        ...wrapTxCallbacks(callbacks),
      });
    } catch (error) {
      setLoading(false);
      setLastError(error.message);
      throw error;
    }
  }, [wrapTxCallbacks]);

  const claimRewards = useCallback(async (vaultId, callbacks = {}) => {
    setLoading(true);
    setLastError(null);

    try {
      await claimRewardsTx({
        vaultId,
        ...wrapTxCallbacks(callbacks),
      });
    } catch (error) {
      setLoading(false);
      setLastError(error.message);
      throw error;
    }
  }, [wrapTxCallbacks]);

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
