import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useAsync - Hook for managing async operations with loading and error states.
 *
 * Provides a standardized way to handle async operations with automatic
 * loading states, error handling, and mount-safety checks.
 *
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} [options={}] - Configuration options
 * @param {boolean} [options.immediate=false] - Execute immediately on mount
 * @param {Function} [options.onSuccess] - Callback on successful execution
 * @param {Function} [options.onError] - Callback on error
 * @returns {{ execute: Function, data: any, loading: boolean, error: Error|null, reset: Function }} Async state and controls
 * @returns {Function} returns.execute - Function to trigger the async operation
 * @returns {any} returns.data - Result data from the async operation
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {Error|null} returns.error - Error object if operation failed
 * @returns {Function} returns.reset - Function to reset state to initial
 * @example
 * const { execute, data, loading, error } = useAsync(
 *   (id) => fetchVault(id),
 *   { immediate: true }
 * );
 */
export function useAsync(asyncFunction, options = {}) {
  const {
    immediate = false,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: null,
    status: immediate ? 'loading' : 'idle',
  });

  const mountedRef = useRef(true);
  const asyncFnRef = useRef(asyncFunction);

  // Update ref when function changes
  useEffect(() => {
    asyncFnRef.current = asyncFunction;
  }, [asyncFunction]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    setState(prev => ({ ...prev, loading: true, error: null, status: 'loading' }));

    try {
      const result = await asyncFnRef.current(...args);

      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null, status: 'success' });
        onSuccess?.(result);
      }

      return result;
    } catch (error) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error, status: 'error' });
        onError?.(error);
      }

      throw error;
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, status: 'idle' });
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    execute,
    data: state.data,
    loading: state.loading,
    status: state.status,
    error: state.error,
    reset,
  };
}

/**
 * useFetch - Simplified hook for one-time data fetching with auto-refetch.
 *
 * Automatically fetches data on mount and when dependencies change.
 * Provides loading and error states along with a refetch function.
 *
 * @param {Function} fetcher - Function that returns a promise with data
 * @param {Array} [deps=[]] - Dependency array that triggers refetch when changed
 * @returns {Object} Fetch state and controls
 * @returns {any} returns.data - Fetched data
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {Error|null} returns.error - Error object if fetch failed
 * @returns {Function} returns.refetch - Function to manually refetch data
 * @example
 * const { data, loading, error, refetch } = useFetch(
 *   () => api.getVaults(),
 *   [userId]
 * );
 */
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await fetcher();

        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (error) {
        if (mountedRef.current) {
          setState({ data: null, loading: false, error });
        }
      }
    };

    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, deps);

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: err });
      }
      throw err;
    }
  }, [fetcher]);

  return { ...state, refetch };
}

export default useAsync;
