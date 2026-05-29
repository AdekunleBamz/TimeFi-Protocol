import { describe, expect, it } from 'vitest';
import { validateBotAddress } from '../frontend/src/utils/validation.js';

describe('validateBotAddress empty input', () => {
  it('requires a bot address', () => {
    expect(validateBotAddress('').valid).toBe(false);
  });
});
