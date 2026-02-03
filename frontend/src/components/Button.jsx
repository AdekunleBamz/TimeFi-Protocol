import React from 'react';
import './Button.css';

/**
 * Reusable Button component
 * @param {string} variant - 'primary', 'secondary', 'danger', 'ghost' (default: 'primary')
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} loading - Shows spinner when true
 * @param {boolean} fullWidth - Takes full container width
 * @param {boolean} disabled - Disables the button
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    loading && 'btn-loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      <span className={loading ? 'btn-text-hidden' : ''}>{children}</span>
    </button>
  );
}

export default Button;
