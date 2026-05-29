import { describe, expect, it } from 'vitest';
import { calcNetAmount } from '../frontend/src/utils/math.js';

describe('calcNetAmount fee deduction', () => {
  it('subtracts the basis point fee', () => {
    expect(calcNetAmount(10_000, 100)).toBe(9_900);
  });
});
