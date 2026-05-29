import { describe, expect, it } from 'vitest';
import { formatSignedNumber } from '../frontend/src/utils/format.js';

describe('formatSignedNumber invalid input', () => {
  it('falls back to zero', () => {
    expect(formatSignedNumber('abc')).toBe('0');
  });
});
