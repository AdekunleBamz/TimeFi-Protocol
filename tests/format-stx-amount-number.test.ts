import { describe, expect, it } from 'vitest';
import { formatStxAmount } from '../frontend/src/utils/format.js';

describe('formatStxAmount numeric input', () => {
  it('adds the STX suffix', () => {
    expect(formatStxAmount(1500)).toBe('1,500 STX');
  });
});
