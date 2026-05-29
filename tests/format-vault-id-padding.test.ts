import { describe, expect, it } from 'vitest';
import { formatVaultId } from '../frontend/src/utils/format.js';

describe('formatVaultId padding', () => {
  it('pads small vault ids', () => {
    expect(formatVaultId(7)).toBe('Vault #0007');
  });
});
