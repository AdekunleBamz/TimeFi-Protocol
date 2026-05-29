import { describe, expect, it } from 'vitest';
import { stxToMicroStx } from '../frontend/src/utils/math.js';

describe('stxToMicroStx rounding', () => {
  it('rounds fractional microSTX output', () => {
    expect(stxToMicroStx(0.0000014)).toBe(1);
  });
});
