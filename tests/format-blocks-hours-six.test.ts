import { describe, expect, it } from 'vitest';
import { formatBlocksToHours } from '../frontend/src/utils/format.js';

describe('formatBlocksToHours six blocks', () => {
  it('formats six blocks as one hour', () => {
    expect(formatBlocksToHours(6)).toBe('1.0');
  });
});
