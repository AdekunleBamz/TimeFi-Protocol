import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

/**
 * Tooltip component
 * @param {string} content - Tooltip text
 * @param {string} position - 'top', 'bottom', 'left', 'right' (default: 'top')
 * @param {number} delay - Show delay in ms (default: 200)
 */
export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords(calculatePosition(rect, position));
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) {
    return children;
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </span>
      
      {isVisible && createPortal(
        <div
          className={`tooltip tooltip-${position} ${className}`}
          style={{ left: coords.x, top: coords.y }}
          role="tooltip"
        >
          {content}
          <span className="tooltip-arrow" />
        </div>,
        document.body
      )}
    </>
  );
}

function calculatePosition(rect, position) {
  const offset = 8;
  
  switch (position) {
    case 'top':
      return {
        x: rect.left + rect.width / 2,
        y: rect.top - offset,
      };
    case 'bottom':
      return {
        x: rect.left + rect.width / 2,
        y: rect.bottom + offset,
      };
    case 'left':
      return {
        x: rect.left - offset,
        y: rect.top + rect.height / 2,
      };
    case 'right':
      return {
        x: rect.right + offset,
        y: rect.top + rect.height / 2,
      };
    default:
      return { x: 0, y: 0 };
  }
}

export default Tooltip;
