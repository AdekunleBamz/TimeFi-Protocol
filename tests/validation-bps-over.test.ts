import { describe, expect, it } from 'vitest';
import { isValidBps } from '../frontend/src/utils/validation.js';

describe('isValidBps upper bound', () => {
  it('rejects values above 10000', () => {
    expect(isValidBps(10001)).toBe(false);
  });
});
