import { describe, expect, it } from 'vitest';
import { validateDepositAmount, validateLockPeriod, validateVaultId } from '../frontend/src/utils/validation.js';
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

  it('rejects non-integer vault ids', () => {
    const result = validateVaultId(1.25);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Vault ID must be a whole number');
  });

  it('accepts positive integer vault ids', () => {
    expect(validateVaultId(1).valid).toBe(true);
  });
});
