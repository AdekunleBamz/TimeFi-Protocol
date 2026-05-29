import { describe, expect, it } from 'vitest';
import { isValidBps } from '../frontend/src/utils/validation.js';

describe('isValidBps zero input', () => {
  it('accepts zero basis points', () => {
    expect(isValidBps(0)).toBe(true);
  });
});
