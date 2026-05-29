import { describe, expect, it } from 'vitest';
import { isValidFeeBps } from '../frontend/src/utils/math.js';

describe('isValidFeeBps zero input', () => {
  it('accepts zero basis points', () => {
    expect(isValidFeeBps(0)).toBe(true);
  });
});
