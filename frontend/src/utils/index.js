/**
 * Utils exports index
 * Centralized exports for all utility functions
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
  isValidAddress, 
  isValidAmount, 
  validateVaultInput, 
  ValidationError 
} from './validation';

// Constants
export { 
  CONTRACT_ADDRESS, 
  CONTRACT_NAMES, 
  STACKS_NETWORK, 
  MINIMUM_LOCK_BLOCKS, 
  MAXIMUM_LOCK_BLOCKS, 
  MINIMUM_DEPOSIT,
  BLOCK_TIME_SECONDS 
} from './constants';

// Accessibility
export {
  srOnlyStyles,
  announceToScreenReader,
  generateId,
  Keys,
  isActivationKey,
  handleListNavigation,
  getFocusableElements,
  trapFocus,
} from './accessibility';
