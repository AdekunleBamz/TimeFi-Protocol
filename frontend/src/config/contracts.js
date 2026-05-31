import { env } from './env';
import {
    LOCK_PERIODS,
    MIN_DEPOSIT,
    MAX_DEPOSIT
} from 'timefi-sdk';

/**
 * @typedef {Object} ContractConstants
 * @property {string} CONTRACT_ADDRESS - Main vault contract address
 * @property {Object} CONTRACT_NAMES - Named contract identifiers
 * @property {Object} LOCK_PERIODS - Available lock period options
 * @property {number} MIN_DEPOSIT - Minimum deposit amount in microSTX
 * @property {number} MAX_DEPOSIT - Maximum deposit amount in microSTX
 */

export const CONTRACT_ADDRESS = env.contractAddress;

export const CONTRACT_NAMES = Object.freeze({
    VAULT: env.contracts.vault,
    REWARDS: env.contracts.rewards,
    GOVERNANCE: env.contracts.governance,
    EMERGENCY: env.contracts.emergency,
});

export {
    LOCK_PERIODS,
    MIN_DEPOSIT,
    MAX_DEPOSIT
};

export const FEE_BPS = 50;

export default {
    CONTRACT_ADDRESS,
    CONTRACT_NAMES,
    LOCK_PERIODS,
    MIN_DEPOSIT,
    MAX_DEPOSIT,
    FEE_BPS,
};
