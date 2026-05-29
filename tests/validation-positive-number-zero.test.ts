import { describe, expect, it } from 'vitest';
import { isPositiveNumber } from '../frontend/src/utils/validation.js';

describe('isPositiveNumber zero input', () => {
  it('rejects zero', () => {
    expect(isPositiveNumber(0)).toBe(false);
  });
});
