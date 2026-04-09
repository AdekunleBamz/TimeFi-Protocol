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
export const CONTRACT_NAMES = {
    VAULT: 'timefi-vault-v-A2',
    REWARDS: 'timefi-rewards-v-A2',
    GOVERNANCE: 'timefi-governance-v-A2',
    EMERGENCY: 'timefi-emergency-v-A2',
};

/**
 * Standard lock period options available for vault creation.
 *
 * Lock periods are defined in seconds and represent the minimum
 * time funds must remain locked in a vault before withdrawal.
 *
 * @constant {Object}
 * @property {number} MONTH_1 - 30 days (2,592,000 seconds)
 * @property {number} MONTH_3 - 90 days (7,776,000 seconds)
 * @property {number} MONTH_6 - 180 days (15,552,000 seconds)
 * @property {number} MONTH_9 - 270 days (23,328,000 seconds)
 * @property {number} YEAR_1 - 365 days (31,536,000 seconds)
 * @example
 * console.log(LOCK_PERIODS.MONTH_1);
 * // 2592000 (30 days in seconds)
 */
export const LOCK_PERIODS = {
    MONTH_1: 2592000,
    MONTH_3: 7776000,
    MONTH_6: 15552000,
    MONTH_9: 23328000,
    YEAR_1: 31536000,
};

/**
 * Clarity response type identifiers for contract call results.
 *
 * Used to determine if a contract call returned an OK or ERR response.
 *
 * @constant {Object}
 * @property {number} OK - Success response type identifier (7)
 * @property {number} ERR - Error response type identifier (8)
 */
export const RESPONSE_TYPES = {
    OK: 7,
    ERR: 8,
};

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
 * Calculated as 1 STX converted to microSTX.
 * Deposits below this amount will be rejected by the contract.
 *
 * @constant {number}
 * @example
 * console.log(MIN_DEPOSIT);
 * // 1000000 (1 STX in microSTX)
 */
export const MIN_DEPOSIT = 1 * MICROSTX_IN_STX;

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
