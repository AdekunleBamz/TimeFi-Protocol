import { describe, expect, it } from 'vitest';
import { formatDuration } from '../frontend/src/utils/format.js';

describe('formatDuration minute and second output', () => {
  it('uses minute and second units for short durations', () => {
    expect(formatDuration(61)).toBe('1m 1s');
  });
});
