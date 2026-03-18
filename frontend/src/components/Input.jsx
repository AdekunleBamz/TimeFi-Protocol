import React, { forwardRef, useId } from 'react';
import './Input.css';

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/**
 * Reusable Input component with validation icons
 * @param {string} label - Label text
 * @param {string} error - Error message
 * @param {boolean} isValid - Marks input as valid (shows success icon)
 * @param {string} hint - Helper text
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {ReactNode} leftIcon - Icon on the left
 * @param {ReactNode} rightIcon - Icon on the right
 */
export const Input = forwardRef(({
  label,
  error,
  isValid,
  hint,
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  
  const containerClasses = [
    'input-container',
    fullWidth && 'input-full',
    className,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'input',
    `input-${size}`,
    error && 'input-error',
    isValid && 'input-success',
    leftIcon && 'input-with-left-icon',
    (rightIcon || error || isValid) && 'input-with-right-icon',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      
      <div className="input-wrapper">
        {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        
        <div className="input-icon-right-group">
          {rightIcon && <span className="input-icon">{rightIcon}</span>}
          {error && <span className="input-icon input-status-error"><ErrorIcon /></span>}
          {isValid && !error && <span className="input-icon input-status-success"><CheckIcon /></span>}
        </div>
      </div>
      
      {(error || hint) && (
        <div className="input-meta">
          {error && (
            <span id={`${inputId}-error`} className="input-error-text" role="alert">
              {error}
            </span>
          )}

          {hint && !error && (
            <span id={`${inputId}-hint`} className="input-hint">
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

