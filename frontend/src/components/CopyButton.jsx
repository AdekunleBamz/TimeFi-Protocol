import React, { useState, useCallback } from 'react';
import './CopyButton.css';

/**
 * Copy to clipboard button
 * @param {string} text - Text to copy
 * @param {string} successMessage - Message shown after copy (default: 'Copied!')
 * @param {number} timeout - Success message timeout in ms (default: 2000)
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

  const handleCopy = useCallback(async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, timeout);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    }
  }, [text, timeout]);

  const iconClasses = `copy-button copy-button-${variant} ${copied ? 'copy-button-copied' : ''} ${className}`;

  return (
    <button
      type="button"
      className={iconClasses}
      onClick={handleCopy}
      aria-label={copied ? successMessage : 'Copy to clipboard'}
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
 * Address display with copy button
 */
export function CopyableAddress({ address, truncate = true, className = '' }) {
  const displayAddress = truncate && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  return (
    <div className={`copyable-address ${className}`}>
      <span className="copyable-address-text" title={address}>
        {displayAddress}
      </span>
      <CopyButton text={address} />
    </div>
  );
}

// Icons
function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 4v-2c0-0.552 0.448-1 1-1h9c0.552 0 1 0.448 1 1v9c0 0.552-0.448 1-1 1h-2v2c0 0.552-0.448 1-1 1h-9c-0.552 0-1-0.448-1-1v-9c0-0.552 0.448-1 1-1h2zM3 5h-1v8h8v-1h-6c-0.552 0-1-0.448-1-1v-6zM5 3v8h8v-8h-8z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
    </svg>
  );
}

export default CopyButton;
