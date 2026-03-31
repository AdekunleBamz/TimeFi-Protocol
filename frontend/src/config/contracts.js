/**
 * Contract Configuration - TimeFi smart contract settings.
 *
 * Re-exports core contract constants from timefi-sdk and defines
 * frontend-specific configuration values.
 *
 * @module config/contracts
 */

/**
 * @typedef {Object} ContractConstants
 * @property {string} CONTRACT_ADDRESS - Main vault contract address
 * @property {Object} CONTRACT_NAMES - Named contract identifiers
 * @property {Object} LOCK_PERIODS - Available lock period options
 * @property {number} MIN_DEPOSIT - Minimum deposit amount in microSTX
 * @property {number} MAX_DEPOSIT - Maximum deposit amount in microSTX
 */

export {
    CONTRACT_ADDRESS,
    CONTRACT_NAMES,
    LOCK_PERIODS,
    MIN_DEPOSIT,
    MAX_DEPOSIT
} from 'timefi-sdk';

/**
 * FEE_BPS - Protocol fee in basis points.
 * 1 basis point = 0.01%, so 50 bps = 0.5%
 * @type {number}
 */
export const FEE_BPS = 50;

export default {
    FEE_BPS,
};
