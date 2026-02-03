/**
 * TimeFi Protocol Contract Configuration
 * Mainnet v-A2 deployment addresses and constants
 */

export const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

export const CONTRACTS = {
  vault: {
    name: 'timefi-vault-v-A2',
    address: CONTRACT_ADDRESS,
  },
  rewards: {
    name: 'timefi-rewards-v-A2',
    address: CONTRACT_ADDRESS,
  },
  governance: {
    name: 'timefi-governance-v-A2',
    address: CONTRACT_ADDRESS,
  },
  emergency: {
    name: 'timefi-emergency-v-A2',
    address: CONTRACT_ADDRESS,
  },
};

// Lock periods in blocks (~10min per block on Stacks)
export const LOCK_PERIODS = {
  HOUR_1: 6,
  DAY_1: 144,
  WEEK_1: 1008,
  MONTH_1: 4320,
  MONTH_3: 12960,
  MONTH_6: 25920,
  MONTH_9: 38880,
  YEAR_1: 52560,
};

// Reward APY percentages by tier
export const REWARD_TIERS = {
  MONTH_1: 1,
  MONTH_3: 3,
  MONTH_6: 6,
  MONTH_9: 9,
  YEAR_1: 12,
};

// Protocol constants
export const MIN_DEPOSIT = 100000; // 0.1 STX in microSTX
export const FEE_BPS = 50; // 0.5%
export const EMERGENCY_PENALTY_BPS = 2500; // 25%

// Network configuration
export const NETWORK_CONFIG = {
  network: 'mainnet',
  explorerUrl: 'https://explorer.stacks.co',
  apiUrl: 'https://api.mainnet.hiro.so',
};
