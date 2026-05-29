import { describe, expect, it } from 'vitest';
import { clamp } from '../frontend/src/utils/math.js';

describe('clamp lower bound', () => {
  it('returns the minimum for low values', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
});
