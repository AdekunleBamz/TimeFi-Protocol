import React from 'react';
import './Alert.css';

/**
 * InfoIcon SVG component for info alerts.
 * @returns {JSX.Element} SVG info icon
 */
const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

/**
 * SuccessIcon SVG component for success alerts.
 * @returns {JSX.Element} SVG success icon
 */
const SuccessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/**
 * WarningIcon SVG component for warning alerts.
 * @returns {JSX.Element} SVG warning icon
 */
const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/**
 * ErrorIcon SVG component for error alerts.
 * @returns {JSX.Element} SVG error icon
 */
const ErrorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

/**
 * Alert component for displaying contextual feedback messages.
 *
 * Supports multiple variants with appropriate icons and colors.
 * Can be dismissed and include custom actions.
 *
 * @param {Object} props - Component props
 * @param {string} [props.variant='info'] - Alert type: 'info', 'success', 'warning', 'error'
 * @param {string} [props.title] - Optional bold title text
 * @param {React.ReactNode} props.children - Alert message content
 * @param {boolean} [props.dismissible=false] - Shows dismiss button when true
 * @param {Function} [props.onDismiss] - Callback when dismiss button clicked
 * @param {React.ReactNode} [props.icon] - Custom icon (overrides default)
 * @param {React.ReactNode} [props.action] - Action button or link element
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Alert element with role="alert"
 * @example
 * <Alert variant="error" title="Error" dismissible>
 *   Something went wrong. Please try again.
 * </Alert>
 */
export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  action,
  className = '',
  ...props
}) {
  const defaultIcons = {
    info: <InfoIcon />,
    success: <SuccessIcon />,
    warning: <WarningIcon />,
    error: <ErrorIcon />,
  };


  const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <div className={`alert alert-${variant} ${className}`} role="alert" {...props}>
      {displayIcon && <span className="alert-icon" aria-hidden="true">{displayIcon}</span>}
      
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>

      {(action || dismissible) && (
        <div className="alert-controls">
          {action && <div className="alert-action">{action}</div>}

          {dismissible && (
            <button
              className="alert-dismiss"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * InfoAlert - Pre-configured info variant of Alert.
 * @param {Object} props - Alert component props
 * @returns {JSX.Element} Info alert element
 */
export function InfoAlert(props) {
  return <Alert variant="info" {...props} />;
}

/**
 * SuccessAlert - Pre-configured success variant of Alert.
 * @param {Object} props - Alert component props
 * @returns {JSX.Element} Success alert element
 */
export function SuccessAlert(props) {
  return <Alert variant="success" {...props} />;
}

/**
 * WarningAlert - Pre-configured warning variant of Alert.
 * @param {Object} props - Alert component props
 * @returns {JSX.Element} Warning alert element
 */
export function WarningAlert(props) {
  return <Alert variant="warning" {...props} />;
}

/**
 * ErrorAlert - Pre-configured error variant of Alert.
 * @param {Object} props - Alert component props
 * @returns {JSX.Element} Error alert element
 */
export function ErrorAlert(props) {
  return <Alert variant="error" {...props} />;
}

/**
 * InlineAlert - Compact alert for inline/form field validation messages.
 * @param {Object} props - Component props
 * @param {string} [props.variant='error'] - Alert type: 'error', 'warning', 'info'
 * @param {React.ReactNode} props.children - Alert message content
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Inline alert element
 */
export function InlineAlert({ variant = 'error', children, className = '' }) {

  return (
    <div className={`inline-alert inline-alert-${variant} ${className}`}>
      {children}
    </div>
  );
}

export default Alert;
