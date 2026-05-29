import { describe, expect, it } from 'vitest';
import { calcFee } from '../frontend/src/utils/math.js';

describe('calcFee negative bps', () => {
  it('falls back to zero', () => {
    expect(calcFee(1000, -1)).toBe(0);
  });
});
