import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage - Hook for persisting state to localStorage.
 *
 * Provides a stateful value that persists across page reloads
 * and syncs across browser tabs via the storage event.
 *
 * @param {string} key - localStorage key for storing the value
 * @param {any} initialValue - Default value when no stored value exists
 * @returns {[any, Function]} Tuple of [storedValue, setValue]
 * @returns {any} storedValue - Current stored value or initialValue
 * @returns {Function} setValue - Setter that updates state and localStorage
 * @throws {Error} When localStorage is not available and no fallback is provided
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 * @example
 * const [user, setUser] = useLocalStorage('user', null);
 */
export function useLocalStorage(key, initialValue) {
    // Get from local storage then parse stored json or return initialValue
    const readValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return initialValue instanceof Function ? initialValue() : initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            if (item !== null) return JSON.parse(item);
            return initialValue instanceof Function ? initialValue() : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState(readValue);

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Sync with other tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                setStoredValue(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [storedValue, setValue];
}

export default useLocalStorage;
