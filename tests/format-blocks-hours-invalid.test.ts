import { describe, expect, it } from 'vitest';
import { formatBlocksToHours } from '../frontend/src/utils/format.js';

describe('formatBlocksToHours invalid input', () => {
  it('falls back to zero hours', () => {
    expect(formatBlocksToHours('many')).toBe('0.0');
  });
});
