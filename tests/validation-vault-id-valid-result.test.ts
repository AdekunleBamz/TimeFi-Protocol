import { describe, expect, it } from 'vitest';
import { validateVaultId } from '../frontend/src/utils/validation.js';

describe('validateVaultId valid result', () => {
  it('accepts positive whole numbers', () => {
    expect(validateVaultId(1).valid).toBe(true);
  });
});
