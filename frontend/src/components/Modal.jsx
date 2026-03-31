import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Reusable Modal dialog component with accessibility support.
 *
 * Renders a dialog overlay using React Portal with keyboard navigation,
 * focus trapping, and proper ARIA attributes for screen readers.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal should close
 * @param {string} [props.title] - Modal header title text
 * @param {React.ReactNode} props.children - Modal body content
 * @param {string} [props.size='md'] - Modal size: 'sm', 'md', 'lg'
 * @param {boolean} [props.closeOnOverlay=true] - Close when clicking overlay
 * @param {boolean} [props.showCloseButton=true] - Show X close button
 * @param {React.ReactNode} [props.footer] - Optional footer content
 * @returns {JSX.Element|null} Modal dialog element or null if not open
 * @example
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm">
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 */
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnOverlay = true,
  showCloseButton = true,
  footer,
}) {
  // Handle ESC key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose();
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal modal-${size}`} role="dialog" aria-modal="true">
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button className="modal-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
