import { useState, useCallback, useEffect, useMemo } from 'react';
import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions';
import { STACKS_NETWORK, CONTRACT_ADDRESS, CONTRACT_NAMES } from '../utils/constants';

const CONTRACT_NAME = CONTRACT_NAMES.VAULT;

const FUNCTION_ALIASES = {
  'get-total-locked': 'get-tvl',
  'get-vault-details': 'get-vault',
};
const OWNER_SCAN_BATCH_SIZE = 40;

function resolveFunctionName(functionName) {
  return FUNCTION_ALIASES[functionName] || functionName;
}

function isClarityValue(value) {
  return value && typeof value === 'object' && 'type' in value;
}

function encodeFunctionArg(functionName, arg, index) {
  if (isClarityValue(arg)) return arg;
  if (arg === null || arg === undefined) return arg;

  if (
    functionName === 'get-user-vaults'
    || (functionName === 'is-vault-owner' && index === 1)
    || (functionName === 'is-bot' && index === 1)
  ) {
    return principalCV(String(arg));
  }

  if (Number.isInteger(Number(arg))) {
    return uintCV(Number(arg));
  }

  return arg;
}

function encodeFunctionArgs(functionName, args = []) {
  return args.map((arg, index) => encodeFunctionArg(functionName, arg, index));
}

function clarityJsonToPlain(value) {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(clarityJsonToPlain);
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (typeof value.success === 'boolean' && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return clarityJsonToPlain(value.value);
  }

  if (value.type === 'ok') {
    return clarityJsonToPlain(value.value);
  }

  if (value.type === 'some') {
    return clarityJsonToPlain(value.value);
  }

  if (value.type === 'none') {
    return null;
  }

  if (value.type === 'uint' || value.type === 'int') {
    return Number(value.value);
  }

  if (value.type === 'bool') {
    return Boolean(value.value);
  }

  if (value.type === 'principal' || value.type === 'string-ascii' || value.type === 'string-utf8') {
    return value.value;
  }

  if (value.type === 'list') {
    return clarityJsonToPlain(value.value);
  }

  if (value.type === 'tuple') {
    return clarityJsonToPlain(value.value);
  }

  const plain = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    plain[key] = clarityJsonToPlain(nestedValue);
  }
  return plain;
}

async function fetchPlainReadOnly(callReadOnly, readFunctionName, readFunctionArgs = []) {
  const resolvedFunctionName = resolveFunctionName(readFunctionName);

  if (resolvedFunctionName === 'get-user-vaults') {
    const ownerAddress = String(readFunctionArgs[0] || '').trim();
    if (!ownerAddress) return [];

    const vaultCountResult = await callReadOnly('get-vault-count', []);
    const vaultCount = clarityJsonToPlain(vaultCountResult);
    const safeVaultCount = Number.isInteger(vaultCount) && vaultCount > 0 ? vaultCount : 0;
    const ownedVaultIds = [];

    for (let startId = 1; startId <= safeVaultCount; startId += OWNER_SCAN_BATCH_SIZE) {
      const endId = Math.min(startId + OWNER_SCAN_BATCH_SIZE - 1, safeVaultCount);
      const vaultIds = Array.from(
        { length: endId - startId + 1 },
        (_, index) => startId + index
      );
      const ownershipResults = await Promise.all(
        vaultIds.map(async (vaultId) => {
          const ownershipResult = await callReadOnly('is-vault-owner', [
            uintCV(vaultId),
            principalCV(ownerAddress),
          ]);
          return clarityJsonToPlain(ownershipResult) ? vaultId : null;
        })
      );

      for (const vaultId of ownershipResults) {
        if (vaultId !== null) ownedVaultIds.push(vaultId);
      }
    }

    return ownedVaultIds;
  }

  const encodedArgs = encodeFunctionArgs(resolvedFunctionName, readFunctionArgs);
  const result = await callReadOnly(resolvedFunctionName, encodedArgs);
  return clarityJsonToPlain(result);
}

/**
 * useReadOnly - Hook for invoking read-only TimeFi contract functions.
 *
 * Provides typed wrappers around callReadOnlyFunction for every public
 * read-only entry point exposed by the timefi-vault contract. All calls
 * are network-aware and return ClarityValue-parsed JSON.
 *
 * @returns {{ loading: boolean, error: string|null, getVault: Function, getTVL: Function, getTotalFees: Function, getVaultCount: Function, getTimeRemaining: Function, canWithdraw: Function, isVaultOwner: Function, isBot: Function, calculateFee: Function, callReadOnly: Function }}
 */
export function useReadOnly(functionName, functionArgs = [], options = {}) {
  const shouldAutoFetch = typeof functionName === 'string';
  const enabled = options.enabled !== false && (!shouldAutoFetch || Array.isArray(functionArgs));
  const argsKey = JSON.stringify(functionArgs || []);
  const stableFunctionArgs = useMemo(() => (
    Array.isArray(functionArgs) ? functionArgs : []
  ), [argsKey]);
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * callReadOnly - Execute an arbitrary read-only contract function.
   * @param {string} functionName - Clarity function name
   * @param {Array} [functionArgs=[]] - Encoded Clarity arguments
   * @param {string} [senderAddress] - Optional sender principal
   * @returns {Promise<Object>} Parsed Clarity value as JSON
   */
  const callReadOnly = useCallback(async (readFunctionName, readFunctionArgs = [], senderAddress) => {
    if (!readFunctionName || typeof readFunctionName !== 'string') {
      throw new Error('callReadOnly: functionName must be a non-empty string');
    }

    const resolvedFunctionName = resolveFunctionName(readFunctionName);

    setLoading(true);
    setError(null);
    
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: resolvedFunctionName,
        functionArgs: readFunctionArgs,
        network: STACKS_NETWORK,
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

  const refetch = useCallback(async () => {
    if (!shouldAutoFetch || !enabled) return null;

    setAutoLoading(true);

    try {
      const plainResult = await fetchPlainReadOnly(callReadOnly, functionName, stableFunctionArgs);
      setData(plainResult);
      return plainResult;
    } finally {
      setAutoLoading(false);
    }
  }, [callReadOnly, enabled, functionName, shouldAutoFetch, stableFunctionArgs]);

  useEffect(() => {
    if (!shouldAutoFetch || !enabled) return undefined;

    let cancelled = false;

    async function fetchReadOnlyData() {
      setAutoLoading(true);

      try {
        const plainResult = await fetchPlainReadOnly(callReadOnly, functionName, stableFunctionArgs);
        if (!cancelled) {
          setData(plainResult);
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setAutoLoading(false);
        }
      }
    }

    fetchReadOnlyData();

    return () => {
      cancelled = true;
    };
  }, [callReadOnly, enabled, functionName, shouldAutoFetch, stableFunctionArgs]);

  return {
    data,
    loading: loading || autoLoading,
    error,
    refetch,
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
