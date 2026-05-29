import { describe, expect, it } from 'vitest';
import { formatMicroStx } from '../frontend/src/utils/format.js';

describe('formatMicroStx null input', () => {
  it('returns zero precision output', () => {
    expect(formatMicroStx(null)).toBe('0.000000');
  });
});
