import { describe, expect, it } from 'vitest';
import { blocksToDays } from '../frontend/src/utils/math.js';

describe('blocksToDays conversion', () => {
  it('converts 144 blocks to one day', () => {
    expect(blocksToDays(144)).toBe(1);
  });
});
