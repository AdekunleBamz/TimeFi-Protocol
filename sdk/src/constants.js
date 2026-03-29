"use strict";

/**
 * Protocol Constants
 */

/**
 * The deployed contract address for the TimeFi Protocol.
 * @constant {string}
 */
export const CONTRACT_ADDRESS = 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9';

/**
 * Object containing contract name identifiers used in the protocol.
 * @constant {Object}
 */
export const CONTRACT_NAMES = {
    VAULT: 'timefi-vault-v1',
    REWARDS: 'timefi-rewards-v-A2',
    GOVERNANCE: 'timefi-governance-v-A2',
    EMERGENCY: 'timefi-emergency-v-A2',
};

/**
 * Protocol lock period constants in seconds.
 * @constant {Object}
 */
export const LOCK_PERIODS = {
    MONTH_1: 2592000,
    MONTH_3: 7776000,
    MONTH_6: 15552000,
    MONTH_9: 23328000,
    YEAR_1: 31536000,
};

/**
 * API response type constants.
 * @constant {Object}
 */
export const RESPONSE_TYPES = {
    OK: 7,
    ERR: 8,
};

/**
 * Minimum deposit amount allowed in microSTX.
 * @constant {number}
 */
export const MIN_DEPOSIT = 0.01;
/**
 * Maximum deposit amount allowed in microSTX (1,000,000 STX).
 * @constant {number}
 */
export const MAX_DEPOSIT = 1000000;
