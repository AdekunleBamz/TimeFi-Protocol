import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useDebounce - Hook that debounces a value by delaying updates.
 *
 * Useful for scenarios like search input where you want to wait
 * until the user stops typing before triggering an action.
 *
 * @param {any} value - Value to debounce
 * @param {number} [delay=300] - Debounce delay in milliseconds
 * @returns {any} Debounced value that updates after delay
 * @see {@link https://github.com/AdekunleBamz/TimeFi-Protocol} for usage examples
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * useDebouncedCallback - Hook that debounces a callback function.
 *
 * Returns a memoized callback that delays execution until
 * after the specified delay has passed since the last call.
 *
 * @param {Function} callback - Function to debounce
 * @param {number} [delay=300] - Debounce delay in milliseconds
 * @returns {Function} Debounced callback function
 * @example
 * const handleSearch = useDebouncedCallback((query) => {
 *   api.search(query);
 * }, 300);
 */
export function useDebouncedCallback(callback, delay = 300) {
    const timeoutRef = useRef();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);
}

/**
 * useDebouncedValue - Alias for useDebounce.
 * @param {any} value - Value to debounce
 * @param {number} [delay] - Debounce delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebouncedValue(value, delay) {
    return useDebounce(value, delay);
}

export default useDebounce;
