import React from 'react';
import './Skeleton.css';

/**
 * Skeleton loading placeholder component.
 *
 * Displays a placeholder while content is loading. Supports multiple
 * variants and optional shimmer animation for better perceived performance.
 *
 * @param {Object} props - Component props
 * @param {string} [props.variant='text'] - Skeleton type: 'text', 'circular', 'rectangular'
 * @param {number|string} [props.width] - Width in pixels or CSS value
 * @param {number|string} [props.height] - Height in pixels or CSS value
 * @param {boolean} [props.animated=true] - Enable shimmer animation
 * @param {string} [props.className=''] - Additional CSS class names
 * @param {Object} [props.style={}] - Inline styles
 * @returns {JSX.Element} Skeleton placeholder div element
 * @example
 * <Skeleton variant="rectangular" width={200} height={100} />
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  animated = true,
  className = '',
  style = {},
}) {
  const classes = [
    'skeleton',
    `skeleton-${variant}`,
    animated && 'skeleton-animated',
    className,
  ].filter(Boolean).join(' ');

  const computedStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return <div className={classes} style={computedStyle} />;
}

/**
 * SkeletonText - Multiple skeleton lines for text content.
 * @param {Object} props - Component props
 * @param {number} [props.lines=3] - Number of text lines to simulate
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Container with skeleton text lines
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton-text-container ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonAvatar - Circular skeleton placeholder for avatar images.
 * @param {Object} props - Component props
 * @param {number} [props.size=48] - Diameter in pixels
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Circular skeleton element
 */
export function SkeletonAvatar({ size = 48, className = '' }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

/**
 * SkeletonCard - Pre-composed skeleton for card layouts.
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Complete card skeleton with image and text areas
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton variant="rectangular" height={120} />
      <div className="skeleton-card-content">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={40} style={{ marginTop: '0.5rem', borderRadius: '12px' }} />
      </div>
    </div>
  );
}

/**
 * SkeletonVaultCard - Pre-composed skeleton for vault card layouts.
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Complete vault card skeleton with header and stats
 */
export function SkeletonVaultCard({ className = '' }) {
  return (
    <div className={`skeleton-vault-card ${className}`}>
      <div className="skeleton-vault-header">
        <SkeletonAvatar size={40} />
        <div className="skeleton-vault-title">
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={12} />
        </div>
      </div>
      <div className="skeleton-vault-body">
        <Skeleton width="100%" height={8} style={{ marginBottom: '1rem' }} />
        <div className="skeleton-vault-stats">
          <Skeleton width={80} height={24} />
          <Skeleton width={80} height={24} />
        </div>
        <Skeleton width="100%" height={42} style={{ borderRadius: '12px' }} />
      </div>
    </div>
  );
}

export default Skeleton;
