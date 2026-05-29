import { describe, expect, it } from 'vitest';
import { isNonEmptyString } from '../frontend/src/utils/validation.js';

describe('isNonEmptyString whitespace input', () => {
  it('rejects whitespace-only strings', () => {
    expect(isNonEmptyString('   ')).toBe(false);
  });
});
