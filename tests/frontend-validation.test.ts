import { describe, expect, it } from 'vitest';
import { validateLockPeriod } from '../frontend/src/utils/validation.js';

describe('frontend validation helpers', () => {
  it('accepts numeric-string lock period values', () => {
    expect(validateLockPeriod('6').valid).toBe(true);
  });
});
