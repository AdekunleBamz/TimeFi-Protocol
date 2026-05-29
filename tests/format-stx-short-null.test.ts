import { describe, expect, it } from 'vitest';
import { formatStxShort } from '../frontend/src/utils/format.js';

describe('formatStxShort null input', () => {
  it('returns zero STX', () => {
    expect(formatStxShort(null)).toBe('0.00 STX');
  });
});
