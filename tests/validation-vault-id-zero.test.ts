import { describe, expect, it } from 'vitest';
import { isValidVaultId } from '../frontend/src/utils/validation.js';

describe('isValidVaultId zero input', () => {
  it('rejects zero', () => {
    expect(isValidVaultId(0)).toBe(false);
  });
});
