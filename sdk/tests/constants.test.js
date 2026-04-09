import { describe, expect, it } from 'vitest';

import { CONTRACT_NAMES } from '../src/constants.js';

describe('SDK constants', () => {
  it('targets the active vault contract name', () => {
    expect(CONTRACT_NAMES.VAULT).toBe('timefi-vault-v-A2');
  });
});
