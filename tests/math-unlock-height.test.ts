import { describe, expect, it } from 'vitest';
import { unlockHeight } from '../frontend/src/utils/math.js';

describe('unlockHeight calculation', () => {
  it('adds deposit height and lock period', () => {
    expect(unlockHeight(10, 5)).toBe(15);
  });
});
