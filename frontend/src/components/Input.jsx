import React, { forwardRef, useId } from 'react';
import './Input.css';

/**
 * CheckIcon component for validation success state.
 * @returns {JSX.Element} SVG checkmark icon
 */
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * ErrorIcon component for validation error state.
 * @returns {JSX.Element} SVG error icon
 */
const ErrorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/**
 * Reusable Input component with validation icons and accessibility support.
 *
 * Features built-in validation state indicators, optional icons, and full
 * ARIA attribute support for screen readers.
 *
 * @param {Object} props - Component props
 * @param {string} [props.label] - Label text displayed above the input
 * @param {string} [props.error] - Error message displayed below input when invalid
 * @param {boolean} [props.isValid] - Shows success icon when true
 * @param {string} [props.hint] - Helper text displayed below input
 * @param {string} [props.size='md'] - Input size: 'sm', 'md', 'lg'
 * @param {ReactNode} [props.leftIcon] - Icon displayed on the left side
 * @param {ReactNode} [props.rightIcon] - Icon displayed on the right side
 * @param {string} [props.type='text'] - HTML input type attribute
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Controlled input value
 * @param {Function} [props.onChange] - Change handler
 * @param {boolean} [props.disabled=false] - Disables input when true
 * @param {boolean} [props.required=false] - Marks input as required
 * @param {string} [props.className=''] - Additional CSS class names
 * @param {string} [props.id] - Custom id (auto-generated if not provided)
 * @param {React.Ref} ref - Forwarded ref to the input element
 * @returns {JSX.Element} Input element with label and validation
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="user@example.com"
 *   error={errors.email}
 *   isValid={!errors.email}
 * />
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

