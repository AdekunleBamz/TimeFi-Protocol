import { describe, expect, it } from 'vitest';
import { cvToValue } from '@stacks/transactions';

import { TimeFiClient } from '../src/client.js';
import { CONTRACT_ADDRESS, CONTRACT_NAMES } from '../src/constants.js';

describe('TimeFiClient vault helpers', () => {
  it('rejects unsupported network names', () => {
    expect(() => new TimeFiClient('devnet')).toThrow('Invalid network type');
  });

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

  it('rejects negative lock duration in APY helper', async () => {
    const client = new TimeFiClient('mainnet');

    await expect(client.getVaultApy(-1)).rejects.toThrow('Lock duration must be greater than 0');
  });

  it('reads protocol config from emergency status', async () => {
    const client = new TimeFiClient('mainnet');
    client.getEmergencyStatus = async () => ({ version: '1.0.0', paused: false });

    await expect(client.getProtocolConfig()).resolves.toStrictEqual({ version: '1.0.0', paused: false });
  });

  it('returns active contract metadata', () => {
    const client = new TimeFiClient('mainnet');

    expect(client.getContractMetadata()).toStrictEqual({
      address: CONTRACT_ADDRESS,
      name: CONTRACT_NAMES.VAULT
    });
  });

  it('combines protocol stats with block height', async () => {
    const client = new TimeFiClient('mainnet');
    client.getProtocolStats = async () => ({ tvl: 1_000, count: 4 });
    client.getBlockHeight = async () => 88;

    await expect(client.getProtocolMetrics()).resolves.toStrictEqual({
      tvl: 1_000,
      count: 4,
      blockHeight: 88
    });
  });

  it('adds vault count to account summaries', async () => {
    const client = new TimeFiClient('mainnet');
    client.getAccountData = async (address) => ({ address, nonce: 1, balance: 500, vaults: [1, 2, 3] });

    await expect(client.getAccountSummary('SP123')).resolves.toMatchObject({
      address: 'SP123',
      vaultCount: 3
    });
  });

  it('combines account summary with protocol vitals', async () => {
    const client = new TimeFiClient('mainnet');
    client.getAccountSummary = async (address) => ({ address, vaultCount: 2 });
    client.getProtocolVitals = async () => ({ paused: false, tvl: 900 });

    await expect(client.getAccountOverview('SP123')).resolves.toStrictEqual({
      address: 'SP123',
      vaultCount: 2,
      protocol: { paused: false, tvl: 900 }
    });
  });

  it('reads account vitals through the account overview alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getAccountOverview = async (address) => ({ address, protocol: { paused: false } });

    await expect(client.getAccountVitals('SP123')).resolves.toStrictEqual({
      address: 'SP123',
      protocol: { paused: false }
    });
  });

  it('reads account balance through the STX balance alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getSTXBalance = async (address) => `${address}:500`;

    await expect(client.getAccountBalance('SP123')).resolves.toBe('SP123:500');
  });

  it('combines metrics metadata and config in protocol data', async () => {
    const client = new TimeFiClient('mainnet');
    client.getProtocolMetrics = async () => ({ tvl: 200, count: 2 });
    client.getContractMetadata = () => ({ address: 'SP-CONTRACT', name: 'timefi-vault' });
    client.getProtocolConfig = async () => ({ paused: false });

    await expect(client.getProtocolData()).resolves.toStrictEqual({
      tvl: 200,
      count: 2,
      metadata: { address: 'SP-CONTRACT', name: 'timefi-vault' },
      paused: false
    });
  });

  it('returns compact protocol data summary', async () => {
    const client = new TimeFiClient('mainnet');
    client.getProtocolMetrics = async () => ({ tvl: 200, count: 2 });
    client.getContractMetadata = () => ({ address: 'SP-CONTRACT', name: 'timefi-vault' });

    await expect(client.getProtocolDataSummary()).resolves.toStrictEqual({
      tvl: 200,
      count: 2,
      contract: 'SP-CONTRACT'
    });
  });

  it('combines pause status and TVL in protocol vitals', async () => {
    const client = new TimeFiClient('mainnet');
    client.getEmergencyStatus = async () => ({ version: '1.0.0', paused: false });
    client.getTVL = async () => 900;

    await expect(client.getProtocolVitals()).resolves.toStrictEqual({
      version: '1.0.0',
      paused: false,
      tvl: 900
    });
  });

  it('reads protocol vault count through the vault count alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultCount = async () => 12;

    await expect(client.getProtocolVaultCount()).resolves.toBe(12);
  });

  it('returns zero as the last vault id when no vaults exist', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultCount = async () => 0;

    await expect(client.getLastVaultId()).resolves.toBe(0);
  });

  it('returns vault count as the latest vault id', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultCount = async () => 9;

    await expect(client.getLastVaultId()).resolves.toBe(9);
  });

  it('reads account nonce through the nonce alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getNonce = async (address) => `${address}:nonce`;

    await expect(client.getAccountNonce('SP123')).resolves.toBe('SP123:nonce');
  });

  it('combines TVL and vault count in protocol stats', async () => {
    const client = new TimeFiClient('mainnet');
    client.getTVL = async () => 1_500;
    client.getVaultCount = async () => 6;

    await expect(client.getProtocolStats()).resolves.toStrictEqual({
      tvl: 1_500,
      count: 6
    });
  });

  it('reads account STX balance through the explicit alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getSTXBalance = async (address) => `${address}:stx`;

    await expect(client.getAccountSTXBalance('SP123')).resolves.toBe('SP123:stx');
  });

  it('reads block height through the protocol block height alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getBlockHeight = async () => 12345;

    await expect(client.getProtocolBlockHeight()).resolves.toBe(12345);
  });

  it('loads vault ids for every owner index', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultsByOwnerCount = async () => 3;
    client.getVaultIdByOwnerIndex = async (_owner, index) => index + 10;

    await expect(client.getVaultsByOwner('SP123')).resolves.toStrictEqual([10, 11, 12]);
  });

  it('returns an empty list when an owner has no vaults', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultsByOwnerCount = async () => 0;

    await expect(client.getVaultsByOwner('SP123')).resolves.toStrictEqual([]);
  });

  it('reads account vault count through owner count alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getVaultsByOwnerCount = async (address) => `${address}:vaults`;

    await expect(client.getAccountVaultCount('SP123')).resolves.toBe('SP123:vaults');
  });

  it('combines nonce balance and vault ids in account data', async () => {
    const client = new TimeFiClient('mainnet');
    client.getNonce = async () => 2;
    client.getSTXBalance = async () => 800;
    client.getVaultsByOwner = async () => [4, 5];

    await expect(client.getAccountData('SP123')).resolves.toStrictEqual({
      address: 'SP123',
      nonce: 2,
      balance: 800,
      vaults: [4, 5]
    });
  });

  it('combines version and paused state in emergency status', async () => {
    const client = new TimeFiClient('mainnet');
    client.getProtocolVersion = async () => '1.0.1';
    client.isPaused = async () => false;

    await expect(client.getEmergencyStatus()).resolves.toStrictEqual({
      version: '1.0.1',
      paused: false
    });
  });

  it('reads protocol TVL through the TVL alias', async () => {
    const client = new TimeFiClient('mainnet');
    client.getTVL = async () => 42_000;

    await expect(client.getProtocolTVL()).resolves.toBe(42_000);
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

  it('routes global vault index lookups to the expected read-only function', async () => {
    const client = new TimeFiClient('mainnet');
    client.callReadOnly = async (functionName) => functionName;

    await expect(client.getVaultIdByIndex(0)).resolves.toBe('get-vault-id-by-index');
  });

  it('rejects invalid owner index when reading vault by owner index', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getVaultIdByOwnerIndex('SP123', -1)).rejects.toThrow('Index must be a non-negative integer');
  });

  it('routes owner vault index lookups to the expected read-only function', async () => {
    const client = new TimeFiClient('mainnet');
    client.callReadOnly = async (functionName) => functionName;

    await expect(client.getVaultIdByOwnerIndex('SP123', 0)).resolves.toBe('get-vault-id-by-owner-index');
  });

  it('rejects blank account addresses', async () => {
    const client = new TimeFiClient('mainnet');
    await expect(client.getNonce('   ')).rejects.toThrow('Address is required');
    await expect(client.getSTXBalance('')).rejects.toThrow('Address is required');
  });

  it('routes nonce lookups to the expected read-only function', async () => {
    const client = new TimeFiClient('mainnet');
    client.callReadOnly = async (functionName) => functionName;

    await expect(client.getNonce('SP123')).resolves.toBe('get-nonce');
  });

  it('routes STX balance lookups to the expected read-only function', async () => {
    const client = new TimeFiClient('mainnet');
    client.callReadOnly = async (functionName) => functionName;

    await expect(client.getSTXBalance('SP123')).resolves.toBe('get-stx-balance');
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

  it('builds create options for the create-vault function', () => {
    const client = new TimeFiClient('mainnet');
    const options = client.getCreateVaultOptions(1, 6);

    expect(options.functionName).toBe('create-vault');
  });

  it('targets the active vault contract in create options', () => {
    const client = new TimeFiClient('mainnet');
    const options = client.getCreateVaultOptions(1, 6);

    expect(options.contractName).toBe(CONTRACT_NAMES.VAULT);
  });

  it('targets the configured contract address in create options', () => {
    const client = new TimeFiClient('mainnet');
    const options = client.getCreateVaultOptions(1, 6);

    expect(options.contractAddress).toBe(CONTRACT_ADDRESS);
  });

  it('encodes create lock duration as a uint argument', () => {
    const client = new TimeFiClient('mainnet');
    const options = client.getCreateVaultOptions(1, 6);

    expect(cvToValue(options.functionArgs[1])).toBe(6n);
  });

  it('accepts bigint lock durations in create options', () => {
    const client = new TimeFiClient('mainnet');
    const options = client.getCreateVaultOptions(1, 6n);

    expect(cvToValue(options.functionArgs[1])).toBe(6n);
  });

  it('rejects invalid STX amount values in create options', () => {
    const client = new TimeFiClient('mainnet');
    expect(() => client.getCreateVaultOptions(0, 6)).toThrow('Amount must be greater than 0 STX');
    expect(() => client.getCreateVaultOptions('not-a-number', 6)).toThrow('Amount must be greater than 0 STX');
  });

  it('rejects unsafe STX amount values in create options', () => {
    const client = new TimeFiClient('mainnet');

    expect(() => client.getCreateVaultOptions(Number.MAX_SAFE_INTEGER, 6)).toThrow('Amount must be a valid STX value');
  });

  it('rejects invalid lock duration values in create options', () => {
    const client = new TimeFiClient('mainnet');
    expect(() => client.getCreateVaultOptions(1, 0)).toThrow('Lock duration must be a positive integer');
    expect(() => client.getCreateVaultOptions(1, -1)).toThrow('Lock duration must be a positive integer');
    expect(() => client.getCreateVaultOptions(1, 1.5)).toThrow('Lock duration must be a positive integer');
  });

  it('builds withdraw options for the request-withdraw function', () => {
    const client = new TimeFiClient('mainnet');
    const options = client.getWithdrawOptions(3);

    expect(options.functionName).toBe('request-withdraw');
  });

  it('encodes withdraw vault id as a uint argument', () => {
    const client = new TimeFiClient('mainnet');
    const options = client.getWithdrawOptions(3);

    expect(cvToValue(options.functionArgs[0])).toBe(3n);
  });

  it('rejects invalid vault ids in withdraw options', () => {
    const client = new TimeFiClient('mainnet');

    expect(() => client.getWithdrawOptions(0)).toThrow('Vault ID must be a positive integer');
  });
});
