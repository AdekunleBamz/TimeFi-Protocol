import React from 'react';
import './Progress.css';

/**
 * Progress bar component
 * @param {number} value - Current value (0-100)
 * @param {number} max - Maximum value (default: 100)
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {string} variant - 'default', 'success', 'warning', 'danger'
 * @param {boolean} showLabel - Show percentage label
 * @param {boolean} animated - Animate the bar
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
      >
        {showLabel && (
          <span className="progress-label">{Math.round(percentage)}%</span>
        )}
      </div>
    </div>
  );
}

/**
 * Circular progress indicator
 * @param {number} value - Current value (0-100)
 * @param {number} size - Size in pixels (default: 60)
 * @param {number} strokeWidth - Stroke width (default: 6)
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
