import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

const ToastContext = createContext(null);

/**
 * Toast provider component
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
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
 * Toast container - renders all active toasts
 */
function ToastContainer({ toasts, onRemove }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

/**
 * Individual toast item
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
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
      {action && (
        <button className="toast-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <button 
        className="toast-close" 
        onClick={() => onRemove(id)}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Hook to use toast notifications
 * @returns {Object} Toast functions
 */
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

export default ToastProvider;
