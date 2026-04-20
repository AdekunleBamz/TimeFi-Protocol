import { useState, useCallback, useMemo } from 'react';
import { principalCV, uintCV } from '@stacks/transactions';
import { TimeFiClient } from 'timefi-sdk';
import { useFetch } from './useAsync';

/**
 * ACTIVE_NETWORK - Current network configuration from environment.
 * @type {string}
 */
const ACTIVE_NETWORK =
  String(import.meta.env.VITE_NETWORK || 'mainnet').trim().toLowerCase() === 'mainnet'
    ? 'mainnet'
    : 'testnet';

/**
 * client - Singleton TimeFiClient instance for contract interactions.
 * Initialized once to maintain connection efficiency.
 * @type {TimeFiClient}
 */
const client = new TimeFiClient(ACTIVE_NETWORK);

/**
 * useReadOnly - Custom hook for read-only Clarity contract queries.
 *
 * Provides two modes of operation:
 * 1. Data-fetching mode: useReadOnly('fn-name', [args]) returns { data, loading, error, refetch }
 * 2. Method mode: useReadOnly() returns { getVault, getTVL, getTimeRemaining, ... }
 *
 * Uses TimeFiClient from timefi-sdk for consistent contract interaction.
 *
 * @param {string} [functionName] - Contract function name for data-fetching mode
 * @param {Array} [functionArgs=[]] - Clarity CV arguments for the function
 * @param {Object} [options={}] - Query options (e.g., { enabled: true })
 * @returns {Object} Either data-fetching result or method bag depending on mode
 * @example
 * // Data-fetching mode
 * const { data: vault } = useReadOnly('get-vault', [uintCV(123)]);
 *
 * // Method mode
 * const { getVault, canWithdraw } = useReadOnly();
 * const vault = await getVault(123);
 */
export function useReadOnly(functionName, functionArgs = [], options = {}) {
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [errorFlag, setErrorFlag] = useState(null);

  const callReadOnly = useCallback(async (fnName, fnArgs = [], senderAddress) => {
    setLoadingFlag(true);
    setErrorFlag(null);
    try {
      return await client.callReadOnly(fnName, fnArgs, senderAddress);
    } catch (err) {
      setErrorFlag(err.message);
      throw err;
    } finally {
      setLoadingFlag(false);
    }
  }, []);

  // Convenience methods using SDK client
  const methods = useMemo(() => ({
    getVault: (vaultId) => client.getVault(vaultId),
    getTVL: () => client.getTVL(),
    getTimeRemaining: (vaultId) => client.getTimeRemaining(vaultId),
    canWithdraw: (vaultId) => client.canWithdraw(vaultId),
    getTreasury: () => callReadOnly('get-treasury', []),
    // Additional methods can be proxied to callReadOnly
    getVaultCount: () => callReadOnly('get-vault-count', []),
    isVaultOwner: (vaultId, owner) => callReadOnly('is-vault-owner', [uintCV(vaultId), principalCV(owner)]),
    isBot: (sender) => callReadOnly('is-bot', [principalCV(sender)]),
    calculateFee: (amount) => callReadOnly('calculate-fee', [uintCV(amount)]),
    callReadOnly,
  }), [callReadOnly]);

  // Data fetching mode
  const fetcher = useCallback(() => {
    if (!functionName) return Promise.resolve(null);
    return callReadOnly(functionName, functionArgs);
  }, [functionName, functionArgs, callReadOnly]);

  const { data, loading: fetchLoading, error: fetchError, refetch } = useFetch(
    fetcher,
    [functionName, JSON.stringify(functionArgs), options.enabled !== false]
  );

  if (functionName) {
    return { data, loading: fetchLoading, error: fetchError, refetch };
  }

  return {
    ...methods,
    loading: loadingFlag,
    error: errorFlag,
  };
}

export default useReadOnly;
