import { describe, expect, it } from 'vitest';
import { bpsToPercent } from '../frontend/src/utils/math.js';

describe('bpsToPercent conversion', () => {
  it('converts basis points to percent', () => {
    expect(bpsToPercent(50)).toBe(0.5);
  });
});
