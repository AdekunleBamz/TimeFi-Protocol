import { describe, expect, it } from 'vitest';
import { validateAddress, validateBotAddress, validateDepositAmount, validateLockPeriod, validateVaultId, validateWithdrawal } from '../frontend/src/utils/validation.js';
import { LOCK_PERIODS, MIN_DEPOSIT } from '../frontend/src/config/contracts.js';

describe('frontend validation helpers', () => {
  it('accepts numeric-string lock period values', () => {
    const firstSupportedBlocks = Object.values(LOCK_PERIODS)[0].blocks;
    expect(validateLockPeriod(String(firstSupportedBlocks)).valid).toBe(true);
  });

  it('rejects infinite deposit values', () => {
    expect(validateDepositAmount(Number.POSITIVE_INFINITY).valid).toBe(false);
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

  it('rejects fractional microSTX deposit values', () => {
    const result = validateDepositAmount(1000.5);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Amount must be a whole number of microSTX');
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

  it('rejects missing lock period input', () => {
    const result = validateLockPeriod(null);
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

  it('accepts valid stacks addresses', () => {
    expect(validateAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N').valid).toBe(true);
  });

  it('accepts valid stacks addresses with surrounding whitespace', () => {
    expect(validateAddress('  SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N  ').valid).toBe(true);
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

  it('surfaces address format errors for bot validation', () => {
    const result = validateBotAddress('BAD-ADDRESS');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('prefix');
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

  it('returns remaining block count for locked withdrawals', () => {
    const vault = { depositHeight: 100, lockPeriod: 10, isWithdrawn: false };
    const result = validateWithdrawal(vault, 105);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5 blocks remaining');
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
});
