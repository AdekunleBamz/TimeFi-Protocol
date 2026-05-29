import { describe, expect, it } from 'vitest';
import { meetsMinDeposit } from '../frontend/src/utils/math.js';

describe('meetsMinDeposit threshold', () => {
  it('accepts values at the minimum', () => {
    expect(meetsMinDeposit(100, 100)).toBe(true);
  });
});
