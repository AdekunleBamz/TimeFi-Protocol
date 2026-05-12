import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useDebounce - Hook that debounces a value.
 *
 * Returns a version of `value` that only updates after `delay` ms of inactivity.
 * Useful for reducing the frequency of expensive operations like API searches.
 *
 * @param {any} value - Value to debounce
 * @param {number} [delay=300] - Delay in milliseconds (must be non-negative; defaults to 300)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 300) {
    const safeDelay = typeof delay === 'number' && delay >= 0 ? delay : 300;
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Reset the pending update whenever the value or normalized delay changes.
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, safeDelay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, safeDelay]);

    return debouncedValue;
}

/**
 * useDebouncedCallback - Hook that returns a debounced version of a callback.
 *
 * The returned function delays calling `callback` until after `delay` ms
 * have elapsed since the last invocation.
 *
 * @param {Function} callback - Function to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {Function} Debounced callback function
 */
export function useDebouncedCallback(callback, delay = 300) {
    const timeoutRef = useRef();

    return useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}

/**
 * useDebouncedValue - Alias for {@link useDebounce}.
 *
 * @param {any} value - Value to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebouncedValue(value, delay) {
    return useDebounce(value, delay);
}

export default useDebounce;
