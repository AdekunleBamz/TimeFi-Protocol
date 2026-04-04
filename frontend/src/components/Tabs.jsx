/**
 * Tabs Component - Tabbed navigation interface.
 *
 * @module components/Tabs
 * @author adekunlebamz
 */
import React, { useState, createContext, useContext, useId } from 'react';
import './Tabs.css';

// Context for sharing tab state between components
const TabsContext = createContext();

/**
 * Tabs - Container component for tabbed navigation.
 *
 * Manages active tab state and provides context to child components.
 * Supports controlled and uncontrolled modes.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - TabList and TabPanel components
 * @param {string} [props.defaultValue] - Initial active tab value
 * @param {Function} [props.onChange] - Callback when active tab changes
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Tabs container with context provider
 * @example
 * <Tabs defaultValue="vaults" onChange={handleTabChange}>
 *   <TabList>
 *     <Tab value="vaults">Vaults</Tab>
 *     <Tab value="rewards">Rewards</Tab>
 *   </TabList>
 *   <TabPanel value="vaults">Vault content...</TabPanel>
 *   <TabPanel value="rewards">Rewards content...</TabPanel>
 * </Tabs>
 */
export function Tabs({ children, defaultValue, onChange, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const baseId = useId();

  const handleTabChange = (value) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, baseId }}>
      <div className={`tabs ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/**
 * TabList - Container for tab trigger buttons.
 *
 * Renders as a tablist with proper ARIA role for accessibility.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab components
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Tab list container with role="tablist"
 */
export function TabList({ children, className = '' }) {
  return (
    <div className={`tab-list ${className}`} role="tablist">
      {children}
    </div>
  );
}

/**
 * Tab - Individual tab trigger button.
 *
 * Renders as a button with proper ARIA attributes for accessibility.
 * Manages its own active state styling based on context.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab label content
 * @param {string} props.value - Unique tab identifier
 * @param {boolean} [props.disabled=false] - Disables tab when true
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Tab button element with role="tab"
 */
export function Tab({ children, value, disabled = false, className = '' }) {
  const { activeTab, setActiveTab, baseId } = useContext(TabsContext);
  const isActive = activeTab === value;
  const tabId = `${baseId}-${value}-tab`;
  const panelId = `${baseId}-${value}-panel`;

  return (
    <button
      className={`tab ${isActive ? 'tab-active' : ''} ${className}`}
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      role="tab"
      id={tabId}
      aria-controls={panelId}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {children}
    </button>
  );
}

/**
 * TabPanel - Content panel for a specific tab.
 *
 * Only renders when its value matches the active tab.
 * Includes proper ARIA attributes for accessibility.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Panel content
 * @param {string} props.value - Must match the corresponding Tab's value
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Tab panel element with role="tabpanel" or null if not active
 */
export function TabPanel({ children, value, className = '' }) {
  const { activeTab, baseId } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div
      className={`tab-panel ${className}`}
      role="tabpanel"
      id={`${baseId}-${value}-panel`}
      aria-labelledby={`${baseId}-${value}-tab`}
    >
      {children}
    </div>
  );
}

export default Tabs;
