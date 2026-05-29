import { describe, expect, it } from 'vitest';
import { isValidFeeBps } from '../frontend/src/utils/math.js';

describe('isValidFeeBps upper bound', () => {
  it('rejects values over 10000', () => {
    expect(isValidFeeBps(10001)).toBe(false);
  });
});
