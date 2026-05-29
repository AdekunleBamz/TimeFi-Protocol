import { describe, expect, it } from 'vitest';
import { formatBlocksToDays } from '../frontend/src/utils/format.js';

describe('formatBlocksToDays invalid input', () => {
  it('falls back to zero days', () => {
    expect(formatBlocksToDays('many')).toBe('0.0');
  });
});
