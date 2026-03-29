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
    /** 1 month lock (4320 blocks) with 1% APY multiplier */
    MONTH_1: { label: '1 Month', blocks: 4320, apy: 1 },
    /** 3 months lock (12960 blocks) with 3% APY multiplier */
    MONTH_3: { label: '3 Months', blocks: 12960, apy: 3 },
    /** 6 months lock (25920 blocks) with 6% APY multiplier */
    MONTH_6: { label: '6 Months', blocks: 25920, apy: 6 },
    /** 9 months lock (38880 blocks) with 9% APY multiplier */
    MONTH_9: { label: '9 Months', blocks: 38880, apy: 9 },
    /** 1 year lock (52560 blocks) with 12% APY multiplier */
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
