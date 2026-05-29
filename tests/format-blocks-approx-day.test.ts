import { describe, expect, it } from 'vitest';
import { formatBlocksApprox } from '../frontend/src/utils/format.js';

describe('formatBlocksApprox one day', () => {
  it('rounds to one day', () => {
    expect(formatBlocksApprox(144)).toBe('~1 days');
  });
});
