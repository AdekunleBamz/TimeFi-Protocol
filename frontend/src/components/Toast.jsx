/**
 * Toast Component - Notification messages with auto-dismiss.
 *
 * @module components/Toast
 * @author adekunlebamz
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

// Create context for toast notifications
const ToastContext = createContext(null);

/**
 * ToastProvider - Context provider for toast notifications.
 *
 * Wraps the application to provide toast notification functionality
 * to all child components via the useToast hook.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Toast provider wrapper
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    const newToast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast].slice(-5));

    if (newToast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, newToast.duration);

      // store timer id on the toast object for potential early cleanup
      newToast._timer = timer;
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, options = {}) => {
    return addToast({ message, variant: 'default', ...options });
  }, [addToast]);

  toast.success = (message, options) => addToast({ message, variant: 'success', ...options });
  toast.error = (message, options) => addToast({ message, variant: 'error', ...options });
  toast.warning = (message, options) => addToast({ message, variant: 'warning', ...options });
  toast.info = (message, options) => addToast({ message, variant: 'info', ...options });

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * ToastContainer - Portal container that renders all active toasts.
 * @param {Object} props - Component props
 * @param {Array} props.toasts - Array of active toast objects
 * @param {Function} props.onRemove - Callback to remove a toast by id
 * @returns {JSX.Element|null} Portal with toast items
 */
function ToastContainer({ toasts, onRemove }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

/**
 * ToastItem - Individual toast notification element.
 * @param {Object} props - Component props
 * @param {Object} props.toast - Toast data object with id, message, variant, etc.
 * @param {Function} props.onRemove - Callback to remove this toast
 * @returns {JSX.Element} Toast notification element
 */
function ToastItem({ toast, onRemove }) {
  const { id, message, variant, title, action } = toast;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    default: '',
  };

  return (
    <div className={`toast toast-${variant}`} role="alert">
      {icons[variant] && (
        <span className="toast-icon">{icons[variant]}</span>
      )}
      <div className="toast-content">
        <div className="toast-topline">
          {title && <div className="toast-title">{title}</div>}
          <span className="toast-status-label">{variant}</span>
        </div>
        <div className="toast-message">{message}</div>
        {action && (
          <button className="toast-action" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      <button 
        className="toast-close" 
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

/**
 * useToast - Hook for accessing toast notification functions.
 *
 * Provides a convenient interface for displaying toast notifications
 * with predefined variants (success, error, warning, info).
 *
 * @returns {Object} Toast API with methods:
 *   - toast(message, options) - Display default toast
 *   - toast.success(message, options) - Display success toast
 *   - toast.error(message, options) - Display error toast
 *   - toast.warning(message, options) - Display warning toast
 *   - toast.info(message, options) - Display info toast
 * @throws {Error} If not used within ToastProvider
 * @example
 * const { toast } = useToast();
 * toast.success('Vault created successfully!');
 * toast.error('Transaction failed');
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export default ToastProvider;
