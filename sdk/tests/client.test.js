import { describe, expect, it } from 'vitest';
import { cvToValue } from '@stacks/transactions';

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

  it('reads vault balance through the amount alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultAmount = async (id) => id * 1_000;

    await expect(client.getVaultBalance(9)).resolves.toBe(9_000);
  });

  it('reads the unlock block from getVault', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVault = async () => ({ 'unlock-time': 52_560, 'lock-time': 6 });

    await expect(client.getUnlockBlock(1)).resolves.toBe(52_560);
  });

  it('reads unlock block through the vault unlock block alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getUnlockBlock = async (id) => id + 100;

    await expect(client.getVaultUnlockBlock(2)).resolves.toBe(102);
  });

  it('reads unlock height through the vault unlock height alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getUnlockBlock = async (id) => id + 200;

    await expect(client.getVaultUnlockHeight(4)).resolves.toBe(204);
  });

  it('reads the creation block from getVault', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVault = async () => ({ 'unlock-time': 52_560, 'lock-time': 6 });

    await expect(client.getCreatedAt(1)).resolves.toBe(6);
  });

  it('reads creation block through the vault creation alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getCreatedAt = async (id) => id + 50;

    await expect(client.getVaultCreationBlock(8)).resolves.toBe(58);
  });

  it('computes the vault duration from the vault timing fields', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVault = async () => ({ 'unlock-time': 52_560, 'lock-time': 6 });

    await expect(client.getVaultDuration(1)).resolves.toBe(52_554);
  });

  it('reads lock period through the vault duration alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultDuration = async (id) => id * 10;

    await expect(client.getVaultLockPeriod(6)).resolves.toBe(60);
  });

  it('treats zero time remaining as expired', async () => {
    const client = new TimeFiClient('mainnet');
    client.getTimeRemaining = async () => 0;

    await expect(client.isExpired(1)).resolves.toBe(true);
  });

  it('reports active status while time remains', async () => {
    const client = new TimeFiClient('mainnet');
    client.isActive = async () => true;
    client.getTimeRemaining = async () => 24;

    await expect(client.getVaultStatus(1)).resolves.toBe('Active');
  });

  it('reports expired status when no time remains', async () => {
    const client = new TimeFiClient('mainnet');
    client.isActive = async () => true;
    client.getTimeRemaining = async () => 0;

    await expect(client.getVaultStatus(1)).resolves.toBe('Expired');
  });

  it('reads vault state through the status alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultStatus = async (id) => `status-${id}`;

    await expect(client.getVaultState(7)).resolves.toBe('status-7');
  });

  it('reads active state through the vault-active alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.isActive = async (id) => id === 3;

    await expect(client.isVaultActive(3)).resolves.toBe(true);
  });

  it('reads expiry state through the vault-expired alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.isExpired = async (id) => id === 5;

    await expect(client.isVaultExpired(5)).resolves.toBe(true);
  });

  it('combines vault fields in vault summaries', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultDetails = async (id) => ({ id, owner: 'SP123', amount: 500, duration: 12, status: 'Active' });
    client.getTimeRemaining = async () => 9;
    client.getCreatedAt = async () => 3;
    client.getUnlockBlock = async () => 15;

    await expect(client.getVaultSummary(2)).resolves.toMatchObject({
      id: 2,
      owner: 'SP123',
      timeRemaining: 9,
      createdAt: 3,
      unlockBlock: 15
    });
  });

  it('adds expiry state to extended vault details', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultSummary = async (id) => ({ id, status: 'Expired' });
    client.isExpired = async () => true;

    await expect(client.getVaultDetailsExtended(2)).resolves.toStrictEqual({
      id: 2,
      status: 'Expired',
      expired: true
    });
  });

  it('combines immutable fields in vault static data', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultOwner = async () => 'SP123';
    client.getCreatedAt = async () => 10;
    client.getVaultDuration = async () => 90;

    await expect(client.getVaultStaticData(4)).resolves.toStrictEqual({
      id: 4,
      owner: 'SP123',
      createdAt: 10,
      duration: 90
    });
  });

  it('calculates vault age from current block height', async () => {
    const client = new TimeFiClient('mainnet');
    client.getCreatedAt = async () => 40;
    client.getBlockHeight = async () => 55;

    await expect(client.getVaultAge(1)).resolves.toBe(15);
  });

  it('clamps vault age before creation height', async () => {
    const client = new TimeFiClient('mainnet');
    client.getCreatedAt = async () => 60;
    client.getBlockHeight = async () => 55;

    await expect(client.getVaultAge(1)).resolves.toBe(0);
  });

  it('calculates remaining blocks until unlock', async () => {
    const client = new TimeFiClient('mainnet');
    client.getUnlockBlock = async () => 100;
    client.getBlockHeight = async () => 70;

    await expect(client.getVaultRemainingBlocks(1)).resolves.toBe(30);
  });

  it('clamps remaining blocks after unlock height', async () => {
    const client = new TimeFiClient('mainnet');
    client.getUnlockBlock = async () => 100;
    client.getBlockHeight = async () => 120;

    await expect(client.getVaultRemainingBlocks(1)).resolves.toBe(0);
  });

  it('returns the placeholder APY for positive lock durations', async () => {
    const client = new TimeFiClient('mainnet');

    await expect(client.getVaultApy(3600)).resolves.toBe(5);
  });

  it('rejects zero lock duration in APY helper', async () => {
    const client = new TimeFiClient('mainnet');

    await expect(client.getVaultApy(0)).rejects.toThrow('Lock duration must be greater than 0');
  });

  it('rejects missing vault ids early', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getVault(undefined)).rejects.toThrow('Vault ID is required');
  });

  it('rejects non-positive vault ids', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getVault(0)).rejects.toThrow('Vault ID must be a positive integer');
    await expect(client.getVault(-4)).rejects.toThrow('Vault ID must be a positive integer');
  });

  it('rejects non-integer vault ids', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getVault(1.2)).rejects.toThrow('Vault ID must be a positive integer');
    await expect(client.getVault('abc')).rejects.toThrow('Vault ID must be a positive integer');
  });

  it('rejects missing index when reading vault by index', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getVaultIdByIndex(undefined)).rejects.toThrow('Index is required');
  });

  it('rejects invalid index when reading vault by index', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getVaultIdByIndex(-1)).rejects.toThrow('Index must be a non-negative integer');
    await expect(client.getVaultIdByIndex(1.5)).rejects.toThrow('Index must be a non-negative integer');
    await expect(client.getVaultIdByIndex('abc')).rejects.toThrow('Index must be a non-negative integer');
  });

  it('rejects invalid owner index when reading vault by owner index', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getVaultIdByOwnerIndex('SP123', -1)).rejects.toThrow('Index must be a non-negative integer');
  });

  it('rejects blank account addresses', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getNonce('   ')).rejects.toThrow('Address is required');
    await expect(client.getSTXBalance('')).rejects.toThrow('Address is required');
  });

  it('rejects blank owner addresses', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getVaultsByOwner('   ')).rejects.toThrow('Owner address is required');
    await expect(client.getVaultIdByOwnerIndex('', 0)).rejects.toThrow('Owner address is required');
  });

  it('converts decimal STX amounts to microSTX for create options', () => {
    const client = new TimeFiClient('mainnet');
    const options = client.getCreateVaultOptions(0.010001, 6);
    expect(cvToValue(options.functionArgs[0])).toBe(10001n);
  });

  it('rejects invalid STX amount values in create options', () => {
    const client = new TimeFiClient('mainnet');
    expect(() => client.getCreateVaultOptions(0, 6)).toThrow('Amount must be greater than 0 STX');
    expect(() => client.getCreateVaultOptions('not-a-number', 6)).toThrow('Amount must be greater than 0 STX');
  });

  it('rejects invalid lock duration values in create options', () => {
    const client = new TimeFiClient('mainnet');
    expect(() => client.getCreateVaultOptions(1, 0)).toThrow('Lock duration must be a positive integer');
    expect(() => client.getCreateVaultOptions(1, -1)).toThrow('Lock duration must be a positive integer');
    expect(() => client.getCreateVaultOptions(1, 1.5)).toThrow('Lock duration must be a positive integer');
  });
});
