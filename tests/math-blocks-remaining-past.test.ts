import { describe, expect, it } from 'vitest';
import { blocksRemaining } from '../frontend/src/utils/math.js';

describe('blocksRemaining matured vault', () => {
  it('does not return negative blocks', () => {
    expect(blocksRemaining(10, 5, 20)).toBe(0);
  });
});
