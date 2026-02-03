import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to detect clicks outside of a referenced element
 * @param {Function} handler - Callback when click outside is detected
 * @param {Object} options - Configuration options
 * @returns {Object} Ref to attach to the element
 */
export function useClickOutside(handler, options = {}) {
  const {
    enabled = true,
    eventType = 'mousedown',
    excludeRefs = [],
  } = options;

  const ref = useRef(null);
  const handlerRef = useRef(handler);

  // Keep handler reference up to date
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      const el = ref.current;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target)) {
        return;
      }

      // Check if click is in any excluded refs
      const isExcluded = excludeRefs.some((excludeRef) => {
        return excludeRef.current?.contains(event.target);
      });

      if (isExcluded) {
        return;
      }

      handlerRef.current(event);
    };

    document.addEventListener(eventType, listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener(eventType, listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [enabled, eventType, excludeRefs]);

  return ref;
}

/**
 * Hook to detect escape key press
 * @param {Function} handler - Callback when escape is pressed
 * @param {boolean} enabled - Whether the handler is active
 */
export function useEscapeKey(handler, enabled = true) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        handlerRef.current(event);
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [enabled]);
}

/**
 * Combined hook for click outside and escape key
 * @param {Function} handler - Callback when dismissed
 * @param {Object} options - Configuration options
 * @returns {Object} Ref to attach to the element
 */
export function useDismiss(handler, options = {}) {
  const { enabled = true, escapeKey = true, ...clickOutsideOptions } = options;

  const ref = useClickOutside(handler, { enabled, ...clickOutsideOptions });
  useEscapeKey(handler, enabled && escapeKey);

  return ref;
}

/**
 * Hook to focus trap within an element
 * @param {boolean} active - Whether the focus trap is active
 * @returns {Object} Ref to attach to the container element
 */
export function useFocusTrap(active = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = element.querySelectorAll(focusableSelector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return ref;
}

export default useClickOutside;
