import { useEffect, useRef } from 'react';

/**
 * useInterval - Hook for setting up intervals with proper cleanup.
 *
 * Provides a declarative way to use setInterval that works well
 * with React's component lifecycle and handles cleanup automatically.
 *
 * @param {Function} callback - Function to execute on each interval tick
 * @param {number|null} delay - Interval delay in milliseconds, or null to pause
 * @param {Object} [options={}] - Configuration options
 * @param {boolean} [options.enabled=true] - Set false to pause without passing null delay
 * @see {@link https://overreacted.io/making-setinterval-declarative-with-react-hooks} for implementation details
 * @example
 * useInterval(() => {
 *   setCount(count + 1);
 * }, 1000);
 */
export function useInterval(callback, delay, { enabled = true } = {}) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null || delay === undefined || !enabled) {
      return;
    }

    if (typeof delay !== 'number' || delay < 0 || !Number.isFinite(delay)) {
      return;
    }

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay, enabled]);
}

/**
 * useTimeout - Hook for setting up timeouts with proper cleanup.
 *
 * Provides a declarative way to use setTimeout that works well
 * with React's component lifecycle and handles cleanup automatically.
 *
 * @param {Function} callback - Function to execute after the delay
 * @param {number|null} delay - Timeout delay in milliseconds, or null to cancel
 * @example
 * useTimeout(() => {
 *   setShowMessage(false);
 * }, 5000);
 */
export function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || delay === undefined) {
      return;
    }

    if (typeof delay !== 'number' || delay < 0) {
      return;
    }

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * usePolling - Hook for polling data with automatic retry on error.
 *
 * Combines useInterval with error handling and retry logic
 * for robust data polling scenarios.
 *
 * @param {Function} fetcher - Async function to call on each poll
 * @param {number} interval - Polling interval in milliseconds
 * @param {Object} [options={}] - Configuration options
 * @param {boolean} [options.enabled=true] - Enable/disable polling
 * @param {Function} [options.onSuccess] - Callback on successful fetch
 * @param {Function} [options.onError] - Callback on fetch error
 * @param {boolean} [options.retryOnError=true] - Retry on errors
 * @param {number} [options.maxRetries=3] - Maximum retry attempts (non-negative integer)
 * @example
 * usePolling(fetchVaultData, 30000, {
 *   onSuccess: (data) => setVaults(data),
 *   onError: (err) => setError(err.message),
 * });
 */
export function usePolling(fetcher, interval, options = {}) {
  const {
    enabled = true,
    onSuccess,
    onError,
    retryOnError = true,
    maxRetries = 3,
  } = options;
  const resolvedMaxRetries = Number.isInteger(maxRetries) && maxRetries >= 0 ? maxRetries : 3;

  const retriesRef = useRef(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useInterval(
    async () => {
      if (!enabled) return;

      try {
        const result = await fetcherRef.current();
        retriesRef.current = 0;
        onSuccess?.(result);
      } catch (error) {
        if (retryOnError && retriesRef.current < resolvedMaxRetries) {
          retriesRef.current++;
        } else {
          retriesRef.current = 0;
          onError?.(error);
        }
      }
    },
    enabled ? interval : null
  );
}

export default useInterval;
