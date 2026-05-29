import { describe, expect, it } from 'vitest';
import { isWithinLockRange } from '../frontend/src/utils/validation.js';

describe('isWithinLockRange over maximum', () => {
  it('rejects values above the maximum', () => {
    expect(isWithinLockRange(11, 6, 10)).toBe(false);
  });
});
