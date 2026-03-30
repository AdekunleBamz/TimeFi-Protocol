/**
 * Button Component - Reusable button with ripple effect and multiple variants.
 *
 * @module components/Button
 * @author adekunlebamz
 */

import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import './Button.css';

/**
 * Reusable Button component with ripple effect.
 *
 * Supports multiple variants, sizes, and states including loading and disabled.
 * Features a Material Design-style ripple animation on click.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.variant='primary'] - Button variant: 'primary', 'secondary', 'danger', 'ghost'
 * @param {string} [props.size='md'] - Button size: 'sm', 'md', 'lg'
 * @param {boolean} [props.loading=false] - Shows loading spinner when true
 * @param {boolean} [props.fullWidth=false] - Button takes full container width when true
 * @param {boolean} [props.disabled=false] - Disables button interaction when true
 * @param {string} [props.type='button'] - HTML button type attribute
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Button element
 * @example
 * <Button variant="primary" size="lg" onClick={handleSubmit}>
 *   Submit
 * </Button>
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
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled || loading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Cleanup ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) {
      onClick(e);
    }
  };

  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    loading && 'btn-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="btn-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
      {loading && <span className="btn-spinner" role="status" aria-label="Loading" />}
      <span className={loading ? 'btn-text-hidden' : ''}>{children}</span>
    </button>
  );
}

export default Button;

