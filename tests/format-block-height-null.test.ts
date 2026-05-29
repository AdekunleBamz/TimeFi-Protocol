import { describe, expect, it } from 'vitest';
import { formatBlockHeight } from '../frontend/src/utils/format.js';

describe('formatBlockHeight null input', () => {
  it('uses the empty placeholder', () => {
    expect(formatBlockHeight(null)).toBe('--');
  });
});
