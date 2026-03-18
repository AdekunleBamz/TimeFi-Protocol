import React from 'react';
import './Alert.css';

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const SuccessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

/**
 * Alert component for displaying messages
 * @param {string} variant - Alert type: 'info' | 'success' | 'warning' | 'error'
 * @param {string} title - Optional alert title
 * @param {React.ReactNode} children - Alert content
 * @param {boolean} dismissible - Whether alert can be dismissed
 * @param {Function} onDismiss - Callback when dismissed
 * @param {React.ReactNode} icon - Custom icon
 * @param {React.ReactNode} action - Action button/link
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
 * Info alert variant
 * @param {Object} props - Alert component props
 */
export function InfoAlert(props) {
  return <Alert variant="info" {...props} />;
}

/**
 * Success alert variant
 * @param {Object} props - Alert component props
 */
export function SuccessAlert(props) {
  return <Alert variant="success" {...props} />;
}

/**
 * Warning alert variant
 * @param {Object} props - Alert component props
 */
export function WarningAlert(props) {
  return <Alert variant="warning" {...props} />;
}

/**
 * Error alert variant
 * @param {Object} props - Alert component props
 */
export function ErrorAlert(props) {
  return <Alert variant="error" {...props} />;
}

/**
 * Inline alert for form fields
 * @param {Object} props - Component props
 * @param {string} props.variant - Alert type: 'error' | 'warning' | 'info'
 * @param {React.ReactNode} props.children - Alert content
 */
export function InlineAlert({ variant = 'error', children, className = '' }) {

  return (
    <div className={`inline-alert inline-alert-${variant} ${className}`}>
      {children}
    </div>
  );
}

export default Alert;
