/**
 * Storage Service - Persistent data management with localStorage fallback.
 *
 * Provides a safe, type-aware storage API with automatic JSON serialization,
 * in-memory fallback when localStorage is unavailable, and namespaced keys.
 *
 * @module services/storage
 * @author adekunlebamz
 */

const STORAGE_PREFIX = 'timefi_';
let storageAvailableCache = null;

/**
 * isStorageAvailable - Check if localStorage is available in the current environment.
 * @returns {boolean} True if localStorage is accessible, false otherwise
 */
function isStorageAvailable() {
  if (storageAvailableCache !== null) {
    return storageAvailableCache;
  }

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    storageAvailableCache = true;
    return storageAvailableCache;
  } catch (e) {
    storageAvailableCache = false;
    return storageAvailableCache;
  }
}

/**
 * resetStorageAvailabilityCache - Reset the cached storage availability check.
 * Useful for testing or when storage permissions may have changed.
 */
export function resetStorageAvailabilityCache() {
  storageAvailableCache = null;
}

/**
 * memoryStorage - In-memory fallback when localStorage is unavailable.
 * @type {Map<string, any>}
 */
const memoryStorage = new Map();

/**
 * safeJsonParse - Safely parse JSON with a default fallback.
 * @param {string} value - JSON string to parse
 * @param {any} [defaultValue=null] - Value to return on parse failure
 * @returns {any} Parsed value or default
 */
function safeJsonParse(value, defaultValue = null) {
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

/**
 * normalizeKey - Add storage prefix to key and validate.
 * @param {string} key - Raw storage key
 * @returns {string} Prefixed key
 * @throws {Error} If key is empty or not a string
 */
function normalizeKey(key) {
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('storage key must be a non-empty string');
  }
  return STORAGE_PREFIX + key;
}

/**
 * getItem - Retrieve a value from storage.
 * @param {string} key - Storage key (without prefix)
 * @param {any} [defaultValue=null] - Value to return if key not found
 * @returns {any} Stored value or default
 */
export function getItem(key, defaultValue = null) {
  const prefixedKey = normalizeKey(key);
  
  try {
    if (isStorageAvailable()) {
      const item = window.localStorage.getItem(prefixedKey);
      return item ? safeJsonParse(item, defaultValue) : defaultValue;
    }
    return memoryStorage.get(prefixedKey) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * setItem - Store a value in storage.
 * @param {string} key - Storage key (without prefix)
 * @param {any} value - Value to store (will be JSON serialized)
 */
export function setItem(key, value) {
  const prefixedKey = normalizeKey(key);
  
  try {
    if (isStorageAvailable()) {
      window.localStorage.setItem(prefixedKey, JSON.stringify(value));
    } else {
      memoryStorage.set(prefixedKey, value);
    }
  } catch {
    memoryStorage.set(prefixedKey, value);
  }
}

/**
 * removeItem - Remove an item from storage.
 * @param {string} key - Storage key (without prefix)
 */
export function removeItem(key) {
  const prefixedKey = normalizeKey(key);
  
  try {
    if (isStorageAvailable()) {
      window.localStorage.removeItem(prefixedKey);
    }
    memoryStorage.delete(prefixedKey);
  } catch {
    // Ignore error
  }
}

/**
 * clearAll - Remove all TimeFi-prefixed items from storage.
 * Also clears the in-memory fallback storage.
 */
export function clearAll() {
  try {
    if (isStorageAvailable()) {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          window.localStorage.removeItem(key);
        }
      });
    }
    memoryStorage.clear();
  } catch {
    // Ignore error
  }
}

/**
 * StorageKeys - Standardized storage key constants for the application.
 * Use these to ensure consistent key naming across the codebase.
 */
export const StorageKeys = {
  THEME: 'theme',
  WALLET_ADDRESS: 'wallet_address',
  LAST_CONNECTED: 'last_connected',
  FAVORITE_VAULTS: 'favorite_vaults',
  NOTIFICATION_SETTINGS: 'notification_settings',
  USER_PREFERENCES: 'user_preferences',
  CACHED_VAULTS: 'cached_vaults',
  CACHED_BLOCK_HEIGHT: 'cached_block_height',
};

/**
 * session - Session storage utilities with automatic JSON serialization.
 * Data stored here is cleared when the browser tab is closed.
 */
export const session = {
  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(normalizeKey(key));
      return item ? safeJsonParse(item, defaultValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      sessionStorage.setItem(normalizeKey(key), JSON.stringify(value));
    } catch {
      // Ignore
    }
  },
  
  remove(key) {
    try {
      sessionStorage.removeItem(normalizeKey(key));
    } catch {
      // Ignore
    }
  },
};

export default {
  getItem,
  setItem,
  removeItem,
  clearAll,
  resetStorageAvailabilityCache,
  StorageKeys,
  session,
};
