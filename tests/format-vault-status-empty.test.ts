import { describe, expect, it } from 'vitest';
import { formatVaultStatus } from '../frontend/src/utils/format.js';

describe('formatVaultStatus empty input', () => {
  it('returns an empty label', () => {
    expect(formatVaultStatus('')).toBe('');
  });
});
