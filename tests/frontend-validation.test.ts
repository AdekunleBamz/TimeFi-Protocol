import { describe, expect, it } from 'vitest';
import { isAboveMinDeposit, isNonEmptyString, isPositiveNumber, isValidBlockCount, isValidBps, isValidMicroStx, isValidSlippage, isValidVaultId, isWithinLockRange, validateAddress, validateBotAddress, validateDepositAmount, validateLockPeriod, validateVaultCreation, validateVaultId, validateWithdrawal } from '../frontend/src/utils/validation.js';
import { LOCK_PERIODS, MIN_DEPOSIT } from '../frontend/src/config/contracts.js';

describe('frontend validation helpers', () => {
  it('accepts numeric-string lock period values', () => {
    const firstSupportedBlocks = Object.values(LOCK_PERIODS)[0].blocks;
    expect(validateLockPeriod(String(firstSupportedBlocks)).valid).toBe(true);
  });

  it('accepts whitespace-padded numeric lock period values', () => {
    const firstSupportedBlocks = Object.values(LOCK_PERIODS)[0].blocks;
    expect(validateLockPeriod(`  ${firstSupportedBlocks}  `).valid).toBe(true);
  });

  it('rejects infinite deposit values', () => {
    expect(validateDepositAmount(Number.POSITIVE_INFINITY).valid).toBe(false);
  });

  it('rejects non-numeric deposit strings', () => {
    expect(validateDepositAmount('abc').valid).toBe(false);
  });

  it('rejects infinite vault ids', () => {
    expect(validateVaultId(Number.POSITIVE_INFINITY).valid).toBe(false);
  });

  it('rejects non-numeric lock period strings', () => {
    expect(validateLockPeriod('not-a-number').valid).toBe(false);
  });

  it('rejects non-finite lock period values', () => {
    expect(validateLockPeriod(Number.POSITIVE_INFINITY).valid).toBe(false);
  });

  it('uses microSTX wording for minimum deposit errors', () => {
    const underMin = MIN_DEPOSIT > 1 ? MIN_DEPOSIT - 1 : 0;
    const result = validateDepositAmount(underMin);
    expect(result.valid).toBe(false);

    if (underMin > 0) {
      expect(result.error).toContain('microSTX');
      return;
    }

    expect(result.error).toBe('Amount must be greater than 0');
  });

  it('uses microSTX wording for maximum deposit errors', () => {
    const result = validateDepositAmount(Number.MAX_SAFE_INTEGER);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('microSTX');
  });

  it('returns explicit zero-amount validation feedback', () => {
    const result = validateDepositAmount(0);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Amount must be greater than 0');
  });

  it('prompts when deposit amount is blank input', () => {
    const result = validateDepositAmount('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter an amount');
  });

  it('prompts when deposit amount is null input', () => {
    const result = validateDepositAmount(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter an amount');
  });

  it('accepts fractional deposit values in STX-amount mode', () => {
    const result = validateDepositAmount(1000.5);
    expect(result.valid).toBe(true);
  });

  it('rejects non-integer vault ids', () => {
    const result = validateVaultId(1.25);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Vault ID must be a whole number');
  });

  it('accepts positive integer vault ids', () => {
    expect(validateVaultId(1).valid).toBe(true);
  });

  it('rejects vault ids above max safe integer', () => {
    const result = validateVaultId(Number.MAX_SAFE_INTEGER + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Vault ID is out of range');
  });

  it('rejects empty vault id input', () => {
    const result = validateVaultId('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('A valid Vault ID is required');
  });

  it('rejects zero vault ids', () => {
    const result = validateVaultId(0);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Vault ID must be a positive number');
  });

  it('rejects negative vault ids', () => {
    const result = validateVaultId(-2);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Vault ID must be a positive number');
  });

  it('rejects missing lock period input', () => {
    const result = validateLockPeriod(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please select a lock period');
  });

  it('rejects zero lock period input', () => {
    const result = validateLockPeriod(0);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please select a lock period');
  });

  it('accepts numeric lock period values', () => {
    const firstSupportedBlocks = Object.values(LOCK_PERIODS)[0].blocks;
    expect(validateLockPeriod(firstSupportedBlocks).valid).toBe(true);
  });

  it('rejects deposits that exceed available balance', () => {
    const result = validateDepositAmount(1000, 999);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Insufficient balance');
  });

  it('accepts deposits within available balance', () => {
    expect(validateDepositAmount(MIN_DEPOSIT, MIN_DEPOSIT).valid).toBe(true);
  });

  it('accepts numeric-string deposit amounts', () => {
    expect(validateDepositAmount(String(MIN_DEPOSIT), MIN_DEPOSIT).valid).toBe(true);
  });

  it('rejects addresses with invalid prefix', () => {
    const result = validateAddress('SZ3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('prefix');
  });

  it('rejects addresses with invalid base58 characters', () => {
    const result = validateAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG60');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('base58');
  });

  it('rejects addresses with invalid length', () => {
    const result = validateAddress('SP1234');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('length');
  });

  it('accepts valid stacks addresses', () => {
    expect(validateAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N').valid).toBe(true);
  });

  it('accepts valid stacks addresses with surrounding whitespace', () => {
    expect(validateAddress('  SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N  ').valid).toBe(true);
  });

  it('rejects empty address input', () => {
    const result = validateAddress('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Address is required');
  });

  it('rejects non-string address input', () => {
    const result = validateAddress(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Address is required');
  });

  it('requires a bot address input', () => {
    const result = validateBotAddress('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Bot address is required');
  });

  it('accepts bot addresses with surrounding whitespace', () => {
    const result = validateBotAddress('  SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N  ');
    expect(result.valid).toBe(true);
  });

  it('rejects bot addresses that are only whitespace', () => {
    const result = validateBotAddress('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Bot address is required');
  });

  it('surfaces address format errors for bot validation', () => {
    const result = validateBotAddress('BAD-ADDRESS');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('prefix');
  });

  it('surfaces invalid-character bot address errors', () => {
    const result = validateBotAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG60');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('base58');
  });

  it('rejects withdrawal when vault is missing', () => {
    const result = validateWithdrawal(null, 1000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Vault not found');
  });

  it('rejects withdrawal checks for negative block heights', () => {
    const vault = { depositHeight: 100, lockPeriod: 10, isWithdrawn: false };
    const result = validateWithdrawal(vault, -1);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid current block height');
  });

  it('rejects withdrawal checks for non-finite block heights', () => {
    const vault = { depositHeight: 100, lockPeriod: 10, isWithdrawn: false };
    const result = validateWithdrawal(vault, Number.NaN);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid current block height');
  });

  it('rejects withdrawal checks when block height is a string', () => {
    const vault = { depositHeight: 100, lockPeriod: 10, isWithdrawn: false };
    const result = validateWithdrawal(vault, '110');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid current block height');
  });

  it('returns remaining block count for locked withdrawals', () => {
    const vault = { depositHeight: 100, lockPeriod: 10, isWithdrawn: false };
    const result = validateWithdrawal(vault, 105);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5 blocks remaining');
  });

  it('formats large locked-withdrawal block counts with separators', () => {
    const vault = { depositHeight: 100, lockPeriod: 2000, isWithdrawn: false };
    const result = validateWithdrawal(vault, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2,000 blocks remaining');
  });

  it('rejects withdrawals for already-withdrawn vaults', () => {
    const vault = { depositHeight: 100, lockPeriod: 10, isWithdrawn: true };
    const result = validateWithdrawal(vault, 120);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Vault already withdrawn');
  });

  it('accepts withdrawals once lock periods have elapsed', () => {
    const vault = { depositHeight: 100, lockPeriod: 10, isWithdrawn: false };
    const result = validateWithdrawal(vault, 110);
    expect(result.valid).toBe(true);
  });

  it('accepts withdrawals when block height is above unlock height', () => {
    const vault = { depositHeight: 100, lockPeriod: 10, isWithdrawn: false };
    const result = validateWithdrawal(vault, 111);
    expect(result.valid).toBe(true);
  });

  it('accepts complete vault creation payloads', () => {
    const firstSupportedBlocks = Object.values(LOCK_PERIODS)[0].blocks;
    expect(validateVaultCreation({ amount: MIN_DEPOSIT, lockPeriod: firstSupportedBlocks, balance: MIN_DEPOSIT }).valid).toBe(true);
  });

  it('collects amount errors for vault creation payloads', () => {
    const firstSupportedBlocks = Object.values(LOCK_PERIODS)[0].blocks;
    const result = validateVaultCreation({ amount: '', lockPeriod: firstSupportedBlocks, balance: MIN_DEPOSIT });
    expect(result.valid).toBe(false);
    expect(result.errors.amount).toBe('Please enter an amount');
  });

  it('collects lock period errors for vault creation payloads', () => {
    const result = validateVaultCreation({ amount: MIN_DEPOSIT, lockPeriod: 1, balance: MIN_DEPOSIT });
    expect(result.valid).toBe(false);
    expect(result.errors.lockPeriod).toBe('Invalid lock period selected');
  });

  it('accepts zero microSTX helper values', () => {
    expect(isValidMicroStx(0)).toBe(true);
  });

  it('rejects fractional microSTX helper values', () => {
    expect(isValidMicroStx(1.5)).toBe(false);
  });

  it('accepts numeric-string microSTX helper values', () => {
    expect(isValidMicroStx('10')).toBe(true);
  });

  it('rejects zero block count helper values', () => {
    expect(isValidBlockCount(0)).toBe(false);
  });

  it('accepts numeric-string block count helper values', () => {
    expect(isValidBlockCount('10')).toBe(true);
  });

  it('accepts zero basis-point helper values', () => {
    expect(isValidBps(0)).toBe(true);
  });

  it('accepts maximum basis-point helper values', () => {
    expect(isValidBps(10000)).toBe(true);
  });

  it('rejects oversized basis-point helper values', () => {
    expect(isValidBps(10001)).toBe(false);
  });

  it('accepts numeric-string vault id helper values', () => {
    expect(isValidVaultId('7')).toBe(true);
  });

  it('rejects zero vault id helper values', () => {
    expect(isValidVaultId(0)).toBe(false);
  });

  it('accepts deposit helper values at the minimum boundary', () => {
    expect(isAboveMinDeposit(MIN_DEPOSIT, MIN_DEPOSIT)).toBe(true);
  });

  it('rejects deposit helper values below the minimum boundary', () => {
    expect(isAboveMinDeposit(MIN_DEPOSIT - 1, MIN_DEPOSIT)).toBe(false);
  });

  it('accepts lock range helper boundary values', () => {
    expect(isWithinLockRange(10, 10, 20)).toBe(true);
  });

  it('rejects lock range helper values below the minimum', () => {
    expect(isWithinLockRange(9, 10, 20)).toBe(false);
  });

  it('accepts trimmed non-empty string helper values', () => {
    expect(isNonEmptyString(' vault ')).toBe(true);
  });

  it('rejects object values in non-empty string helper', () => {
    expect(isNonEmptyString({})).toBe(false);
  });

  it('accepts numeric-string positive number helper values', () => {
    expect(isPositiveNumber('1')).toBe(true);
  });

  it('rejects zero positive number helper values', () => {
    expect(isPositiveNumber(0)).toBe(false);
  });

  it('accepts maximum slippage helper values', () => {
    expect(isValidSlippage(500)).toBe(true);
  });

  it('rejects oversized slippage helper values', () => {
    expect(isValidSlippage(501)).toBe(false);
  });
});
