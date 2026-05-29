import { describe, expect, it } from 'vitest';
import { isValidMicroStx } from '../frontend/src/utils/validation.js';

describe('isValidMicroStx zero input', () => {
  it('accepts zero microSTX', () => {
    expect(isValidMicroStx(0)).toBe(true);
  });
});
