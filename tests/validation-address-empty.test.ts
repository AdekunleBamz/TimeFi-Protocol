import { describe, expect, it } from 'vitest';
import { validateAddress } from '../frontend/src/utils/validation.js';

describe('validateAddress empty input', () => {
  it('requires an address', () => {
    expect(validateAddress('').valid).toBe(false);
  });
});
