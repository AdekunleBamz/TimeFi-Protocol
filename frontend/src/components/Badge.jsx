/**
 * Badge Component - Small status indicators and labels.
 *
 * @module components/Badge
 * @author adekunlebamz
 */
import React from 'react';
import './Badge.css';

/**
 * Badge component for displaying status indicators and labels.
 *
 * Supports multiple variants, sizes, and visual effects including
 * dot indicators and pulse animations.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge text content (ignored when dot=true)
 * @param {string} [props.variant='default'] - Badge color: 'default', 'success', 'warning', 'danger', 'info'
 * @param {string} [props.size='md'] - Badge size: 'sm', 'md'
 * @param {boolean} [props.dot=false] - Renders as a dot indicator only
 * @param {boolean} [props.pulse=false] - Adds pulse animation effect
 * @param {boolean} [props.leadingDot=false] - Shows a colored dot before the text
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Badge span element
 * @example
 * <Badge variant="success" pulse>Active</Badge>
 * <Badge dot variant="warning" />
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
    return <span className={classes} aria-hidden="true" />;
  }

  return (
    <span className={classes}>
      {leadingDot && <span className={`badge-leading-dot badge-leading-dot-${variant}`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}

/**
 * StatusBadge - Pre-configured badge for common vault status states.
 *
 * Maps status values to appropriate visual styling with colors,
 * labels, and animations that match the status meaning.
 *
 * @param {Object} props - Component props
 * @param {string} props.status - Vault status: 'active', 'locked', 'unlocked', 'withdrawn', 'pending', 'error'
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Styled badge element
 * @example
 * <StatusBadge status="locked" />
 */
export function StatusBadge({ status, className = '' }) {

  const statusConfig = {
    active: { variant: 'success', label: 'Active', leadingDot: true, pulse: true },
    locked: { variant: 'warning', label: 'Locked', leadingDot: true },
    unlocked: { variant: 'info', label: 'Unlocked', leadingDot: true },
    withdrawn: { variant: 'default', label: 'Withdrawn' },
    pending: { variant: 'warning', label: 'Pending', pulse: true, leadingDot: true },
    error: { variant: 'danger', label: 'Needs attention', leadingDot: true },
    expired: { variant: 'info', label: 'Expired', leadingDot: true },
    cancelled: { variant: 'default', label: 'Cancelled' },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <Badge
      variant={config.variant}
      pulse={config.pulse}
      leadingDot={config.leadingDot}
      className={className}
      title={config.label}
    >
      {config.label}
    </Badge>
  );
}

export default Badge;
