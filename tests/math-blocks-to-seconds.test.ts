import { describe, expect, it } from 'vitest';
import { blocksToSeconds } from '../frontend/src/utils/math.js';

describe('blocksToSeconds conversion', () => {
  it('uses six hundred seconds per block', () => {
    expect(blocksToSeconds(2)).toBe(1200);
  });
});
