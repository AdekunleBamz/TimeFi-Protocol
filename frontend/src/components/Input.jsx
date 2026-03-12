import React, { forwardRef, useId } from 'react';
import './Input.css';

/**
 * Reusable Input component
 * @param {string} label - Label text
 * @param {string} error - Error message
 * @param {string} hint - Helper text
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {ReactNode} leftIcon - Icon on the left
 * @param {ReactNode} rightIcon - Icon on the right
 */
export const Input = forwardRef(({
  label,
  error,
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
    leftIcon && 'input-with-left-icon',
    rightIcon && 'input-with-right-icon',
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
        
        {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
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
