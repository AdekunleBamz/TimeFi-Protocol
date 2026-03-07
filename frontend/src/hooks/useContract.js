import { useCallback } from 'react';
import { TimeFiClient, principalCV } from '@timefi/sdk';

// Shared client instance
const client = new TimeFiClient(import.meta.env.VITE_NETWORK || 'mainnet');

/**
 * Custom hook for interacting with TimeFi vault contract (Transactions)
 */
export function useContract() {
  /**
   * Create a new time-locked vault
   */
  const createVault = useCallback(async (amountSTX, lockDurationBlocks) => {
    return client.getCreateVaultOptions(amountSTX, lockDurationBlocks);
  }, []);

  /**
   * Withdraw from a vault after lock period
   */
  const withdraw = useCallback(async (vaultId) => {
    return client.getWithdrawOptions(vaultId);
  }, []);

  /**
   * Approve a bot to manage vault
   */
  const approveBot = useCallback(async (botAddress) => {
    return {
      ...client.getWithdrawOptions(0), // Dummy to get base options
      functionName: 'approve-bot',
      functionArgs: [principalCV(botAddress)],
    };
  }, []);

  return {
    createVault,
    withdraw,
    approveBot,
    contractAddress: client.contractAddress,
    network: client.network,
  };
}

export default useContract;
