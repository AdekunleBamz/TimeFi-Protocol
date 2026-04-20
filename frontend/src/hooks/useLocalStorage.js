import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage - Hook for persisting state to localStorage.
 *
 * Provides a stateful value that persists across page reloads
 * and syncs across browser tabs via the storage event.
 *
 * @param {string} key - localStorage key for storing the value
 * @param {any} initialValue - Default value when no stored value exists
 * @returns {[any, Function, Function]} Tuple of [storedValue, setValue, removeValue]
 * @returns {any} storedValue - Current stored value or initialValue
 * @returns {Function} setValue - Setter that updates state and localStorage
 * @throws {Error} When localStorage is not available and no fallback is provided
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 * @example
 * const [user, setUser] = useLocalStorage('user', null);
 */
export function useLocalStorage(key, initialValue) {
    if (!key || typeof key !== 'string' || !key.trim()) {
        throw new Error('useLocalStorage: key must be a non-empty string');
    }
    const trimmedKey = key.trim();
    // Get from local storage then parse stored json or return initialValue
    const readValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return initialValue instanceof Function ? initialValue() : initialValue;
        }

        try {
            const item = window.localStorage.getItem(trimmedKey);
            if (item !== null) return JSON.parse(item);
            return initialValue instanceof Function ? initialValue() : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${trimmedKey}":`, error);
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
    }, [initialValue, trimmedKey]);

    const [storedValue, setStoredValue] = useState(readValue);

    const setValue = useCallback((value) => {
        try {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(trimmedKey, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.warn(`Error setting localStorage key "${trimmedKey}":`, error);
        }
    }, [trimmedKey, initialValue]);

    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(trimmedKey);
            }
        } catch (error) {
            console.warn(`Error removing localStorage key "${trimmedKey}":`, error);
        }
    }, [trimmedKey, initialValue]);

    // Sync with other tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key !== trimmedKey) return;
            if (e.newValue === null) {
                // Key was removed in another tab
                setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);
            } else {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch {
                    // Ignore malformed values from other tabs
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [trimmedKey]);

    return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
