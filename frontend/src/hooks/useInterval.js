import { useEffect, useRef } from 'react';

/**
 * Hook that sets up an interval that properly cleans up
 * @param {Function} callback - Function to call on each interval
 * @param {number|null} delay - Interval in ms, or null to pause
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Hook that sets up a timeout that properly cleans up
 * @param {Function} callback - Function to call after timeout
 * @param {number|null} delay - Timeout in ms, or null to cancel
 */
export function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * Hook for polling with automatic retry on error
 * @param {Function} fetcher - Async function to poll
 * @param {number} interval - Polling interval in ms
 * @param {Object} options - Configuration options
 */
export function usePolling(fetcher, interval, options = {}) {
  const {
    enabled = true,
    onSuccess,
    onError,
    retryOnError = true,
    maxRetries = 3,
  } = options;

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
        if (retryOnError && retriesRef.current < maxRetries) {
          retriesRef.current++;
        } else {
          onError?.(error);
        }
      }
    },
    enabled ? interval : null
  );
}

export default useInterval;
