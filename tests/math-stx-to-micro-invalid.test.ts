import { describe, expect, it } from 'vitest';
import { stxToMicroStx } from '../frontend/src/utils/math.js';

describe('stxToMicroStx invalid input', () => {
  it('falls back to zero', () => {
    expect(stxToMicroStx('abc')).toBe(0);
  });
});
