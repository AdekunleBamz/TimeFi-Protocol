import React, { useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import './ScrollToTop.css';

/**
 * ScrollToTop - Floating button that scrolls page to top.
 *
 * Appears after user scrolls down 300px and provides smooth
 * scroll animation back to the top of the page.
 *
 * @returns {JSX.Element} Scroll to top button (visible when scrolled)
 * @example
 * // Add to main layout
 * <ScrollToTop />
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    // Move focus to the top of the page for keyboard users
    document.body.focus();
  };

  return (
    <button
      type="button"
      className={`scroll-to-top ${isVisible ? 'scroll-to-top-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Scroll back to top"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

export default ScrollToTop;
