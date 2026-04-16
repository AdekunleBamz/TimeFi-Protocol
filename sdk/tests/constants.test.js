import { describe, expect, it } from 'vitest';

import { CONTRACT_NAMES, LOCK_PERIODS, MIN_DEPOSIT } from '../src/constants.js';

describe('SDK constants', () => {
  it('targets the active vault contract name', () => {
    expect(CONTRACT_NAMES.VAULT).toBe('timefi-vault-v-A2');
  });

  it('matches the live contract minimum deposit', () => {
    expect(MIN_DEPOSIT).toBe(10_000);
  });

  it('uses block-based lock presets that fit the live contract', () => {
    expect(LOCK_PERIODS).toEqual({
      MONTH_1: 4320,
      MONTH_3: 12960,
      MONTH_6: 25920,
      MONTH_9: 38880,
      YEAR_1: 52560,
      YEAR_2: 105120,
    });
  });
});
