import { describe, expect, it } from 'vitest';
import { isAboveMinDeposit } from '../frontend/src/utils/validation.js';

describe('isAboveMinDeposit equal value', () => {
  it('accepts values at the minimum', () => {
    expect(isAboveMinDeposit(100, 100)).toBe(true);
  });
});
