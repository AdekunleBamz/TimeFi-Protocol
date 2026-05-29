import { describe, expect, it } from 'vitest';
import { formatBps } from '../frontend/src/utils/format.js';

describe('formatBps null input', () => {
  it('returns the zero percent label', () => {
    expect(formatBps(null)).toBe('0.00%');
  });
});
