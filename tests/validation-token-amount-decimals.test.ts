import { describe, expect, it } from 'vitest';
import { isValidTokenAmount } from '../frontend/src/utils/validation.js';

describe('isValidTokenAmount decimal precision', () => {
  it('accepts values inside decimal precision', () => {
    expect(isValidTokenAmount('1.23', 2)).toBe(true);
  });
});
