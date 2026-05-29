import { describe, expect, it } from 'vitest';
import { formatStxAmount } from '../frontend/src/utils/format.js';

describe('formatStxAmount null input', () => {
  it('returns zero STX', () => {
    expect(formatStxAmount(null)).toBe('0 STX');
  });
});
