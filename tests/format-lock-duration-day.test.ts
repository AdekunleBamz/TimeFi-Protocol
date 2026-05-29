import { describe, expect, it } from 'vitest';
import { formatLockDuration } from '../frontend/src/utils/format.js';

describe('formatLockDuration day input', () => {
  it('includes the approximate day count', () => {
    expect(formatLockDuration(144)).toBe('144 blocks (~1 days)');
  });
});
