import { describe, expect, it } from 'vitest';
import { formatBps } from '../frontend/src/utils/format.js';

describe('formatBps fee basis points', () => {
  it('formats fifty basis points as half a percent', () => {
    expect(formatBps(50)).toBe('0.50%');
  });
});
