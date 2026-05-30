import { describe, expect, it } from 'vitest';
import { formatBlockRange } from '../frontend/src/utils/format.js';

describe('formatBlockRange string values', () => {
  it('formats numeric string block inputs', () => {
    expect(formatBlockRange('1000', '144')).toBe('Block 1,000 → Block 1,144');
  });
});
