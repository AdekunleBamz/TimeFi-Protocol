import { describe, expect, it } from 'vitest';
import { microStxToStx } from '../frontend/src/utils/math.js';

describe('microStxToStx one STX', () => {
  it('converts one million microSTX', () => {
    expect(microStxToStx(1_000_000)).toBe(1);
  });
});
