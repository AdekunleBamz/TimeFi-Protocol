import { describe, expect, it } from 'vitest';
import { formatPct } from '../frontend/src/utils/format.js';

describe('formatPct invalid input', () => {
  it('surfaces invalid percentage inputs as NaN', () => {
    expect(formatPct('bad')).toBe('NaN%');
  });
});
