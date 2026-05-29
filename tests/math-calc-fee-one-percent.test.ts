import { describe, expect, it } from 'vitest';
import { calcFee } from '../frontend/src/utils/math.js';

describe('calcFee one percent', () => {
  it('calculates fee from basis points', () => {
    expect(calcFee(10_000, 100)).toBe(100);
  });
});
