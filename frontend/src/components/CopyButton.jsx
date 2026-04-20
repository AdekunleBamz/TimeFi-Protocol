/**
 * CopyButton Component - Click-to-copy functionality.
 *
 * @module components/CopyButton
 * @author adekunlebamz
 */
import React, { useState, useCallback } from 'react';
import './CopyButton.css';

/**
 * CopyButton - Button component for copying text to clipboard.
 *
 * Provides visual feedback when content is copied and includes
 * a fallback mechanism for older browsers without Clipboard API.
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Text content to copy to clipboard
 * @param {React.ReactNode} [props.children] - Custom button content (icon or text)
 * @param {string} [props.successMessage='Copied!'] - Message shown after successful copy
 * @param {number} [props.timeout=2000] - Duration to show success state in ms
 * @param {string} [props.className=''] - Additional CSS class names
 * @param {string} [props.variant='icon'] - Button style: 'icon' or 'text'
 * @returns {JSX.Element} Copy button element
 * @example
 * <CopyButton text="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N" successMessage="Address copied!" />
 */
export function CopyButton({
  text,
  children,
  successMessage = 'Copied!',
  timeout = 2000,
  className = '',
  variant = 'icon', // 'icon' or 'text'
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!text) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, timeout);
    } catch (err) {
      // Fallback for environments where clipboard API is unavailable
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(textarea);
        textarea.select();
        // eslint-disable-next-line no-restricted-syntax
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) return;
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), timeout);
      } catch (_) {
        // Copy not supported — fail silently
      }
    }
  }, [text, timeout]);

  const iconClasses = `copy-button copy-button-${variant} ${copied ? 'copy-button-copied' : ''} ${className}`;

  return (
    <button
      type="button"
      className={iconClasses}
      onClick={handleCopy}
      aria-label={copied ? successMessage : 'Copy to clipboard'}
      title={copied ? successMessage : 'Copy to clipboard'}
    >
      {children || (
        <>
          {variant === 'icon' ? (
            copied ? <CheckIcon /> : <CopyIcon />
          ) : (
            copied ? successMessage : 'Copy'
          )}
        </>
      )}
    </button>
  );
}

/**
 * CopyableAddress - Address display with integrated copy button.
 *
 * Shows a truncated Stacks address with a copy button for easy
 * clipboard access. Useful for wallet addresses and contract IDs.
 *
 * @param {Object} props - Component props
 * @param {string} props.address - Full Stacks address to display and copy
 * @param {boolean} [props.truncate=true] - Truncate address to short form
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Address display with copy functionality
 * @example
 * <CopyableAddress address="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N" />
 */
export function CopyableAddress({ address, truncate = true, className = '' }) {
  const displayAddress = truncate && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;
  const copyStateLabel = 'Use copy to grab the full address';

  return (
    <div className={`copyable-address ${className}`}>
      <div className="copyable-address-content">
        <span className="copyable-address-text" title={address}>
          {displayAddress}
        </span>
        <span className="copyable-address-meta">{copyStateLabel}</span>
      </div>
      <CopyButton text={address} variant="text" successMessage="Copied">
        Copy
      </CopyButton>
    </div>
  );
}

/**
 * CopyIcon - SVG icon for copy action.
 * @returns {JSX.Element} Copy icon SVG
 */
function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 4v-2c0-0.552 0.448-1 1-1h9c0.552 0 1 0.448 1 1v9c0 0.552-0.448 1-1 1h-2v2c0 0.552-0.448 1-1 1h-9c-0.552 0-1-0.448-1-1v-9c0-0.552 0.448-1 1-1h2zM3 5h-1v8h8v-1h-6c-0.552 0-1-0.448-1-1v-6zM5 3v8h8v-8h-8z" />
    </svg>
  );
}

/**
 * CheckIcon - SVG icon for success/confirmation state.
 * @returns {JSX.Element} Check icon SVG
 */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
    </svg>
  );
}

export default CopyButton;
