import { describe, expect, it } from 'vitest';
import { lockProgress } from '../frontend/src/utils/math.js';

describe('lockProgress zero period', () => {
  it('treats zero-length locks as complete', () => {
    expect(lockProgress(10, 0, 10)).toBe(100);
  });
});
