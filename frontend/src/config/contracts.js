/**
 * Contract Configuration - Stacks smart contract addresses and names.
 *
 * Provides centralized configuration for all smart contract interactions,
 * including contract addresses, names, and network-specific settings.
 *
 * @module config/contracts
 * @author adekunlebamz
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

export const FEE_BPS = 50;

export default {
    FEE_BPS,
};
