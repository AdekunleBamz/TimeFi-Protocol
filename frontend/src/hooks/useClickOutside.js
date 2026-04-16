import { useEffect, useRef, useCallback } from 'react';

/**
 * useClickOutside - Hook for detecting clicks outside a referenced element.
 *
 * Useful for closing dropdowns, modals, or popovers when clicking outside.
 * Supports excluding additional elements and custom event types.
 *
 * @param {Function} handler - Callback invoked when click outside is detected
 * @param {Object} [options={}] - Configuration options
 * @param {boolean} [options.enabled=true] - Enable/disable the click detection
 * @param {string} [options.eventType='mousedown'] - Event type to listen for
 * @param {Array<React.RefObject>} [options.excludeRefs=[]] - Refs to exclude from detection
 * @returns {React.RefObject<HTMLDivElement>} Ref to attach to the element to monitor
 * @see {@link https://github.com/AdekunleBamz/TimeFi-Protocol} for usage examples
 * @example
 * const ref = useClickOutside(() => setIsOpen(false));
 * return <div ref={ref}>...</div>;
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
    document.addEventListener('touchstart', listener, { passive: true });

    return () => {
      document.removeEventListener(eventType, listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [enabled, eventType, excludeRefs]);

  return ref;
}

/**
 * useEscapeKey - Hook for detecting Escape key presses.
 *
 * Useful for closing modals or dismissing UI elements with the Escape key.
 *
 * @param {Function} handler - Callback invoked when Escape is pressed
 * @param {boolean} [enabled=true] - Enable/disable the key detection
 * @example
 * useEscapeKey(() => closeModal());
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
 * useDismiss - Combined hook for click outside and escape key dismissal.
 *
 * Provides a convenient way to dismiss UI elements with either
 * an outside click or the Escape key.
 *
 * @param {Function} handler - Callback invoked when dismissed
 * @param {Object} [options={}] - Configuration options
 * @param {boolean} [options.enabled=true] - Enable/disable dismissal
 * @param {boolean} [options.escapeKey=true] - Enable Escape key dismissal
 * @param {string} [options.eventType='mousedown'] - Event type for click detection
 * @param {Array<React.RefObject>} [options.excludeRefs=[]] - Refs to exclude
 * @returns {React.RefObject} Ref to attach to the element to monitor
 * @example
 * const ref = useDismiss(() => setIsOpen(false));
 * return <div ref={ref}>...</div>;
 */
export function useDismiss(handler, options = {}) {
  const { enabled = true, escapeKey = true, ...clickOutsideOptions } = options;

  const ref = useClickOutside(handler, { enabled, ...clickOutsideOptions });
  useEscapeKey(handler, enabled && escapeKey);

  return ref;
}

/**
 * useFocusTrap - Hook for trapping focus within an element.
 *
 * Implements accessible focus trapping for modals and dialogs.
 * Tab cycles through focusable elements, wrapping at boundaries.
 *
 * @param {boolean} [active=true] - Whether the focus trap is active
 * @returns {React.RefObject} Ref to attach to the container element
 * @example
 * const ref = useFocusTrap(isModalOpen);
 * return <div ref={ref}>...</div>;
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
