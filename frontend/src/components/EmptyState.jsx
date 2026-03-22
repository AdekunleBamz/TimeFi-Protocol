import React from 'react';
import './EmptyState.css';

/**
 * Empty state placeholder component
 * @param {ReactNode} icon - Icon element
 * @param {string} title - Main heading
 * @param {string} description - Supporting text
 * @param {ReactNode} action - CTA button/link
 * @param {ReactNode} secondaryAction - Optional secondary CTA
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
    <div className={`empty-state ${className}`}>
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
      
      <div className="empty-state-actions">
        {action && (
          <div className="empty-state-action">{action}</div>
        )}
        {secondaryAction && (
          <div className="empty-state-secondary-action">{secondaryAction}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Pre-configured empty state for no vaults
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
        <a href="https://docs.timefi.io" target="_blank" rel="noopener noreferrer" className="empty-state-link">
          Learn how it works
        </a>
      }
    />
  );
}


/**
 * Pre-configured empty state for no transactions
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

// Icons
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

function TransactionIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 12h36M6 24h36M6 36h24" />
      <path d="M42 30l-6 6-6-6M36 36V24" />
    </svg>
  );
}

export default EmptyState;
