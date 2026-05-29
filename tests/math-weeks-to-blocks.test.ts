import { describe, expect, it } from 'vitest';
import { weeksToBlocks } from '../frontend/src/utils/math.js';

describe('weeksToBlocks conversion', () => {
  it('uses 1008 blocks per week', () => {
    expect(weeksToBlocks(1)).toBe(1008);
  });
});
