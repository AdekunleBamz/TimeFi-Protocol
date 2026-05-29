import { describe, expect, it } from 'vitest';
import { microStxToStx } from '../frontend/src/utils/math.js';

describe('microStxToStx null input', () => {
  it('falls back to zero', () => {
    expect(microStxToStx(null)).toBe(0);
  });
});
