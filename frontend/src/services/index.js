/**
 * Services Index - Centralized exports for all TimeFi service modules.
 *
 * Provides a single import point for API calls, transaction building,
 * and storage operations used throughout the application.
 *
 * @module services
 * @author adekunlebamz
 * @example
 * // Import specific services
 * import { api, transactions, storage } from './services';
 *
 * // Or import everything
 * import * as services from './services';
 * const balance = await services.api.getAccountBalance(address);
 */

// API
export { default as api } from './api';
export {
  getBlockHeight,
  getAccountBalance,
  getAccountTransactions,
  getTransaction,
  callReadOnly,
  getVaultDetails,
  getUserVaults,
  getVaultCount,
  getPendingRewards,
} from './api';

// Transactions
export { default as transactions } from './transactions';
export {
  createVault,
  withdraw,
  emergencyWithdraw,
  claimRewards,
  approveBot,
  revokeBot,
  vote,
  estimateFee,
} from './transactions';

// Storage
export { default as storage } from './storage';
export {
  getItem,
  setItem,
  removeItem,
  hasItem,
  clearAll,
  StorageKeys,
  session,
  resetStorageAvailabilityCache,
} from './storage';
