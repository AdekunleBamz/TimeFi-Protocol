/**
 * Progress Component - Progress bars and loading indicators.
 *
 * @module components/Progress
 * @author adekunlebamz
 */
import React from 'react';
import { Tooltip } from './Tooltip';
import './Progress.css';

/**
 * Progress bar component for visualizing completion percentage.
 *
 * Supports multiple sizes, variants, and optional animation.
 * Includes proper ARIA attributes for accessibility.
 *
 * @param {Object} props - Component props
 * @param {number} [props.value=0] - Current progress value (0-100)
 * @param {number} [props.max=100] - Maximum value for calculation
 * @param {string} [props.size='md'] - Bar size: 'sm', 'md', 'lg'
 * @param {string} [props.variant='default'] - Color variant: 'default', 'success', 'warning', 'danger'
 * @param {boolean} [props.showLabel=false] - Display percentage label inside bar
 * @param {boolean} [props.animated=false] - Enable progress bar animation
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Progress bar element with role="progressbar"
 * @example
 * <Progress value={75} variant="success" showLabel animated />
 */
export function Progress({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  animated = false,
  className = '',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress progress-${size} ${className}`}>
      <div
        className={`progress-bar progress-${variant} ${animated ? 'progress-animated' : ''}`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${Math.round(percentage)}%`}
      >
        {showLabel && (
          <span className="progress-label">{Math.round(percentage)}%</span>
        )}
      </div>
    </div>
  );
}

/**
 * CircularProgress - Circular progress indicator using SVG.
 *
 * Displays progress as a circular ring with optional percentage label.
 * Useful for dashboards and compact progress displays.
 *
 * @param {Object} props - Component props
 * @param {number} [props.value=0] - Current progress value (0-100)
 * @param {number} [props.size=60] - Diameter in pixels
 * @param {number} [props.strokeWidth=6] - Ring stroke width in pixels
 * @param {boolean} [props.showLabel=false] - Display percentage label in center
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Circular progress SVG element
 * @example
 * <CircularProgress value={60} size={80} showLabel />
 */
export function CircularProgress({
  value = 0,
  size = 60,
  strokeWidth = 6,
  showLabel = false,
  className = '',
}) {

  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`circular-progress ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          className="circular-progress-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className="circular-progress-bar"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <span className="circular-progress-label">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}

export default Progress;
