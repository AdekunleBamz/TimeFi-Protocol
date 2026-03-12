import React from 'react';
import { Tooltip } from './Tooltip';
import './EmptyState.css';

/**
 * EmptyState - Placeholder component for empty list or data views.
 *
 * Displays a centered message with icon, title, description, and optional
 * action buttons when no data is available.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.icon] - Visual icon element
 * @param {string} [props.eyebrow] - Small label above the title
 * @param {string} [props.title] - Main heading text
 * @param {string} [props.description] - Supporting description text
 * @param {string} [props.note] - Additional note or tip
 * @param {React.ReactNode} [props.action] - Primary call-to-action element
 * @param {React.ReactNode} [props.secondaryAction] - Secondary action element
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Empty state container element
 * @example
 * <EmptyState
 *   icon={<SearchIcon />}
 *   title="No results found"
 *   description="Try adjusting your search terms"
 *   action={<Button onClick={onReset}>Reset Filters</Button>}
 * />
 */
export function EmptyState({
  icon,
  eyebrow,
  title,
  description,
  note,
  action,
  secondaryAction,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`} aria-live="polite">
      {icon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}

      {eyebrow && <p className="empty-state-eyebrow">{eyebrow}</p>}
      
      {title && <h3 className="empty-state-title">{title}</h3>}

      {description && (
        <p className="empty-state-description">{description}</p>
      )}

      {note && <p className="empty-state-note">{note}</p>}
      
      {action && (
        <div className="empty-state-action">{action}</div>
      )}
    </div>
  );
}

/**
 * NoVaultsEmptyState - Pre-configured empty state for when user has no vaults.
 * @param {Object} props - Component props
 * @param {Function} [props.onCreateVault] - Callback to trigger vault creation
 * @returns {JSX.Element} Empty state with vault creation prompt
 */
export function NoVaultsEmptyState({ onCreateVault }) {
  return (
    <EmptyState
      icon={<VaultIcon />}
      eyebrow="Start here"
      title="No vaults yet"
      description="Create your first time-locked vault to start earning rewards and establish your unlock schedule."
      note="A first vault gives you live protocol stats, transaction history, and a concrete reward projection to monitor."
      action={
        onCreateVault && (
          <button className="empty-state-button" onClick={onCreateVault}>
            Create Vault
          </button>
        )
      }
      secondaryAction={
        <a
          href="https://docs.timefi.io"
          target="_blank"
          rel="noopener noreferrer"
          className="empty-state-link"
          aria-label="Learn how TimeFi vaults work in docs (opens in new tab)"
          title="Open TimeFi docs in a new tab"
        >
          Learn how it works
        </a>
      }
    />
  );
}


/**
 * NoTransactionsEmptyState - Pre-configured empty state for empty transaction history.
 * @returns {JSX.Element} Empty state with transaction info message
 */
export function NoTransactionsEmptyState() {
  return (
    <EmptyState
      icon={<TransactionIcon />}
      eyebrow="Activity feed"
      title="No transactions"
      description="Your confirmed deposits, withdrawals, rewards, and emergency actions will appear here."
      note="Once you send a transaction, this panel becomes the quickest way to confirm what happened and when."
    />
  );
}

/**
 * VaultIcon - SVG icon for vault representation.
 * @returns {JSX.Element} Vault icon SVG
 */
function VaultIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="10" width="36" height="28" rx="4" />
      <circle cx="24" cy="24" r="8" />
      <path d="M24 20v8M20 24h8" />
      <path d="M12 10V8a2 2 0 012-2h20a2 2 0 012 2v2" />
    </svg>
  );
}

/**
 * TransactionIcon - SVG icon for transaction representation.
 * @returns {JSX.Element} Transaction icon SVG
 */
function TransactionIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 12h36M6 24h36M6 36h24" />
      <path d="M42 30l-6 6-6-6M36 36V24" />
    </svg>
  );
}

export default EmptyState;
