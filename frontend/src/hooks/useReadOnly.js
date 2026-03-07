import { useState, useCallback, useMemo } from 'react';
import { TimeFiClient, uintCV, principalCV } from '@timefi/sdk';
import { useFetch } from './useAsync';

// Shared client instance
const client = new TimeFiClient(import.meta.env.VITE_NETWORK || 'mainnet');

/**
 * Custom hook for read-only contract queries
 * Supports two modes:
 * 1. Data-fetching: useReadOnly('fn-name', [args]) -> { data, loading, error }
 * 2. Method-based: const { getVault } = useReadOnly() -> getVault(id)
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
    // Additional methods can be proxied to callReadOnly
    getVaultCount: () => callReadOnly('get-vault-count', []),
    isVaultOwner: (vaultId, owner) => callReadOnly('is-vault-owner', [uintCV(vaultId), principalCV(owner)]),
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
