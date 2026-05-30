import { describe, expect, it } from 'vitest';
import { formatErrorCode } from '../frontend/src/utils/format.js';

describe('formatErrorCode string input', () => {
  it('formats numeric strings as error labels', () => {
    expect(formatErrorCode('104')).toBe('Error #104');
  });
});
