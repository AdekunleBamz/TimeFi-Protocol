import { describe, expect, it } from 'vitest';
import { isUnlocked } from '../frontend/src/utils/math.js';

describe('isUnlocked threshold', () => {
  it('returns true at the unlock height', () => {
    expect(isUnlocked(10, 5, 15)).toBe(true);
  });
});
