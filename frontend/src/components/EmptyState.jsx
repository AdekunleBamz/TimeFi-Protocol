import React from 'react';
import './EmptyState.css';

/**
 * Empty state placeholder component
 * @param {ReactNode} icon - Icon element
 * @param {string} title - Main heading
 * @param {string} description - Supporting text
 * @param {ReactNode} action - CTA button/link
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}
      
      {title && <h3 className="empty-state-title">{title}</h3>}
      
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      
      {action && (
        <div className="empty-state-action">{action}</div>
      )}
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
      title="No vaults yet"
      description="Create your first time-locked vault to start earning rewards."
      action={
        onCreateVault && (
          <button className="empty-state-button" onClick={onCreateVault}>
            Create Vault
          </button>
        )
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
      title="No transactions"
      description="Your transaction history will appear here."
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
