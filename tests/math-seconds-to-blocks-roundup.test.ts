import { describe, expect, it } from 'vitest';
import { secondsToBlocks } from '../frontend/src/utils/math.js';

describe('secondsToBlocks rounding', () => {
  it('rounds partial blocks up', () => {
    expect(secondsToBlocks(601)).toBe(2);
  });
});
