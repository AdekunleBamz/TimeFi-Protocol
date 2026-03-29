"use strict";

/**
 * Protocol Constants
 */

/**
 * The deployed contract address for the TimeFi Protocol.
 * @constant {string}
 */
export const CONTRACT_ADDRESS = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKT2A0ZDJB58';

/**
 * Object containing contract name identifiers used in the protocol.
 * @constant {Object}
 */
export const CONTRACT_NAMES = {
    VAULT: 'timefi-vault-v-A2',
    REWARDS: 'timefi-rewards-v-A2',
    GOVERNANCE: 'timefi-governance-v-A2',
    EMERGENCY: 'timefi-emergency-v-A2',
};

/**
 * Predefined lock periods and their corresponding APY/multiplier values.
 * @constant {Object}
 */
export const LOCK_PERIODS = {
    MONTH_1: { label: '1 Month', blocks: 4320, apy: 1 },
    MONTH_3: { label: '3 Months', blocks: 12960, apy: 3 },
    MONTH_6: { label: '6 Months', blocks: 25920, apy: 6 },
    MONTH_9: { label: '9 Months', blocks: 38880, apy: 9 },
    YEAR_1: { label: '1 Year', blocks: 52560, apy: 12 },
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
