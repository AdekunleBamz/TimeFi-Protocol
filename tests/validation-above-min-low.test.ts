import { describe, expect, it } from 'vitest';
import { isAboveMinDeposit } from '../frontend/src/utils/validation.js';

describe('isAboveMinDeposit low value', () => {
  it('rejects values below the minimum', () => {
    expect(isAboveMinDeposit(99, 100)).toBe(false);
  });
});
