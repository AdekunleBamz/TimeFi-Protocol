import React from 'react';
import './Skeleton.css';

/**
 * Skeleton loading placeholder
 * @param {string} variant - 'text', 'circular', 'rectangular'
 * @param {number|string} width - Width value
 * @param {number|string} height - Height value
 * @param {boolean} animated - Enable shimmer animation
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
 * Skeleton for text lines
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
 * Skeleton for avatar/profile images
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
 * Skeleton for cards
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton variant="rectangular" height={120} />
      <div className="skeleton-card-content">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}

/**
 * Skeleton for vault cards
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
      </div>
    </div>
  );
}

export default Skeleton;
