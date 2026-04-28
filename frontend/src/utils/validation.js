import { LOCK_PERIODS, MIN_DEPOSIT, MAX_DEPOSIT } from '../config/contracts';

const MICROSTX_PER_STX = 1_000_000;

function protocolUsesStxAmountUnits() {
  return Number.isFinite(MIN_DEPOSIT) && MIN_DEPOSIT > 0 && MIN_DEPOSIT < 1;
}

function toMicroStxComparable(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return NaN;
  }

  if (!protocolUsesStxAmountUnits()) {
    return numericValue;
  }

  return numericValue * MICROSTX_PER_STX;
}

/**
 * Validation Utilities - Input validation and sanitization functions.
 *
 * Provides validation for addresses, amounts, vault IDs, and other
 * user inputs to ensure data integrity before contract interactions.
 *
 * @module utils/validation
 * @author adekunlebamz
 */

/**
 * validateAddress - Validate a Stacks blockchain address format.
 *
 * Checks for valid prefix (SP for mainnet, ST for testnet),
 * correct length, and valid base58 characters.
 *
 * @param {string} address - Stacks address to validate
 * @returns {{ valid: boolean, error?: string }} Validation result with error message if invalid
 * @example
 * validateAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N')
 * // returns { valid: true }
 *
 * validateAddress('invalid')
 * // returns { valid: false, error: 'Invalid address length' }
 */
export function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required' };
  }

  const trimmed = address.trim();

  // Mainnet addresses start with SP
  // Testnet addresses start with ST
  const validPrefixes = new Set(['SP', 'ST']);
  const prefix = trimmed.slice(0, 2);

  if (!validPrefixes.has(prefix)) {
    return { valid: false, error: 'Invalid Stacks address prefix (must be SP or ST)' };
  }

  // Standard Stacks addresses are typically 41 characters
  if (trimmed.length < 38 || trimmed.length > 42) {
    return { valid: false, error: `Invalid address length (${trimmed.length})` };
  }

  // Check for valid base58 characters (no 0, O, I, l)
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  if (!base58Regex.test(trimmed)) {
    return { valid: false, error: 'Address contains invalid characters (non-base58)' };
  }

  return { valid: true };
}

function validateNonEmptyString(value, fieldName) {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true, value: trimmed };
}

/**
 * validateVaultId - Validate a vault ID.
 *
 * Ensures the ID is a positive integer greater than zero.
 *
 * @param {number|string} id - The vault ID to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 * @example
 * validateVaultId(5)   // { valid: true }
 * validateVaultId(-1)  // { valid: false, error: '...' }
 */
export function validateVaultId(id) {
  const numId = Number(id);
  if (id === undefined || id === null || String(id).trim() === '' || !Number.isFinite(numId)) {
    return { valid: false, error: 'A valid Vault ID is required' };
  }
  if (!Number.isInteger(numId)) {
    return { valid: false, error: 'Vault ID must be a whole number' };
  }
  if (!isValidVaultId(numId)) {
    return { valid: false, error: 'Vault ID must be a positive number' };
  }
  if (numId > Number.MAX_SAFE_INTEGER) {
    return { valid: false, error: 'Vault ID is out of range' };
  }
  return { valid: true };
}

/**
 * validateDepositAmount - Validate a deposit amount against protocol limits.
 *
 * Checks that the amount is a valid number, within the allowed range
 * (MIN_DEPOSIT to MAX_DEPOSIT), and doesn't exceed the user's current balance.
 * All amounts are expressed in microSTX.
 *
 * @param {string|number} amount - Deposit amount in microSTX
 * @param {number} [balance] - User's available balance in microSTX (optional)
 * @returns {{ valid: boolean, error?: string }} Validation result with error message if invalid
 * @example
 * validateDepositAmount(1000000, 500000000)
 * // returns { valid: true }
 *
 * validateDepositAmount(0, 500000000)
 * // returns { valid: false, error: 'Amount must be greater than 0' }
 */
export function validateDepositAmount(amount, balance) {
  const numAmount = Number(amount);
  const comparableAmount = toMicroStxComparable(amount);
  const comparableMinDeposit = toMicroStxComparable(MIN_DEPOSIT);
  const comparableMaxDeposit = toMicroStxComparable(MAX_DEPOSIT);
  const comparableBalance = balance === undefined ? undefined : toMicroStxComparable(balance);

  if (amount === undefined || amount === null || String(amount).trim() === '' || !Number.isFinite(numAmount)) {
    return { valid: false, error: 'Please enter an amount' };
  }

  if (comparableAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (!Number.isInteger(comparableAmount)) {
    return { valid: false, error: 'Amount must be a whole number of microSTX' };
  }

  if (comparableAmount < comparableMinDeposit) {
    return { valid: false, error: `Minimum deposit is ${MIN_DEPOSIT.toLocaleString()} microSTX` };
  }

  if (comparableAmount > comparableMaxDeposit) {
    return { valid: false, error: `Maximum deposit is ${MAX_DEPOSIT.toLocaleString()} microSTX` };
  }

  if (comparableBalance !== undefined && Number.isFinite(comparableBalance) && comparableAmount > comparableBalance) {
    return { valid: false, error: 'Insufficient balance' };
  }

  return { valid: true };
}

/**
 * validateLockPeriod - Validate a lock period against available options.
 *
 * Ensures the selected period matches one of the predefined lock periods
 * from the contract configuration. Rejects arbitrary block counts not in the list.
 *
 * @param {number} period - Lock period in blocks
 * @returns {{ valid: boolean, error?: string }} Validation result with error message if invalid
 * @example
 * validateLockPeriod(3600) // 1 hour in blocks
 * // returns { valid: true }
 */
export function validateLockPeriod(period) {
  if (!period) {
    return { valid: false, error: 'Please select a lock period' };
  }

  const normalizedPeriod = Number(period);
  if (!Number.isFinite(normalizedPeriod)) {
    return { valid: false, error: 'Invalid lock period selected' };
  }

  const validPeriod = Object.values(LOCK_PERIODS).find(p => p.blocks === normalizedPeriod);

  if (!validPeriod) {
    return { valid: false, error: 'Invalid lock period selected' };
  }

  return { valid: true };
}

/**
 * validateVaultCreation - Validate complete vault creation form data.
 *
 * Performs comprehensive validation of all vault creation fields
 * and returns all validation errors at once.
 *
 * @param {Object} data - Form data object
 * @param {string} data.amount - Deposit amount in STX
 * @param {number} data.lockPeriod - Lock period in blocks
 * @param {number} data.balance - User's available balance in microSTX
 * @returns {{ valid: boolean, errors: Object.<string, string> }} Validation result with error map
 * @example
 * validateVaultCreation({ amount: 100, lockPeriod: 3600, balance: 500 })
 * // returns { valid: true, errors: {} }
 */
export function validateVaultCreation({ amount, lockPeriod, balance }) {
  const errors = {};

  const amountValidation = validateDepositAmount(amount, balance);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error;
  }

  const periodValidation = validateLockPeriod(lockPeriod);
  if (!periodValidation.valid) {
    errors.lockPeriod = periodValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * validateWithdrawal - Validate that a vault can be withdrawn.
 *
 * Checks that the vault exists, hasn't been withdrawn already,
 * and that the lock period has completed.
 *
 * @param {Object} vault - Vault data object with depositHeight, lockPeriod, isWithdrawn
 * @param {number} currentHeight - Current blockchain block height
 * @returns {{ valid: boolean, error?: string }} Validation result with error message if invalid
 * @example
 * validateWithdrawal(vaultData, currentBlockHeight)
 * // returns { valid: true } if vault can be withdrawn
 */
export function validateWithdrawal(vault, currentHeight) {
  if (!vault) {
    return { valid: false, error: 'Vault not found' };
  }

  if (!Number.isFinite(currentHeight) || currentHeight < 0) {
    return { valid: false, error: 'Invalid current block height' };
  }

  if (vault.isWithdrawn) {
    return { valid: false, error: 'Vault already withdrawn' };
  }

  const unlockHeight = vault.depositHeight + vault.lockPeriod;
 
  if (currentHeight < unlockHeight) {
    const blocksRemaining = unlockHeight - currentHeight;
    return {
      valid: false,
      error: `Vault locked. ${blocksRemaining.toLocaleString()} blocks remaining`
    };
  }

  return { valid: true };
}

/**
 * validateBotAddress - Validate a bot address for auto-compound approval.
 *
 * Performs full address validation to ensure the bot address
 * is a valid Stacks address format.
 *
 * @param {string} botAddress - Stacks address of the bot to validate
 * @returns {{ valid: boolean, error?: string }} Validation result with error message if invalid
 * @example
 * validateBotAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N')
 * // returns { valid: true }
 */
export function validateBotAddress(botAddress) {
  const requiredCheck = validateNonEmptyString(botAddress, 'Bot address');
  if (!requiredCheck.valid) {
    return { valid: false, error: requiredCheck.error };
  }

  const trimmed = requiredCheck.value;

  const addressValidation = validateAddress(trimmed);
  if (!addressValidation.valid) {
    return addressValidation;
  }

  return { valid: true };
}

export const isValidMicroStx = (v) => Number.isInteger(Number(v)) && Number(v) >= 0;

export const isValidBlockCount = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

export const isValidBps = (v) => Number(v) >= 0 && Number(v) <= 10000;

export const isValidVaultId = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

export const isAboveMinDeposit = (v, min) => Number(v) >= Number(min);

export const isWithinLockRange = (v, mn, mx) => Number(v) >= Number(mn) && Number(v) <= Number(mx);

export const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const isPositiveNumber = (v) => !isNaN(Number(v)) && Number(v) > 0;

export const isValidSlippage = (v) => Number(v) >= 0 && Number(v) <= 500;

export const isValidTokenAmount = (v, decimals) => !isNaN(Number(v)) && Number(v) >= 0 && String(v).split(".")[1]?.length <= decimals;
