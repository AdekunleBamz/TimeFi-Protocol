import { describe, expect, it } from 'vitest';

import { TimeFiClient } from '../src/client.js';

describe('TimeFiClient vault helpers', () => {
  it('reads the vault owner from getVault', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVault = async () => ({ owner: 'SP123', amount: 99_500 });

    await expect(client.getVaultOwner(1)).resolves.toBe('SP123');
  });

  it('reads the vault amount from getVault', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVault = async () => ({ owner: 'SP123', amount: 99_500 });

    await expect(client.getVaultAmount(1)).resolves.toBe(99_500);
  });

  it('reads the unlock block from getVault', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVault = async () => ({ 'unlock-time': 52_560, 'lock-time': 6 });

    await expect(client.getUnlockBlock(1)).resolves.toBe(52_560);
  });

  it('reads the creation block from getVault', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVault = async () => ({ 'unlock-time': 52_560, 'lock-time': 6 });

    await expect(client.getCreatedAt(1)).resolves.toBe(6);
  });
});
