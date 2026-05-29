import { describe, expect, it } from 'vitest';
import { isValidBlockCount } from '../frontend/src/utils/math.js';

describe('isValidBlockCount zero input', () => {
  it('rejects zero blocks', () => {
    expect(isValidBlockCount(0)).toBe(false);
  });
});
