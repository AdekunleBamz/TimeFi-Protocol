import { describe, expect, it } from 'vitest';
import { formatBlockHeight } from '../frontend/src/utils/format.js';

describe('formatBlockHeight negative input', () => {
  it('uses the empty placeholder', () => {
    expect(formatBlockHeight(-1)).toBe('--');
  });
});
