import { describe, expect, it } from 'vitest';
import { validateDepositAmount } from '../frontend/src/utils/validation.js';

describe('validateDepositAmount blank input', () => {
  it('prompts for an amount', () => {
    expect(validateDepositAmount('   ').valid).toBe(false);
  });
});
