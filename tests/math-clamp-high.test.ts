import { describe, expect, it } from 'vitest';
import { clamp } from '../frontend/src/utils/math.js';

describe('clamp upper bound', () => {
  it('returns the maximum for high values', () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
});
