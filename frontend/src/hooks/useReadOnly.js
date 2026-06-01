import { useState, useCallback, useEffect, useMemo } from 'react';
import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions';
import { STACKS_NETWORK, CONTRACT_ADDRESS, CONTRACT_NAMES } from '../utils/constants';
import { env } from '../config/env';

const CONTRACT_NAME = CONTRACT_NAMES.VAULT;
const CONTRACT_NAME_CANDIDATES = [
  CONTRACT_NAME,
  'timefi-vault-v-A2',
  'timefi-vault-v-A1',
  'timefi-vault',
].filter((name, index, names) => name && names.indexOf(name) === index);

const FUNCTION_ALIASES = {
  'get-total-locked': 'get-tvl',
  'get-vault-details': 'get-vault',
};
const OWNER_SCAN_BATCH_SIZE = 40;
const USER_VAULT_EVENT_LIMIT = 50;
const USER_VAULT_EVENT_MAX_PAGES = 8;
const USER_VAULT_TX_LIMIT = 50;
const USER_VAULT_TX_MAX_PAGES = 6;
const READ_TIMEOUT_MS = 10000;
const HIRO_API_URL = env.hiroApiUrl || STACKS_NETWORK?.coreApiUrl || 'https://api.mainnet.hiro.so';

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

  const clarityType = typeof value.type === 'string' ? value.type : '';

  if (typeof value.success === 'boolean' && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return clarityJsonToPlain(value.value);
  }

  if (clarityType === 'ok' || clarityType.startsWith('(response ')) {
    return clarityJsonToPlain(value.value);
  }

  if (clarityType === 'some' || clarityType.startsWith('(optional ')) {
    return clarityJsonToPlain(value.value);
  }

  if (clarityType === 'none') {
    return null;
  }

  if (clarityType === 'uint' || clarityType === 'int') {
    return Number(value.value);
  }

  if (clarityType === 'bool') {
    return Boolean(value.value);
  }

  if (clarityType === 'principal' || clarityType === 'string-ascii' || clarityType === 'string-utf8') {
    return value.value;
  }

  if (clarityType === 'list' || clarityType.startsWith('(list ')) {
    return clarityJsonToPlain(value.value);
  }

  if (clarityType === 'tuple' || clarityType.startsWith('(tuple ')) {
    return clarityJsonToPlain(value.value);
  }

  const plain = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    plain[key] = clarityJsonToPlain(nestedValue);
  }
  return plain;
}

function withTimeout(promise, label, timeoutMs = READ_TIMEOUT_MS) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      reject(new Error(`${label} timed out`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    globalThis.clearTimeout(timeoutId);
  });
}

async function fetchJson(url, label) {
  const response = await withTimeout(fetch(url), label);
  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status}`);
  }
  return response.json();
}

function parseCreateVaultEvent(repr) {
  const text = String(repr || '');
  if (!text.includes('(event "create")')) return null;

  const idMatch = text.match(/\(id u(\d+)\)/);
  const ownerMatch = text.match(/\(owner '([^)\s]+)\)/);
  if (!idMatch || !ownerMatch) return null;

  const vaultId = Number(idMatch[1]);
  if (!Number.isInteger(vaultId) || vaultId <= 0) return null;

  return {
    id: vaultId,
    owner: ownerMatch[1],
  };
}

function parseVaultIdFromTxResult(txResult) {
  const repr = String(txResult?.repr || '');
  const match = repr.match(/^\(ok u(\d+)\)$/);
  if (!match) return null;

  const vaultId = Number(match[1]);
  return Number.isInteger(vaultId) && vaultId > 0 ? vaultId : null;
}

async function fetchUserVaultsFromTransactions(ownerAddress) {
  const ownedVaultIds = new Set();

  for (let page = 0; page < USER_VAULT_TX_MAX_PAGES; page += 1) {
    const offset = page * USER_VAULT_TX_LIMIT;
    const url = new URL(`/extended/v1/address/${ownerAddress}/transactions`, HIRO_API_URL);
    url.searchParams.set('limit', String(USER_VAULT_TX_LIMIT));
    url.searchParams.set('offset', String(offset));

    const data = await fetchJson(url, 'Wallet transactions fetch');
    const transactions = Array.isArray(data.results) ? data.results : [];

    for (const transaction of transactions) {
      const contractCall = transaction?.contract_call;
      const isVaultCreate = transaction?.tx_status === 'success'
        && contractCall?.contract_id === `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`
        && contractCall?.function_name === 'create-vault';
      if (!isVaultCreate) continue;

      const vaultId = parseVaultIdFromTxResult(transaction.tx_result);
      if (vaultId) ownedVaultIds.add(vaultId);
    }

    if (transactions.length < USER_VAULT_TX_LIMIT) break;
  }

  return [...ownedVaultIds].sort((a, b) => b - a);
}

async function fetchUserVaultsFromEvents(ownerAddress) {
  const ownedVaultIds = new Set();

  for (const contractName of CONTRACT_NAME_CANDIDATES) {
    for (let page = 0; page < USER_VAULT_EVENT_MAX_PAGES; page += 1) {
      const offset = page * USER_VAULT_EVENT_LIMIT;
      const url = new URL(
        `/extended/v1/contract/${CONTRACT_ADDRESS}.${contractName}/events`,
        HIRO_API_URL
      );
      url.searchParams.set('limit', String(USER_VAULT_EVENT_LIMIT));
      url.searchParams.set('offset', String(offset));
      url.searchParams.set('unanchored', 'true');

      const data = await fetchJson(url, 'Contract events fetch').catch((error) => {
        if (page === 0) return { results: [] };
        throw error;
      });
      const events = Array.isArray(data.results) ? data.results : [];

      for (const event of events) {
        const parsedEvent = parseCreateVaultEvent(event?.contract_log?.value?.repr);
        if (parsedEvent?.owner === ownerAddress) {
          ownedVaultIds.add(parsedEvent.id);
        }
      }

      if (events.length < USER_VAULT_EVENT_LIMIT) {
        break;
      }
    }

    if (ownedVaultIds.size > 0) break;
  }

  return [...ownedVaultIds].sort((a, b) => b - a);
}

async function fetchPlainReadOnly(callReadOnly, readFunctionName, readFunctionArgs = []) {
  const resolvedFunctionName = resolveFunctionName(readFunctionName);

  if (resolvedFunctionName === 'get-user-vaults') {
    const ownerAddress = String(readFunctionArgs[0] || '').trim();
    if (!ownerAddress) return [];

    const transactionVaultIds = await fetchUserVaultsFromTransactions(ownerAddress);
    if (transactionVaultIds.length > 0) {
      const verifiedTransactionVaultIds = await Promise.all(
        transactionVaultIds.map(async (vaultId) => {
          const ownershipResult = await callReadOnly('is-vault-owner', [
            uintCV(vaultId),
            principalCV(ownerAddress),
          ]);
          return clarityJsonToPlain(ownershipResult) ? vaultId : null;
        })
      );

      return verifiedTransactionVaultIds.filter((vaultId) => vaultId !== null);
    }

    const eventVaultIds = await fetchUserVaultsFromEvents(ownerAddress);
    if (eventVaultIds.length > 0) {
      const verifiedEventVaultIds = await Promise.all(
        eventVaultIds.map(async (vaultId) => {
          const ownershipResult = await callReadOnly('is-vault-owner', [
            uintCV(vaultId),
            principalCV(ownerAddress),
          ]);
          return clarityJsonToPlain(ownershipResult) ? vaultId : null;
        })
      );

      return verifiedEventVaultIds.filter((vaultId) => vaultId !== null);
    }

    const vaultCountResult = await callReadOnly('get-vault-count', []);
    const vaultCount = clarityJsonToPlain(vaultCountResult);
    const safeVaultCount = Number.isInteger(vaultCount) && vaultCount > 0 ? vaultCount : 0;
    const ownedVaultIds = [];
    const fallbackStartId = Math.max(safeVaultCount - (OWNER_SCAN_BATCH_SIZE * 2) + 1, 1);

    for (let startId = fallbackStartId; startId <= safeVaultCount; startId += OWNER_SCAN_BATCH_SIZE) {
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

    return ownedVaultIds.sort((a, b) => b - a);
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
      let lastError;

      for (const contractName of CONTRACT_NAME_CANDIDATES) {
        try {
          const result = await withTimeout(
            callReadOnlyFunction({
              contractAddress: CONTRACT_ADDRESS,
              contractName,
              functionName: resolvedFunctionName,
              functionArgs: readFunctionArgs,
              network: STACKS_NETWORK,
              senderAddress: senderAddress || CONTRACT_ADDRESS,
            }),
            `${resolvedFunctionName} read`
          );

          return cvToJSON(result);
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError || new Error(`Unable to read ${resolvedFunctionName}`);
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
      setError(null);
      return plainResult;
    } catch (err) {
      setError(err.message || 'Read-only call failed');
      setData(null);
      return null;
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
          setError(err.message || 'Read-only call failed');
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
