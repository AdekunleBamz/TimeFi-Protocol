/**
 * Application Constants - Centralized configuration values for TimeFi.
 *
 * Contains network settings, block times, API endpoints, fee defaults,
 * error codes, UI settings, and external links used throughout the app.
 *
 * @module utils/constants
 */
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES, LOCK_PERIODS, MIN_DEPOSIT } from '../config/contracts';

/**
 * Network environment identifiers
 * @enum {string}
 */
const NETWORK = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
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
const ACTIVE_NETWORK = CURRENT_NETWORK;

/**
 * BLOCK_TIME - Estimated block times for different networks (in seconds).
 * @type {Object.<string, number>}
 */
export const BLOCK_TIME = {
  MAINNET: 600, // ~10 minutes
  TESTNET: 120, // ~2 minutes
  DEVNET: 30,   // ~30 seconds
};
export const BLOCK_TIME_SECONDS = BLOCK_TIME.MAINNET;

/**
 * API_ENDPOINTS - Hiro API endpoints for different networks.
 * @type {Object.<string, string>}
 */
export const API_ENDPOINTS = {
  MAINNET: 'https://api.mainnet.hiro.so',
  TESTNET: 'https://api.testnet.hiro.so',
};

/**
 * FEES - Default transaction fee estimates (in microSTX).
 * @type {Object.<string, number>}
 */
export const FEES = {
  DEFAULT: 2000,
  FAST: 5000,
  SLOW: 1000,
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
export const MINIMUM_DEPOSIT = Math.floor(Number(MIN_DEPOSIT || 0) * STX.UNIT);

/**
 * VAULT_STATUS - Possible vault lifecycle states.
 * @type {Object.<string, string>}
 */
export const VAULT_STATUS = {
  ACTIVE: 'active',
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  WITHDRAWN: 'withdrawn',
  EMERGENCY: 'emergency',
};

/**
 * ERROR_CODES - Clarity contract error code mappings.
 * @type {Object.<number, string>}
 */
export const ERROR_CODES = {
  100: 'Owner only',
  101: 'Not found',
  102: 'Already exists',
  103: 'Unauthorized',
  104: 'Invalid amount',
  105: 'Invalid period',
  106: 'Still locked',
  107: 'Already withdrawn',
  108: 'Insufficient balance',
  109: 'Emergency mode active',
  110: 'Bot not approved',
  111: 'Cooldown active',
  112: 'Max vaults reached',
};

/**
 * UI - User interface configuration constants.
 * @type {Object.<string, number>}
 */
export const UI = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  SKELETON_COUNT: 3,
  MAX_VISIBLE_VAULTS: 10,
  PAGINATION_SIZE: 20,
};

/**
 * STORAGE_KEYS - Standardized localStorage key prefixes.
 * @type {Object.<string, string>}
 */
export const STORAGE_KEYS = {
  WALLET_SESSION: 'timefi_wallet_session',
  USER_PREFERENCES: 'timefi_preferences',
  RECENT_TRANSACTIONS: 'timefi_recent_txs',
  THEME: 'timefi_theme',
};

/**
 * LINKS - External resource URLs for TimeFi ecosystem.
 * @type {Object.<string, string>}
 */
export const LINKS = {
  DOCS: 'https://docs.timefi.io',
  GITHUB: 'https://github.com/AdekunleBamz/TimeFi-Protocol',
  TWITTER: 'https://twitter.com/timefi_protocol',
  DISCORD: 'https://discord.gg/timefi',
  EXPLORER: 'https://explorer.hiro.so',
};

const lockPeriods = Object.values(LOCK_PERIODS || {})
  .map((period) => Number(period?.blocks))
  .filter((value) => Number.isFinite(value) && value > 0);
export const MINIMUM_LOCK_BLOCKS = lockPeriods.length ? Math.min(...lockPeriods) : 0;
export const MAXIMUM_LOCK_BLOCKS = lockPeriods.length ? Math.max(...lockPeriods) : 0;

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
