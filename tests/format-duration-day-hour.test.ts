import { describe, expect, it } from 'vitest';
import { formatDuration } from '../frontend/src/utils/format.js';

describe('formatDuration day and hour output', () => {
  it('uses day and hour units for long durations', () => {
    expect(formatDuration(90000)).toBe('1d 1h');
  });
});
