import { describe, expect, it } from 'vitest';
import { formatBlockHeight } from '../frontend/src/utils/format.js';

describe('formatBlockHeight decimal input', () => {
  it('floors fractional heights', () => {
    expect(formatBlockHeight(12.9)).toBe('12');
  });
});
