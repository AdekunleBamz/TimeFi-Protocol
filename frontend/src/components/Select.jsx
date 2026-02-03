import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

/**
 * Custom Select dropdown component
 * @param {Array} options - Array of { value, label, disabled }
 * @param {string} value - Selected value
 * @param {Function} onChange - Called with selected value
 * @param {string} placeholder - Placeholder text
 */
export function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  };

  const handleSelect = (option) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`select-container ${className}`} ref={containerRef}>
      {label && <label className="select-label">{label}</label>}
      
      <div
        className={`select ${isOpen ? 'select-open' : ''} ${error ? 'select-error' : ''} ${disabled ? 'select-disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? 'select-value' : 'select-placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <span className="select-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <ul className="select-dropdown" role="listbox" ref={listRef}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`select-option ${option.value === value ? 'select-option-selected' : ''} ${option.disabled ? 'select-option-disabled' : ''}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
}

export default Select;
