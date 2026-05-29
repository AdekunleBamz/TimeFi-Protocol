import { describe, expect, it } from 'vitest';
import { isValidSlippage } from '../frontend/src/utils/validation.js';

describe('isValidSlippage zero input', () => {
  it('accepts zero slippage', () => {
    expect(isValidSlippage(0)).toBe(true);
  });
});
