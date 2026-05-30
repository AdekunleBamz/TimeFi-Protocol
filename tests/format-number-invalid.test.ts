import { describe, expect, it } from 'vitest';
import { formatNumber } from '../frontend/src/utils/format.js';

describe('formatNumber invalid input', () => {
  it('falls back to zero for non-numeric values', () => {
    expect(formatNumber('not-a-number')).toBe('0');
  });
});
