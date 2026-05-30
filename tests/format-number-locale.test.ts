import { describe, expect, it } from 'vitest';
import { formatNumber } from '../frontend/src/utils/format.js';

describe('formatNumber locale output', () => {
  it('adds locale separators to large values', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});
