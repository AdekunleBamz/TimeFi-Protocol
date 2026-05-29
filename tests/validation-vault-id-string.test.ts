import { describe, expect, it } from 'vitest';
import { isValidVaultId } from '../frontend/src/utils/validation.js';

describe('isValidVaultId string input', () => {
  it('accepts positive integer strings', () => {
    expect(isValidVaultId('1')).toBe(true);
  });
});
