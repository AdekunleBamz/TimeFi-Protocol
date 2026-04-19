/**
 * Select Component - Dropdown selection input.
 *
 * @module components/Select
 * @author adekunlebamz
 */
import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

/**
 * Select - Custom dropdown select component.
 *
 * Provides a fully accessible custom select with keyboard navigation,
 * proper ARIA attributes, and support for disabled options.
 *
 * @param {Object} props - Component props
 * @param {Array<{ value: string, label: string, disabled?: boolean }>} [props.options=[]] - Dropdown options
 * @param {string} [props.value] - Currently selected value
 * @param {Function} [props.onChange] - Callback when selection changes
 * @param {string} [props.placeholder='Select an option'] - Placeholder text when no selection
 * @param {string} [props.label] - Label displayed above the select
 * @param {string} [props.error] - Error message displayed below the select
 * @param {boolean} [props.disabled=false] - Disables the select when true
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Custom select element with role="combobox"
 * @example
 * <Select
 *   options={[
 *     { value: '1h', label: '1 Hour' },
 *     { value: '24h', label: '24 Hours' },
 *     { value: '7d', label: '7 Days', disabled: true },
 *   ]}
 *   value={selectedPeriod}
 *   onChange={setSelectedPeriod}
 *   label="Lock Period"
 * />
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
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
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
