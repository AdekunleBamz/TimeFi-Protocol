import { describe, expect, it } from 'vitest';
import { truncateAddress } from '../frontend/src/utils/format.js';

describe('truncateAddress long input', () => {
  it('keeps the visible ends', () => {
    expect(truncateAddress('SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N')).toBe('SP3FKN...GG6N');
  });
});
