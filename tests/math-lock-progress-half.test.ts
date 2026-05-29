import { describe, expect, it } from 'vitest';
import { lockProgress } from '../frontend/src/utils/math.js';

describe('lockProgress halfway', () => {
  it('returns fifty percent at the midpoint', () => {
    expect(lockProgress(10, 10, 15)).toBe(50);
  });
});
