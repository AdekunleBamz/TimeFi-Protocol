import { describe, expect, it } from 'vitest';
import { validateDepositAmount, validateLockPeriod, validateVaultId } from '../frontend/src/utils/validation.js';
import { LOCK_PERIODS } from '../frontend/src/config/contracts.js';

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
});
