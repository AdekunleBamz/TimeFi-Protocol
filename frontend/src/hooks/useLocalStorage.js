import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage - Hook for persisting state to localStorage.
 *
 * Works like `useState` but reads from and writes to `localStorage` using
 * the given key. Syncs automatically across browser tabs via the
 * `storage` event. Falls back to `initialValue` if the key is absent
 * or JSON parsing fails.
 *
 * @template T
 * @param {string} key - localStorage key used to persist the value
 * @param {T} initialValue - Default value when the key is absent
 * @returns {[T, Function]} Tuple of the persisted value and its setter
 */
export function useLocalStorage(key, initialValue) {
    // Get from local storage then parse stored JSON or return initialValue
    /** Reads the current persisted value with SSR and parse-error fallbacks. */
    const readValue = useCallback(() => {
        if (typeof window === 'undefined') return initialValue;

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
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

    // Sync value across browser tabs via the storage event
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch {
                    setStoredValue(e.newValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [storedValue, setValue];
}

export default useLocalStorage;
