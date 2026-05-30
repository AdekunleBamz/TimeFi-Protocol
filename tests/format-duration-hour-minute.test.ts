import { describe, expect, it } from 'vitest';
import { formatDuration } from '../frontend/src/utils/format.js';

describe('formatDuration hour and minute output', () => {
  it('uses hour and minute units for mid-length durations', () => {
    expect(formatDuration(3660)).toBe('1h 1m');
  });
});
