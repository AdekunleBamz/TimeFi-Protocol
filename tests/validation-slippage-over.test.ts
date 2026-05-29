import { describe, expect, it } from 'vitest';
import { isValidSlippage } from '../frontend/src/utils/validation.js';

describe('isValidSlippage upper guard', () => {
  it('rejects values over the maximum', () => {
    expect(isValidSlippage(10001)).toBe(false);
  });
});
