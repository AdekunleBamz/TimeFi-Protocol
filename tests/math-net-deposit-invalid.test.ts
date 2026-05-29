import { describe, expect, it } from 'vitest';
import { netDeposit } from '../frontend/src/utils/math.js';

describe('netDeposit invalid input', () => {
  it('falls back to zero for invalid amounts', () => {
    expect(netDeposit('abc', 50)).toBe(0);
  });
});
