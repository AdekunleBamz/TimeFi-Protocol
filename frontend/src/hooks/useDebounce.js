import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook that debounces a value
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in ms (must be non-negative; defaults to 300)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 300) {
    const safeDelay = typeof delay === 'number' && delay >= 0 ? delay : 300;
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
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
 * Hook that debounces a callback function
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in ms
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
 * Alias for useDebounce
 */
export function useDebouncedValue(value, delay) {
    return useDebounce(value, delay);
}

export default useDebounce;
