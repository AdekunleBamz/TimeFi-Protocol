import { describe, expect, it } from 'vitest';
import { formatSignedNumber } from '../frontend/src/utils/format.js';

describe('formatSignedNumber negative input', () => {
  it('keeps the negative sign without adding a plus', () => {
    expect(formatSignedNumber(-7)).toBe('-7');
  });
});
