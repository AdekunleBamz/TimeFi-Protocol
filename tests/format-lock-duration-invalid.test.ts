import { describe, expect, it } from 'vitest';
import { formatLockDuration } from '../frontend/src/utils/format.js';

describe('formatLockDuration invalid input', () => {
  it('uses the empty blocks label', () => {
    expect(formatLockDuration('later')).toBe('-- blocks');
  });
});
