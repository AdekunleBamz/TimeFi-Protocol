import { describe, expect, it } from 'vitest';
import { validateVaultCreation } from '../frontend/src/utils/validation.js';

describe('validateVaultCreation missing amount', () => {
  it('fails when amount is blank', () => {
    expect(validateVaultCreation({ amount: '', lockPeriod: 6 }).valid).toBe(false);
  });
});
