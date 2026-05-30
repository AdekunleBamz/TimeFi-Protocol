import { describe, expect, it } from 'vitest';
import { formatTxId } from '../frontend/src/utils/format.js';

describe('formatTxId short input', () => {
  it('leaves short transaction ids unchanged', () => {
    expect(formatTxId('abc123')).toBe('abc123');
  });
});
