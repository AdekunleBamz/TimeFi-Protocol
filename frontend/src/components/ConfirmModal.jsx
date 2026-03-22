import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import './ConfirmModal.css';

/**
 * Reusable Confirmation Modal
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Call on close request
 * @param {Function} props.onConfirm - Call on confirmation
 * @param {string} props.title - Modal heading
 * @param {string} props.description - Modal body text
 * @param {string} props.confirmText - Label for confirm button
 * @param {string} props.cancelText - Label for cancel button
 * @param {string} props.variant - 'primary' or 'danger'
 * @param {boolean} props.loading - Shows loading state on confirm button
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' or 'danger'
  loading = false,
}) {

  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>
        <div className="modal-body">
          {description && <p className="modal-description">{description}</p>}
        </div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={onConfirm} 
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
