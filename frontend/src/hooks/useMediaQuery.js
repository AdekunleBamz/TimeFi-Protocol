import { useState, useEffect, useMemo } from 'react';

/**
 * useMediaQuery - Hook for checking if a CSS media query matches.
 *
 * Provides reactive access to CSS media queries with proper
 * event listener management and SSR compatibility.
 *
 * @param {string} query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns {boolean} Whether the media query currently matches
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia} for matchMedia API
 * @example
 * const isMobile = useMediaQuery('(max-width: 639px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query) {
  if (!query || typeof query !== 'string') {
    return false;
  }
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return false;

  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(trimmedQuery).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(trimmedQuery);
    setMatches(mediaQuery.matches);

    const handler = (event) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Legacy browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [trimmedQuery]);

  return matches;
}

/**
 * useIsMobile - Check if viewport is mobile size (< 640px).
 * @returns {boolean} Whether viewport width is less than 640px
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 639px)');
}

/**
 * useIsTablet - Check if viewport is tablet size (640px - 1023px).
 * @returns {boolean} Whether viewport width is between 640px and 1023px
 */
export function useIsTablet() {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

/**
 * useIsSmallScreen - Check if viewport width is below tablet breakpoint (< 768px).
 * @returns {boolean} Whether viewport width is less than 768px
 */
export function useIsSmallScreen() {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * useIsDesktop - Check if viewport is desktop size (>= 1024px).
 * @returns {boolean} Whether viewport width is at least 1024px
 */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * useIsLargeDesktop - Check if viewport is large desktop size (>= 1280px).
 * @returns {boolean} Whether viewport width is at least 1280px
 */
export function useIsLargeDesktop() {
  return useMediaQuery('(min-width: 1280px)');
}

/**
 * useBreakpoint - Get the current responsive breakpoint name.
 * @returns {string} Current breakpoint: 'mobile', 'tablet', 'desktop', or 'large'
 */
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');

  return useMemo(() => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isDesktop) return 'desktop';
    return 'large';
  }, [isMobile, isTablet, isDesktop]);
}

/**
 * usePrefersDarkMode - Check if user prefers dark color scheme.
 * @returns {boolean} Whether user has dark mode enabled in system preferences
 */
export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * usePrefersReducedMotion - Check if user prefers reduced motion.
 * @returns {boolean} Whether user has reduced motion enabled in system preferences
 */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * useIsTouchDevice - Check if device has touch capability.
 * @returns {boolean} Whether the device is a touch device
 */
export function useIsTouchDevice() {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

/**
 * useOrientation - Get current device orientation.
 * @returns {string} 'portrait' if in portrait mode, 'landscape' otherwise
 */
export function useOrientation() {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

/**
 * useIsLandscape - Check if device orientation is landscape.
 * @returns {boolean} Whether current orientation is landscape
 */
export function useIsLandscape() {
  return useMediaQuery('(orientation: landscape)');
}

export default useMediaQuery;
