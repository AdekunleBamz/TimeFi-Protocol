import React from 'react';
import './Badge.css';

/**
 * Badge component for status indicators
 * @param {string} variant - 'default', 'success', 'warning', 'danger', 'info'
 * @param {string} size - 'sm', 'md' (default: 'md')
 * @param {boolean} dot - Show dot indicator only
 * @param {boolean} pulse - Animate with pulse effect
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  leadingDot = false,
  className = '',
}) {
  const classes = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    dot && 'badge-dot',
    pulse && 'badge-pulse',
    className,
  ].filter(Boolean).join(' ');

  if (dot) {
    return <span className={classes} />;
  }

  return (
    <span className={classes}>
      {leadingDot && <span className={`badge-leading-dot badge-leading-dot-${variant}`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}

/**
 * Status badge with predefined states
 */
export function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    active: { variant: 'success', label: 'Active', leadingDot: true, pulse: true },
    locked: { variant: 'warning', label: 'Locked', leadingDot: true },
    unlocked: { variant: 'info', label: 'Unlocked', leadingDot: true },
    withdrawn: { variant: 'default', label: 'Withdrawn' },
    pending: { variant: 'warning', label: 'Pending', pulse: true, leadingDot: true },
    error: { variant: 'danger', label: 'Needs attention', leadingDot: true },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <Badge 
      variant={config.variant} 
      pulse={config.pulse}
      leadingDot={config.leadingDot}
      className={className}
    >
      {config.label}
    </Badge>
  );
}

export default Badge;
