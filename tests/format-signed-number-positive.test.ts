import { describe, expect, it } from 'vitest';
import { formatSignedNumber } from '../frontend/src/utils/format.js';

describe('formatSignedNumber positive input', () => {
  it('adds an explicit plus sign', () => {
    expect(formatSignedNumber(7)).toBe('+7');
  });
});
