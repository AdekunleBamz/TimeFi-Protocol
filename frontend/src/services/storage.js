/**
 * Storage service for persistent data management
 * Provides type-safe access to localStorage with fallbacks
 */

const STORAGE_PREFIX = 'timefi_';
let storageAvailableCache = null;

/**
 * Check if localStorage is available
 * @returns {boolean}
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

export function resetStorageAvailabilityCache() {
  storageAvailableCache = null;
}

/**
 * In-memory fallback storage
 */
const memoryStorage = new Map();

function safeJsonParse(value, defaultValue = null) {
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

function normalizeKey(key) {
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('storage key must be a non-empty string');
  }
  return STORAGE_PREFIX + key;
}

/**
 * Get item from storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or default
 */
export function getItem(key, defaultValue = null) {
  const prefixedKey = normalizeKey(key);
  
  try {
    if (isStorageAvailable()) {
      const item = localStorage.getItem(prefixedKey);
      return item ? safeJsonParse(item, defaultValue) : defaultValue;
    }
    return memoryStorage.get(prefixedKey) ?? defaultValue;
  } catch (error) {
    console.warn('Storage getItem error:', error);
    return defaultValue;
  }
}

/**
 * Set item in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function setItem(key, value) {
  const prefixedKey = normalizeKey(key);
  
  try {
    if (isStorageAvailable()) {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
    } else {
      memoryStorage.set(prefixedKey, value);
    }
  } catch (error) {
    console.warn('Storage setItem error:', error);
    memoryStorage.set(prefixedKey, value);
  }
}

/**
 * Remove item from storage
 * @param {string} key - Storage key
 */
export function removeItem(key) {
  const prefixedKey = normalizeKey(key);
  
  try {
    if (isStorageAvailable()) {
      localStorage.removeItem(prefixedKey);
    }
    memoryStorage.delete(prefixedKey);
  } catch (error) {
    console.warn('Storage removeItem error:', error);
  }
}

/**
 * Clear all TimeFi storage items
 */
export function clearAll() {
  try {
    if (isStorageAvailable()) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
    memoryStorage.clear();
  } catch (error) {
    console.warn('Storage clearAll error:', error);
  }
}

/**
 * Storage keys used in the application
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
 * Session storage utilities (cleared on tab close)
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
    } catch (error) {
      console.warn('Session storage error:', error);
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
  StorageKeys,
  session,
};
