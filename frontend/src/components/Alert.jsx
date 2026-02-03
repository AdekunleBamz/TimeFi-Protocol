import React from 'react';
import './Alert.css';

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
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <div className={`alert alert-${variant} ${className}`} role="alert" {...props}>
      {displayIcon && <span className="alert-icon">{displayIcon}</span>}
      
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>

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
  );
}

/**
 * Alert variants as separate components
 */
export function InfoAlert(props) {
  return <Alert variant="info" {...props} />;
}

export function SuccessAlert(props) {
  return <Alert variant="success" {...props} />;
}

export function WarningAlert(props) {
  return <Alert variant="warning" {...props} />;
}

export function ErrorAlert(props) {
  return <Alert variant="error" {...props} />;
}

/**
 * Inline alert for form fields
 */
export function InlineAlert({ variant = 'error', children, className = '' }) {
  return (
    <div className={`inline-alert inline-alert-${variant} ${className}`}>
      {children}
    </div>
  );
}

export default Alert;
