import { describe, expect, it } from 'vitest';
import { formatDuration } from '../frontend/src/utils/format.js';

describe('formatDuration negative input', () => {
  it('formats negative durations by absolute value', () => {
    expect(formatDuration(-61)).toBe('1m 1s');
  });
});
