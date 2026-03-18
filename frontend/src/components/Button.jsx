import React, { useState } from 'react';
import './Button.css';

/**
 * Reusable Button component with ripple effect
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
      {loading && <span className="btn-spinner" />}
      <span className={loading ? 'btn-text-hidden' : ''}>{children}</span>
    </button>
  );
}

export default Button;

