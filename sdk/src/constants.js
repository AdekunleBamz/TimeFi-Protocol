"use strict";

/**
 * TimeFi Protocol Constants
 *
 * Centralized configuration values and constants used throughout
 * the TimeFi SDK for interacting with the protocol on Stacks.
 *
 * @module constants
 */

/**
 * The deployed contract address for the TimeFi Protocol on mainnet.
 *
 * This address is used as the primary contract interface for all
 * protocol interactions including vault operations and queries.
 *
 * @constant {string}
 * @example
 * console.log(CONTRACT_ADDRESS);
 * // 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9'
 */
export const CONTRACT_ADDRESS = 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9';

/**
 * Contract name identifiers for all TimeFi Protocol contracts.
 *
 * Each contract serves a specific function within the protocol ecosystem.
 *
 * @constant {Object}
 * @property {string} VAULT - Main vault contract for time-locked deposits
 * @property {string} REWARDS - Rewards distribution contract
 * @property {string} GOVERNANCE - Protocol governance and voting contract
 * @property {string} EMERGENCY - Emergency pause and recovery contract
 * @example
 * console.log(CONTRACT_NAMES.VAULT);
 * // 'timefi-vault-v-A2'
 */
export const CONTRACT_NAMES = Object.freeze({
    VAULT: 'timefi-vault-v-A2',
    REWARDS: 'timefi-rewards-v-A2',
    GOVERNANCE: 'timefi-governance-v-A2',
    EMERGENCY: 'timefi-emergency-v-A2',
});

/**
 * Standard lock period options available for vault creation.
 *
 * Lock periods are defined in blocks to match the live vault contract.
 * With ~10 minute Stacks blocks, these map closely to the named durations.
 *
 * @constant {Object}
 * @property {number} MONTH_1 - 30 days (4,320 blocks)
 * @property {number} MONTH_3 - 90 days (12,960 blocks)
 * @property {number} MONTH_6 - 180 days (25,920 blocks)
 * @property {number} MONTH_9 - 270 days (38,880 blocks)
 * @property {number} YEAR_1 - 365 days (52,560 blocks)
 * @property {number} YEAR_2 - 730 days (105,120 blocks)
 * @example
 * console.log(LOCK_PERIODS.MONTH_1);
 * // 4320 (30 days in blocks)
 */
export const LOCK_PERIODS = Object.freeze({
    MONTH_1: 4320,
    MONTH_3: 12960,
    MONTH_6: 25920,
    MONTH_9: 38880,
    YEAR_1: 52560,
    YEAR_2: 105120,
});

/**
 * Clarity response type identifiers for contract call results.
 *
 * Used to determine if a contract call returned an OK or ERR response.
 *
 * @constant {Object}
 * @property {number} OK - Success response type identifier (7)
 * @property {number} ERR - Error response type identifier (8)
 */
export const RESPONSE_TYPES = Object.freeze({
    OK: 7,
    ERR: 8,
});

/**
 * Average time between Stacks mainnet blocks in seconds.
 *
 * This is an approximation used for time-lock calculations.
 * Actual block times may vary based on network conditions.
 *
 * @constant {number}
 * @example
 * const blocksInDay = 86400 / STACKS_BLOCK_TIME;
 * console.log(`Blocks per day: ${blocksInDay}`); // ~144
 */
export const STACKS_BLOCK_TIME = 600;

/**
 * Number of microSTX in one STX token.
 *
 * STX uses 6 decimal places, similar to satoshis for Bitcoin.
 * All on-chain amounts are represented in microSTX.
 *
 * @constant {number}
 * @example
 * const microStx = 1.5 * MICROSTX_IN_STX;
 * console.log(microStx); // 1500000
 */
export const MICROSTX_IN_STX = 1_000_000;

/**
 * Minimum deposit amount required to create a vault.
 *
 * Calculated as the live contract minimum of 10,000 microSTX.
 * Deposits below this amount will be rejected by the contract.
 *
 * @constant {number}
 * @example
 * console.log(MIN_DEPOSIT);
 * // 10000 (0.01 STX in microSTX)
 */
export const MIN_DEPOSIT = 10_000;

/**
 * Maximum deposit amount allowed for a single vault.
 *
 * Calculated as 1,000,000 STX converted to microSTX.
 * Deposits above this amount will be rejected by the contract.
 *
 * @constant {number}
 * @example
 * console.log(MAX_DEPOSIT);
 * // 1000000000000 (1M STX in microSTX)
 */
export const MAX_DEPOSIT = 1_000_000 * MICROSTX_IN_STX;

/**
 * Approximate number of Stacks blocks produced per day on mainnet.
 * Based on the 600-second average block time (144 blocks per day).
 *
 * @constant {number}
 */
export const BLOCKS_PER_DAY = Math.round(86400 / STACKS_BLOCK_TIME);

/**
 * Protocol fee in basis points (0.5%).
 * Matches the on-chain FEE_BPS constant in the vault contract.
 *
 * @constant {number}
 */
export const FEE_BPS = 50;

/**
 * Minimum lock duration in blocks accepted by the vault contract.
 * Equivalent to approximately 1 hour on mainnet.
 *
 * @constant {number}
 */
export const MIN_LOCK_BLOCKS = 6;

/**
 * Maximum lock duration in blocks accepted by the vault contract.
 * Equivalent to approximately 1 year on mainnet.
 *
 * @constant {number}
 */
export const MAX_LOCK_BLOCKS = 52560;

/**
 * Human-readable labels for supported Stacks network identifiers.
 *
 * @constant {Object}
 * @property {string} mainnet - Label for mainnet
 * @property {string} testnet - Label for testnet
 * @property {string} devnet  - Label for local devnet
 */
export const STACKS_NETWORK_NAMES = Object.freeze({
    mainnet: 'Mainnet',
    testnet: 'Testnet',
    devnet: 'Devnet',
});
