import { useCallback } from 'react';
import { AnchorMode, PostConditionMode, uintCV, principalCV } from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES } from '../config/contracts';

const network = import.meta.env.VITE_NETWORK === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();

/**
 * Custom hook for interacting with TimeFi vault contract (Transactions)
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
   * @param {number} amount - Amount in STX (will be converted to microSTX)
   * @param {number} lockDuration - Lock duration in blocks
   */
  const createVault = useCallback(async (amount, lockDuration) => {
    return {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAMES.VAULT,
      functionName: 'create-vault',
      functionArgs: [uintCV(amount * 1_000_000), uintCV(lockDuration)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };
  }, []);

  /**
   * Withdraw from a vault after lock period
   */
  const withdraw = useCallback(async (vaultId) => {
    return {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAMES.VAULT,
      functionName: 'request-withdraw', // Matching contract v-A2
      functionArgs: [uintCV(vaultId)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };
  }, []);

  /**
   * Approve a bot to manage vault
   */
  const approveBot = useCallback(async (botAddress) => {
    return {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAMES.VAULT,
      functionName: 'approve-bot',
      functionArgs: [principalCV(botAddress)],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };
  }, []);

  return {
    createVault,
    withdraw,
    emergencyWithdraw,
    claimRewards,
    approveBot,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAMES.VAULT,
    network,
  };
}

export default useContract;
