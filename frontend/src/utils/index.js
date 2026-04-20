/**
 * Utils Index - Centralized exports for all TimeFi utility functions.
 *
 * Provides a single import point for formatting, validation,
 * accessibility, and constant utilities used throughout the application.
 *
 * @module utils
 * @author adekunlebamz
 * @example
 * // Import specific utilities
 * import { formatSTX, validateAddress, Keys } from './utils';
 *
 * // Or import everything
 * import * as utils from './utils';
 * utils.formatSTX(1000000); // "1.00"
 */

// Formatting
export { 
  formatSTX, 
  formatAddress, 
  formatRelativeTime, 
  formatDate, 
  formatBlockHeight, 
  formatNumber, 
  formatPercent 
} from './format';

// Validation
export { 
  validateNonEmptyString,
  validateAddress, 
  validateVaultId, 
  validateDepositAmount,
  validateLockPeriod,
  validateVaultCreation,
  validateWithdrawal,
  validateBotAddress,
} from './validation';

// Constants
export { 
  NETWORK,
  CONTRACT_ADDRESS, 
  CONTRACT_NAMES, 
  STACKS_NETWORK, 
  MINIMUM_LOCK_BLOCKS, 
  MAXIMUM_LOCK_BLOCKS, 
  MINIMUM_DEPOSIT,
  BLOCK_TIME_SECONDS,
  getBlockTimeForNetwork,
  isKnownErrorCode,
} from './constants';

// Accessibility
export {
  srOnlyStyles,
  announceToScreenReader,
  clearScreenReaderAnnouncements,
  generateId,
  Keys,
  isActivationKey,
  handleListNavigation,
  getFocusableElements,
  trapFocus,
} from './accessibility';
