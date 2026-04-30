import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Tooltip } from './Tooltip';
import './ConfirmModal.css';

/**
 * ConfirmModal - Reusable confirmation dialog with customizable actions.
 *
 * Displays a modal dialog that requires explicit user confirmation
 * before proceeding with an action. Supports loading states and
 * different visual variants for various confirmation types.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal is dismissed
 * @param {Function} props.onConfirm - Callback when confirm button is clicked
 * @param {string} [props.title='Are you sure?'] - Modal heading text
 * @param {string} [props.description] - Supporting description text
 * @param {string} [props.confirmText='Confirm'] - Label for confirm button
 * @param {string} [props.cancelText='Cancel'] - Label for cancel button
 * @param {string} [props.variant='primary'] - Button variant: 'primary' or 'danger'
 * @param {boolean} [props.loading=false] - Shows loading state on confirm button
 * @returns {JSX.Element|null} Modal dialog or null if not open
 * @example
 * <ConfirmModal
 *   isOpen={showDeleteModal}
 *   onClose={() => setShowDeleteModal(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Vault?"
 *   description="This action cannot be undone."
 *   confirmText="Delete"
 *   variant="danger"
 * />
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
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            title="Close modal"
          >
            &times;
          </button>
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
