import { useState, useCallback, useMemo } from 'react';
import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES } from '../config/contracts';
import { useFetch } from './useAsync';

const network = import.meta.env.VITE_NETWORK === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();

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
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAMES.VAULT,
        functionName: fnName,
        functionArgs: fnArgs,
        network,
        senderAddress: senderAddress || CONTRACT_ADDRESS,
      });

      return cvToJSON(result);
    } catch (err) {
      setErrorFlag(err.message);
      throw err;
    } finally {
      setLoadingFlag(false);
    }
  }, []);

  // Define convenience methods
  const methods = useMemo(() => ({
    getVault: (vaultId) => callReadOnly('get-vault', [uintCV(vaultId)]),
    getTVL: () => callReadOnly('get-tvl', []),
    getVaultCount: () => callReadOnly('get-vault-count', []),
    getTimeRemaining: (vaultId) => callReadOnly('get-time-remaining', [uintCV(vaultId)]),
    canWithdraw: (vaultId) => callReadOnly('can-withdraw', [uintCV(vaultId)]),
    isVaultOwner: (vaultId, owner) => callReadOnly('is-vault-owner', [uintCV(vaultId), principalCV(owner)]),
    calculateFee: (amount) => callReadOnly('calculate-fee', [uintCV(amount)]),
    callReadOnly,
  }), [callReadOnly]);

  // If functionName is provided, use mode 1 (data fetching)
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
