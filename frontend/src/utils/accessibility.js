/**
 * Accessibility utilities for TimeFi frontend
 */

/**
 * Screen reader only styles (visually hidden but accessible)
 * Use with className="sr-only"
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
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' | 'assertive'
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
 * Generate unique ID for accessibility attributes
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
let idCounter = 0;
export function generateId(prefix = 'timefi') {
  return `${prefix}-${++idCounter}`;
}

/**
 * Key codes for keyboard navigation
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
 * Check if keyboard event is an activation key (Enter or Space)
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
export function isActivationKey(event) {
  return event.key === Keys.Enter || event.key === Keys.Space;
}

/**
 * Handle keyboard navigation for list items
 * @param {KeyboardEvent} event
 * @param {HTMLElement[]} items - List of focusable items
 * @param {number} currentIndex - Current focused item index
 * @returns {number} New index to focus
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
 * Get focusable elements within a container
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
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
 * Trap focus within a container (for modals)
 * @param {HTMLElement} container
 * @param {KeyboardEvent} event
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
