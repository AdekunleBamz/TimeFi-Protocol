/**
 * Tooltip Component - Contextual information on hover.
 *
 * @module components/Tooltip
 * @author adekunlebamz
 */
import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

/**
 * Tooltip component for displaying contextual information on hover/focus.
 *
 * Positions itself relative to the trigger element and supports
 * keyboard accessibility with proper ARIA attributes.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Trigger element
 * @param {string} props.content - Tooltip text content
 * @param {string} [props.position='top'] - Position: 'top', 'bottom', 'left', 'right'
 * @param {number} [props.delay=200] - Show delay in milliseconds
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Tooltip wrapper element
 * @example
 * <Tooltip content="Click to save changes">
 *   <Button>Save</Button>
 * </Tooltip>
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
  const tooltipId = useId();

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
        aria-describedby={isVisible ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </span>

      {isVisible && createPortal(
        <div
          id={tooltipId}
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

/**
 * Calculate tooltip position based on trigger element and desired position.
 * @param {DOMRect} rect - Trigger element's bounding client rect
 * @param {string} position - Desired position: 'top', 'bottom', 'left', 'right'
 * @returns {{ x: number, y: number }} Coordinates for tooltip placement
 */
function calculatePosition(rect, position) {
  const offset = 8;
  const margin = 12;
  const tooltipWidth = 260;
  const tooltipHeight = 56;

  const clampX = (value) => {
    const min = margin + tooltipWidth / 2;
    const max = window.innerWidth - margin - tooltipWidth / 2;
    return Math.min(Math.max(value, min), max);
  };

  const clampY = (value) => {
    const min = margin + tooltipHeight;
    const max = window.innerHeight - margin;
    return Math.min(Math.max(value, min), max);
  };

  switch (position) {
    case 'top':
      return {
        x: clampX(rect.left + rect.width / 2),
        y: clampY(rect.top - offset),
      };
    case 'bottom':
      return {
        x: clampX(rect.left + rect.width / 2),
        y: clampY(rect.bottom + offset),
      };
    case 'left':
      return {
        x: clampX(rect.left - offset),
        y: clampY(rect.top + rect.height / 2),
      };
    case 'right':
      return {
        x: clampX(rect.right + offset),
        y: clampY(rect.top + rect.height / 2),
      };
    default:
      return { x: 0, y: 0 };
  }
}

export default Tooltip;
