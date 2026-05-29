import { describe, expect, it } from 'vitest';
import { formatPct } from '../frontend/src/utils/format.js';

describe('formatPct half ratio', () => {
  it('formats half as fifty percent', () => {
    expect(formatPct(0.5)).toBe('50.0%');
  });
});
