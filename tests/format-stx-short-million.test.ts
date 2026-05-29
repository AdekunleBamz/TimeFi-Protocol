import { describe, expect, it } from 'vitest';
import { formatStxShort } from '../frontend/src/utils/format.js';

describe('formatStxShort one STX', () => {
  it('formats one million microSTX', () => {
    expect(formatStxShort(1_000_000)).toBe('1.00 STX');
  });
});
