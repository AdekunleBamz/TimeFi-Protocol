import { describe, expect, it } from 'vitest';
import { formatTxId } from '../frontend/src/utils/format.js';

describe('formatTxId long input', () => {
  it('keeps the first eight and last four characters', () => {
    expect(formatTxId('abcdef1234567890')).toBe('abcdef12…7890');
  });
});
