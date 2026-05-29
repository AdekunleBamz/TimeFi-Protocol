import { describe, expect, it } from 'vitest';
import { isValidTokenAmount } from '../frontend/src/utils/validation.js';

describe('isValidTokenAmount precision guard', () => {
  it('rejects values above decimal precision', () => {
    expect(isValidTokenAmount('1.234', 2)).toBe(false);
  });
});
