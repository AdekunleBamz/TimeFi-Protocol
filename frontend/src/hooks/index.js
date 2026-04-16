/**
 * TimeFi Custom Hooks - Centralized exports for all custom React hooks.
 *
 * This module provides a single import point for all reusable hooks
 * used throughout the TimeFi Protocol frontend application.
 *
 * Hooks are organized by category:
 * - Data fetching: useReadOnly, useContract, useAsync, useBlockHeight
 * - State management: useLocalStorage, usePrevious, useDebounce
 * - Timing: useInterval, useTimeout, usePolling
 * - UI utilities: useMediaQuery, useClickOutside, useFocusTrap
 *
 * @module hooks
 * @author adekunlebamz
 * @example
 * // Import specific hooks
 * import { useReadOnly, useBlockHeight, useLocalStorage } from './hooks';
 *
 * // Or import everything
 * import * as hooks from './hooks';
 * const { data } = hooks.useReadOnly('get-vault', [uintCV(1)]);
 */

// Data fetching
export { useReadOnly } from './useReadOnly';
export { useContract } from './useContract';
export { useAsync, useFetch } from './useAsync';
export { useBlockHeight } from './useBlockHeight';

// State management
export { useLocalStorage } from './useLocalStorage';
export { usePrevious, useValueChange, useHasChanged, useHistory, useUndoRedo } from './usePrevious';
export { useDebounce, useDebouncedCallback, useDebouncedValue } from './useDebounce';

// Timing
export { useInterval, useTimeout, usePolling } from './useInterval';

// UI utilities
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useBreakpoint, usePrefersDarkMode, usePrefersReducedMotion, useIsTouchDevice, useOrientation } from './useMediaQuery';
export { useClickOutside, useEscapeKey, useDismiss, useFocusTrap } from './useClickOutside';
