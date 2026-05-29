import { describe, expect, it } from 'vitest';
import { validateLockPeriod } from '../frontend/src/utils/validation.js';

describe('validateLockPeriod null input', () => {
  it('requires a lock period', () => {
    expect(validateLockPeriod(null).valid).toBe(false);
  });
});
