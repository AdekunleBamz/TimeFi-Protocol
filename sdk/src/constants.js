/**
 * Protocol Constants
 */

export const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

export const CONTRACT_NAMES = {
    VAULT: 'timefi-vault-v-A2',
    REWARDS: 'timefi-rewards-v-A2',
    GOVERNANCE: 'timefi-governance-v-A2',
    EMERGENCY: 'timefi-emergency-v-A2',
};

export const LOCK_PERIODS = {
    MONTH_1: { label: '1 Month', blocks: 4320, apy: 1 },
    MONTH_3: { label: '3 Months', blocks: 12960, apy: 3 },
    MONTH_6: { label: '6 Months', blocks: 25920, apy: 6 },
    MONTH_9: { label: '9 Months', blocks: 38880, apy: 9 },
    YEAR_1: { label: '1 Year', blocks: 52560, apy: 12 },
};

export const MIN_DEPOSIT = 0.01;
export const MAX_DEPOSIT = 1000000;
