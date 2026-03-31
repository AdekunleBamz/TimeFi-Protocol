/**
 * Accessibility Utilities - ARIA helpers and focus management.
 *
 * Provides functions for managing keyboard navigation, focus trapping,
 * and ARIA attributes to ensure the application is accessible.
 *
 * @module utils/accessibility
 * @author adekunlebamz
 */

/**
 * srOnlyStyles - CSS styles for visually hiding content while keeping it accessible.
 *
 * Apply these styles to elements that should be visible only to screen readers.
 * This follows the WCAG technique for hiding content visually while exposing it
 * to assistive technologies.
 *
 * @type {React.CSSProperties}
 * @example
 * // In CSS: .sr-only { position: absolute; width: 1px; ... }
 * // Or use inline: <span style={srOnlyStyles}>Screen reader text</span>
 */
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
};

/**
 * announceToScreenReader - Dynamically announce a message to screen readers.
 *
 * Creates a temporary live region that screen readers will announce.
 * Useful for announcing dynamic content changes, form validation results,
 * or transaction status updates.
 *
 * @param {string} message - Message text to announce
 * @param {string} [priority='polite'] - 'polite' for normal announcements, 'assertive' for urgent
 * @example
 * announceToScreenReader('Vault created successfully!');
 * announceToScreenReader('Error: Insufficient balance', 'assertive');
 */
export function announceToScreenReader(message, priority = 'polite') {
  const element = document.createElement('div');
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', priority);
  element.setAttribute('aria-atomic', 'true');
  Object.assign(element.style, srOnlyStyles);
  
  document.body.appendChild(element);
  
  // Delay to ensure screen reader picks up the change
  setTimeout(() => {
    element.textContent = message;
  }, 100);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(element);
  }, 1000);
}

/**
 * generateId - Generate a unique ID for accessibility attributes.
 *
 * Creates sequential IDs useful for linking labels to inputs,
 * describing elements, or creating unique ARIA attribute values.
 *
 * @param {string} [prefix='timefi'] - Prefix for the generated ID
 * @returns {string} Unique ID string (e.g., "timefi-1", "timefi-2")
 * @example
 * const labelId = generateId('modal'); // "modal-1"
 * <div id={labelId}>Label text</div>
 * <button aria-labelledby={labelId}>Action</button>
 */
let idCounter = 0;
export function generateId(prefix = 'timefi') {
  return `${prefix}-${++idCounter}`;
}

/**
 * Keys - Standardized keyboard key constants for navigation handlers.
 *
 * Use these constants instead of magic strings when handling
 * keyboard events for consistent cross-browser behavior.
 *
 * @type {Object.<string, string>}
 * @property {string} Enter - Enter key
 * @property {string} Space - Spacebar
 * @property {string} Escape - Escape key
 * @property {string} ArrowUp - Up arrow key
 * @property {string} ArrowDown - Down arrow key
 * @property {string} ArrowLeft - Left arrow key
 * @property {string} ArrowRight - Right arrow key
 * @property {string} Home - Home key
 * @property {string} End - End key
 * @property {string} Tab - Tab key
 */
export const Keys = {
  Enter: 'Enter',
  Space: ' ',
  Escape: 'Escape',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  Tab: 'Tab',
};

/**
 * isActivationKey - Check if a keyboard event is an activation key.
 *
 * Use this to make custom interactive elements accessible via
 * both Enter and Space keys, matching native button behavior.
 *
 * @param {KeyboardEvent} event - Keyboard event to check
 * @returns {boolean} True if the key is Enter or Space
 * @example
 * <div onKeyDown={(e) => isActivationKey(e) && handleClick()}>
 *   Custom button
 * </div>
 */
export function isActivationKey(event) {
  return event.key === Keys.Enter || event.key === Keys.Space;
}

/**
 * handleListNavigation - Handle arrow key navigation within a list.
 *
 * Implements standard listbox navigation patterns: arrow keys move
 * focus, Home/End jump to start/end. Call this in your keyDown handler.
 *
 * @param {KeyboardEvent} event - Keyboard event
 * @param {HTMLElement[]} items - Array of focusable list item elements
 * @param {number} currentIndex - Index of currently focused item
 * @returns {number} New index to focus (unchanged if no navigation key)
 * @example
 * const handleKeyDown = (e) => {
 *   const newIndex = handleListNavigation(e, items, currentIndex);
 *   if (newIndex !== currentIndex) setCurrentIndex(newIndex);
 * };
 */
export function handleListNavigation(event, items, currentIndex) {
  const { key } = event;
  let newIndex = currentIndex;
  
  switch (key) {
    case Keys.ArrowDown:
      event.preventDefault();
      newIndex = (currentIndex + 1) % items.length;
      break;
    case Keys.ArrowUp:
      event.preventDefault();
      newIndex = (currentIndex - 1 + items.length) % items.length;
      break;
    case Keys.Home:
      event.preventDefault();
      newIndex = 0;
      break;
    case Keys.End:
      event.preventDefault();
      newIndex = items.length - 1;
      break;
  }
  
  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
  }
  
  return newIndex;
}

/**
 * getFocusableElements - Query all focusable elements within a container.
 *
 * Returns elements that are naturally focusable (buttons, links, inputs)
 * plus elements with a valid tabindex. Excludes disabled and hidden elements.
 *
 * @param {HTMLElement} container - Parent element to search within
 * @returns {HTMLElement[]} Array of focusable DOM elements
 * @example
 * const focusable = getFocusableElements(modalRef.current);
 * focusable[0]?.focus(); // Focus first element
 */
export function getFocusableElements(container) {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(selector));
}

/**
 * trapFocus - Implement focus trapping for modals and dialogs.
 *
 * When called on a Tab key event, cycles focus between the first
 * and last focusable elements within the container. Use in modal
 * keyDown handlers to comply with WCAG focus trapping requirements.
 *
 * @param {HTMLElement} container - Element to trap focus within
 * @param {KeyboardEvent} event - Keyboard event (should be Tab key)
 * @example
 * <div onKeyDown={(e) => trapFocus(modalRef.current, e)}>
 *   {/* Modal content *}/{' '}
 * </div>
 */
export function trapFocus(container, event) {
  if (event.key !== Keys.Tab) return;
  
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement?.focus();
  }
}

export default {
  srOnlyStyles,
  announceToScreenReader,
  generateId,
  Keys,
  isActivationKey,
  handleListNavigation,
  getFocusableElements,
  trapFocus,
};
