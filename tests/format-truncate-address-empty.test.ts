import { describe, expect, it } from 'vitest';
import { truncateAddress } from '../frontend/src/utils/format.js';

describe('truncateAddress empty input', () => {
  it('returns an empty label', () => {
    expect(truncateAddress('')).toBe('');
  });
});
