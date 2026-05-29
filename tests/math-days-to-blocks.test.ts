import { describe, expect, it } from 'vitest';
import { daysToBlocks } from '../frontend/src/utils/math.js';

describe('daysToBlocks conversion', () => {
  it('uses 144 blocks per day', () => {
    expect(daysToBlocks(2)).toBe(288);
  });
});
