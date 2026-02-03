import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing async operations with loading/error states
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} { execute, data, loading, error, reset }
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
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFnRef.current(...args);
      
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
      }
      
      return result;
    } catch (error) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error });
        onError?.(error);
      }
      
      throw error;
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
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
    error: state.error,
    reset,
  };
}

/**
 * Simplified hook for one-time data fetching
 * @param {Function} fetcher - Function that returns a promise
 * @param {Array} deps - Dependency array for refetching
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
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, [fetcher]);

  return { ...state, refetch };
}

export default useAsync;
