import { describe, expect, it } from 'vitest';
import { formatFeeAmount } from '../frontend/src/utils/format.js';

describe('formatFeeAmount string input', () => {
  it('formats numeric string fees with locale separators', () => {
    expect(formatFeeAmount('5000')).toBe('5,000 uSTX');
  });
});
