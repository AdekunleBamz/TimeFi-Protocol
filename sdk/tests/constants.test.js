import { describe, expect, it } from 'vitest';

import { CONTRACT_NAMES, MIN_DEPOSIT } from '../src/constants.js';

describe('SDK constants', () => {
  it('targets the active vault contract name', () => {
    expect(CONTRACT_NAMES.VAULT).toBe('timefi-vault-v-A2');
  });

  it('matches the live contract minimum deposit', () => {
    expect(MIN_DEPOSIT).toBe(10_000);
  });
});
