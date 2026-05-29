import { describe, expect, it } from 'vitest';
import { isValidBlockCount } from '../frontend/src/utils/validation.js';

describe('isValidBlockCount string input', () => {
  it('accepts whole-number strings', () => {
    expect(isValidBlockCount('144')).toBe(true);
  });
});
