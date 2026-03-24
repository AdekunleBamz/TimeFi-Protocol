/**
 * Application-wide constants
 */
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES, LOCK_PERIODS, MIN_DEPOSIT } from '../config/contracts';

// Network configuration
export const NETWORK = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  DEVNET: 'devnet',
};

<<<<<<< HEAD
export const CURRENT_NETWORK = (
  String(import.meta.env.VITE_NETWORK || NETWORK.MAINNET).trim().toLowerCase() === NETWORK.TESTNET
    ? NETWORK.TESTNET
    : NETWORK.MAINNET
);
const ACTIVE_NETWORK = CURRENT_NETWORK;

// Block time estimates (in seconds)
export const BLOCK_TIME = {
  MAINNET: 600, // ~10 minutes
  TESTNET: 120, // ~2 minutes
  DEVNET: 30,   // ~30 seconds
};
export const BLOCK_TIME_SECONDS = BLOCK_TIME.MAINNET;

// API endpoints
export const API_ENDPOINTS = {
  MAINNET: 'https://api.mainnet.hiro.so',
  TESTNET: 'https://api.testnet.hiro.so',
};

// Transaction fee defaults (in microSTX)
export const FEES = {
  DEFAULT: 2000,
  FAST: 5000,
  SLOW: 1000,
};

// STX denomination
export const STX = {
  MICRO: 1,
  MILLI: 1000,
  UNIT: 1_000_000,
};
export const MINIMUM_DEPOSIT = Math.floor(Number(MIN_DEPOSIT || 0) * STX.UNIT);

// Vault status codes
export const VAULT_STATUS = {
  ACTIVE: 'active',
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  WITHDRAWN: 'withdrawn',
  EMERGENCY: 'emergency',
};

// Error codes from contract
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

// UI constants
export const UI = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  SKELETON_COUNT: 3,
  MAX_VISIBLE_VAULTS: 10,
  PAGINATION_SIZE: 20,
};

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_SESSION: 'timefi_wallet_session',
  USER_PREFERENCES: 'timefi_preferences',
  RECENT_TRANSACTIONS: 'timefi_recent_txs',
  THEME: 'timefi_theme',
};

// External links
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

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};
