import { describe, expect, it } from 'vitest';
import { isValidMicroStx } from '../frontend/src/utils/validation.js';

describe('isValidMicroStx negative input', () => {
  it('rejects negative values', () => {
    expect(isValidMicroStx(-1)).toBe(false);
  });
});
