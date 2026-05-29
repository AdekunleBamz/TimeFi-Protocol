import { describe, expect, it } from 'vitest';
import { isValidBlockCount } from '../frontend/src/utils/math.js';

describe('isValidBlockCount string input', () => {
  it('accepts whole-number strings', () => {
    expect(isValidBlockCount('6')).toBe(true);
  });
});
