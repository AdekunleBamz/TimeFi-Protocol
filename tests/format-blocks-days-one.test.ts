import { describe, expect, it } from 'vitest';
import { formatBlocksToDays } from '../frontend/src/utils/format.js';

describe('formatBlocksToDays one day', () => {
  it('formats 144 blocks as one day', () => {
    expect(formatBlocksToDays(144)).toBe('1.0');
  });
});
