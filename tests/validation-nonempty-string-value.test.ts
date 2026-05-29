import { describe, expect, it } from 'vitest';
import { isNonEmptyString } from '../frontend/src/utils/validation.js';

describe('isNonEmptyString content input', () => {
  it('accepts trimmed content', () => {
    expect(isNonEmptyString(' vault ')).toBe(true);
  });
});
