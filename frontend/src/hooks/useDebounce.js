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
    const resolvedDelay = typeof delay === 'number' && delay >= 0 ? delay : 300;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, resolvedDelay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, resolvedDelay]);

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
    const resolvedDelay = typeof delay === 'number' && delay >= 0 ? delay : 300;

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
        }, resolvedDelay);
    }, [resolvedDelay]);
}

/**
 * useDebouncedCallbackWithCancel - Debounced callback plus cancel function.
 * @param {Function} callback - Function to debounce
 * @param {number} [delay=300] - Debounce delay in milliseconds
 * @returns {[Function, Function]} Tuple of [debouncedCallback, cancel]
 */
export function useDebouncedCallbackWithCancel(callback, delay = 300) {
    const timeoutRef = useRef();
    const callbackRef = useRef(callback);
    const resolvedDelay = typeof delay === 'number' && delay >= 0 ? delay : 300;

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);

    useEffect(() => cancel, [cancel]);

    const debounced = useCallback((...args) => {
        cancel();
        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, resolvedDelay);
    }, [cancel, resolvedDelay]);

    return [debounced, cancel];
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
