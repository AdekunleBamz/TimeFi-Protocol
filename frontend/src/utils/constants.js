/**
 * Constants - Application-wide constant values.
 *
 * Provides centralized configuration values used throughout
 * the application for consistent behavior.
 *
 * @module utils/constants
 * @author adekunlebamz
 */
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES, LOCK_PERIODS, MIN_DEPOSIT } from '../config/contracts';

/**
 * Network environment identifiers.
 *
 * Defines the supported network types for the TimeFi Protocol.
 *
 * @enum {string}
 * @property {string} MAINNET - Stacks mainnet network
 * @property {string} TESTNET - Stacks testnet network
 */
export const NETWORK = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  DEVNET: 'devnet',
};

/**
 * CURRENT_NETWORK - Active network based on environment variable.
 * @type {string}
 */
export const CURRENT_NETWORK = (
  String(import.meta.env.VITE_NETWORK || NETWORK.MAINNET).trim().toLowerCase() === NETWORK.TESTNET
    ? NETWORK.TESTNET
    : NETWORK.MAINNET
);
/**
 * ACTIVE_NETWORK - Alias for CURRENT_NETWORK used internally.
 * @type {string}
 */
const ACTIVE_NETWORK = CURRENT_NETWORK;

/**
 * BLOCK_TIME - Estimated block times for different networks (in seconds).
 * @type {Object.<string, number>}
 */
export const BLOCK_TIME = {
  MAINNET: 600, // ~10 minutes
  TESTNET: 120, // ~2 minutes
  DEVNET: 30,   // ~30 seconds
  AVERAGE: 600, // alias for mainnet default
};
/**
 * BLOCK_TIME_SECONDS - Default block time in seconds (mainnet).
 * Used as the fallback for time calculations.
 * @type {number}
 */
export const BLOCK_TIME_SECONDS = BLOCK_TIME.MAINNET;

/**
 * getBlockTimeForNetwork - Get block time estimate (seconds) for a network key.
 * @param {string} network - Network name (mainnet/testnet/devnet)
 * @returns {number} Block time in seconds
 */
export function getBlockTimeForNetwork(network) {
  const normalized = String(network || '').trim().toLowerCase();
  if (normalized === NETWORK.TESTNET) return BLOCK_TIME.TESTNET;
  if (normalized === NETWORK.DEVNET) return BLOCK_TIME.DEVNET;
  return BLOCK_TIME.MAINNET;
}

/**
 * API_ENDPOINTS - Hiro API endpoints for different networks.
 * @type {Object.<string, string>}
 */
export const API_ENDPOINTS = {
  MAINNET: 'https://api.mainnet.hiro.so',
  TESTNET: 'https://api.testnet.hiro.so',
  DEVNET: 'http://localhost:3999',
};

/**
 * FEES - Default transaction fee estimates (in microSTX).
 * @type {Object.<string, number>}
 */
export const FEES = {
  DEFAULT: 2500,
  FAST: 6000,
  NORMAL: 3500,
  SLOW: 1200,
};

/**
 * STX - STX token denomination multipliers.
 * @type {Object.<string, number>}
 */
export const STX = {
  MICRO: 1,
  MILLI: 1000,
  UNIT: 1_000_000,
};
/**
 * MINIMUM_DEPOSIT - Minimum vault deposit amount in microSTX.
 * Mirrors the MIN_DEPOSIT constant from the contract.
 * @type {number}
 */
export const MINIMUM_DEPOSIT = Number(MIN_DEPOSIT || 0);

/**
 * VAULT_STATUS - Possible vault lifecycle states.
 * @type {Object.<string, string>}
 */
export const VAULT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  WITHDRAWN: 'withdrawn',
  EMERGENCY: 'emergency',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

/**
 * ERROR_CODES - Clarity contract error code mappings.
 * @type {Object.<number, string>}
 */
export const ERROR_CODES = {
  100: 'Unauthorized',
  101: 'Not found',
  102: 'Inactive vault',
  103: 'Invalid amount',
  104: 'Invalid lock period',
  105: 'Already exists',
  106: 'Bot not approved',
  107: 'No beneficiary set',
  108: 'Same owner',
  109: 'Protocol paused',
};

/**
 * UI - User interface configuration constants.
 * @type {Object.<string, number>}
 */
export const UI = {
  TOAST_DURATION: 4000,
  DEBOUNCE_DELAY: 350,
  SKELETON_COUNT: 3,
  MAX_VISIBLE_VAULTS: 10,
  PAGINATION_SIZE: 20,
  TOOLTIP_DELAY: 500,
  MAX_RETRY_ATTEMPTS: 3,
};

/**
 * STORAGE_KEYS - Standardized localStorage key prefixes.
 * @type {Object.<string, string>}
 */
export const STORAGE_KEYS = {
  WALLET_SESSION: 'timefi_wallet_session',
  USER_PREFERENCES: 'timefi_preferences',
  RECENT_TRANSACTIONS: 'timefi_recent_txs',
  NOTIFICATIONS: 'timefi_notifications',
  THEME: 'timefi_theme',
};

/**
 * LINKS - External resource URLs for TimeFi ecosystem.
 * @type {Object.<string, string>}
 */
export const LINKS = {
  DOCS: 'https://docs.timefi.io',
  GITHUB: 'https://github.com/AdekunleBamz/TimeFi-Protocol',
  BLOG: 'https://blog.timefi.io',
  TWITTER: 'https://twitter.com/timefi_protocol',
  DISCORD: 'https://discord.gg/timefi',
  EXPLORER: 'https://explorer.hiro.so',
};

/**
 * lockPeriods - Derived array of valid lock period block counts.
 * Extracted from LOCK_PERIODS configuration, filtered for valid numbers.
 * @type {number[]}
 */
const lockPeriods = Object.values(LOCK_PERIODS || {})
  .map((period) => Number(period?.blocks))
  .filter((value) => Number.isFinite(value) && value > 0);

/**
 * MINIMUM_LOCK_BLOCKS - Minimum lock period in blocks.
 * Derived from configured lock periods, defaults to 0 if none.
 * @type {number}
 */
export const MINIMUM_LOCK_BLOCKS = lockPeriods.length ? Math.min(...lockPeriods) : 0;

/**
 * MAXIMUM_LOCK_BLOCKS - Maximum lock period in blocks.
 * Derived from configured lock periods, defaults to 0 if none.
 * @type {number}
 */
export const MAXIMUM_LOCK_BLOCKS = lockPeriods.length ? Math.max(...lockPeriods) : 0;

/**
 * STACKS_NETWORK - Configured Stacks network instance.
 * Initialized based on the active network environment.
 * @type {StacksMainnet | StacksTestnet}
 */
export const STACKS_NETWORK = ACTIVE_NETWORK === NETWORK.MAINNET
  ? new StacksMainnet()
  : new StacksTestnet();

export { CONTRACT_ADDRESS, CONTRACT_NAMES };

/**
 * ANIMATION - Standard animation durations (in milliseconds).
 * @type {Object.<string, number>}
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};
