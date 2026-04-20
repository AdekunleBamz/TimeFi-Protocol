/**
 * Theme Context - Dark/light mode state management.
 *
 * Provides theme switching with localStorage persistence
 * and system preference detection.
 *
 * @module context/ThemeContext
 * @author adekunlebamz
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * ThemeContext - React Context for theme management.
 *
 * Provides light/dark/system theme state and controls to all
 * child components. Persists user preference to localStorage.
 *
 * @type {React.Context<Object|null>}
 */
const ThemeContext = createContext(null);

/**
 * ThemeProvider - React Context provider for theme state.
 *
 * Manages theme selection (light/dark/system), resolves system
 * preference via matchMedia, and applies theme class to document root.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.defaultTheme='system'] - Fallback theme if no stored preference
 * @returns {JSX.Element} Theme context provider
 * @example
 * <ThemeProvider defaultTheme="dark">
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setThemeState] = useState(() => {
    // Get stored theme or default
    if (typeof window === 'undefined') return defaultTheme;
    return localStorage.getItem('timefi-theme') || defaultTheme;
  });

  // Get resolved theme (actual light/dark value)
  const resolvedTheme = useResolvedTheme(theme);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Set theme and persist
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('timefi-theme', newTheme);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useResolvedTheme - Internal hook to resolve theme from system preference.
 * @param {string} theme - Theme setting ('light', 'dark', or 'system')
 * @returns {string} Resolved theme ('light' or 'dark')
 */
function useResolvedTheme(theme) {
  const [resolved, setResolved] = useState(() => {
    if (theme !== 'system') return theme;
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme !== 'system') {
      setResolved(theme);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setResolved(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e) => {
      setResolved(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return resolved;
}

/**
 * useTheme - Hook to access theme context.
 *
 * Provides current theme state, resolved theme, and theme control
 * functions to any component in the tree.
 *
 * @returns {{ theme: string, resolvedTheme: string, setTheme: Function, toggleTheme: Function, isDark: boolean, isLight: boolean, isSystem: boolean }}
 * @throws {Error} If used outside of ThemeProvider
 * @example
 * const { isDark, toggleTheme } = useTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

export default ThemeProvider;
