import React from 'react';
import './LoadingSpinner.css';

/**
 * Reusable loading spinner component
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {string} color - CSS color value
 * @param {string} text - Optional loading text
 */
export function LoadingSpinner({ size = 'md', color = '#00d4aa', text }) {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 60,
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div className="loading-spinner-container">
      <div 
        className="loading-spinner"
        style={{
          width: dimension,
          height: dimension,
          borderColor: `${color}20`,
          borderTopColor: color,
        }}
      />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
