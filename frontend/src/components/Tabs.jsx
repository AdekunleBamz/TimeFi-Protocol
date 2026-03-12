import React, { useState, createContext, useContext, useId } from 'react';
import './Tabs.css';

const TabsContext = createContext();

/**
 * Tabs container
 * @param {string} defaultValue - Initial active tab
 * @param {Function} onChange - Called when tab changes
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
 * Tab list container
 */
export function TabList({ children, className = '' }) {
  return (
    <div className={`tab-list ${className}`} role="tablist">
      {children}
    </div>
  );
}

/**
 * Individual tab trigger
 * @param {string} value - Tab identifier
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
 * Tab panel content
 * @param {string} value - Matching tab identifier
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
