import { describe, expect, it } from 'vitest';
import { isPositiveNumber } from '../frontend/src/utils/validation.js';

describe('isPositiveNumber string input', () => {
  it('accepts positive numeric strings', () => {
    expect(isPositiveNumber('1')).toBe(true);
  });
});
