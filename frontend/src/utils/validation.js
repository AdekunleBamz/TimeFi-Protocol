import { LOCK_PERIODS, MIN_DEPOSIT, MAX_DEPOSIT } from '../config/contracts';

/**
 * Validate Stacks address format
 * @param {string} address - Address to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAddress(address) {
  if (!address) {
    return { valid: false, error: 'Address is required' };
  }

  // Mainnet addresses start with SP
  // Testnet addresses start with ST
  const validPrefixes = ['SP', 'ST'];
  const prefix = address.slice(0, 2);

  if (!validPrefixes.includes(prefix)) {
    return { valid: false, error: 'Invalid address prefix. Must start with SP or ST' };
  }

  // Standard Stacks addresses are 41 characters
  if (address.length < 39 || address.length > 41) {
    return { valid: false, error: 'Invalid address length' };
  }

  // Check for valid base58 characters (no 0, O, I, l)
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  if (!base58Regex.test(address)) {
    return { valid: false, error: 'Address contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate deposit amount
 * @param {string|number} amount - Amount in STX
 * @param {number} balance - User's balance in STX
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDepositAmount(amount, balance) {
  const numAmount = Number(amount);

  if (!amount || isNaN(numAmount)) {
    return { valid: false, error: 'Please enter an amount' };
  }

  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (numAmount < MIN_DEPOSIT) {
    return { valid: false, error: `Minimum deposit is ${MIN_DEPOSIT} STX` };
  }

  if (numAmount > MAX_DEPOSIT) {
    return { valid: false, error: `Maximum deposit is ${MAX_DEPOSIT.toLocaleString()} STX` };
  }

  if (balance !== undefined && numAmount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }

  return { valid: true };
}

/**
 * Validate lock period selection
 * @param {number} period - Lock period in blocks
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateLockPeriod(period) {
  if (!period) {
    return { valid: false, error: 'Please select a lock period' };
  }

  const validPeriod = Object.values(LOCK_PERIODS).find(p => p.blocks === period);

  if (!validPeriod) {
    return { valid: false, error: 'Invalid lock period selected' };
  }

  return { valid: true };
}

/**
 * Validate vault creation form
 * @param {Object} data - Form data
 * @param {string} data.amount - Deposit amount
 * @param {number} data.lockPeriod - Lock period in blocks
 * @param {number} data.balance - User's balance
 * @returns {{ valid: boolean, errors: Object }}
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
 * Validate withdrawal request
 * @param {Object} vault - Vault data
 * @param {number} currentHeight - Current block height
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateWithdrawal(vault, currentHeight) {
  if (!vault) {
    return { valid: false, error: 'Vault not found' };
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
 * Validate bot address for auto-compound
 * @param {string} botAddress - Bot address to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateBotAddress(botAddress) {
  if (!botAddress) {
    return { valid: false, error: 'Bot address is required' };
  }

  const addressValidation = validateAddress(botAddress);
  if (!addressValidation.valid) {
    return addressValidation;
  }

  return { valid: true };
}
