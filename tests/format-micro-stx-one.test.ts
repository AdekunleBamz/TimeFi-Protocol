import { describe, expect, it } from 'vitest';
import { formatMicroStx } from '../frontend/src/utils/format.js';

describe('formatMicroStx one microSTX', () => {
  it('preserves six decimal places', () => {
    expect(formatMicroStx(1)).toBe('0.000001');
  });
});
