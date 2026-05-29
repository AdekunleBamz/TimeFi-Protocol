import { describe, expect, it } from 'vitest';
import { formatVaultStatus } from '../frontend/src/utils/format.js';

describe('formatVaultStatus uppercase input', () => {
  it('normalizes status casing', () => {
    expect(formatVaultStatus('ACTIVE')).toBe('Active');
  });
});
