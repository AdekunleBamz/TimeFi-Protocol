import { describe, expect, it } from 'vitest';
import { isWithinLockRange } from '../frontend/src/utils/validation.js';

describe('isWithinLockRange minimum', () => {
  it('accepts the minimum lock value', () => {
    expect(isWithinLockRange(6, 6, 10)).toBe(true);
  });
});
