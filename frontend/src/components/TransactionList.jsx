import React from 'react';
import { formatSTX, formatRelativeTime, formatAddress } from '../utils/format';
import './TransactionList.css';

/**
 * Transaction list component
 * @param {Array} transactions - Array of transaction objects
 * @param {boolean} loading - Show loading state
 */
export function TransactionList({ transactions = [], loading = false }) {
  if (loading) {
    return (
      <div className="transaction-list">
        {[1, 2, 3].map((i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-empty">
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((tx) => (
        <TransactionItem key={tx.txId} transaction={tx} />
      ))}
    </div>
  );
}

/**
 * Single transaction item
 */
function TransactionItem({ transaction }) {
  const { type, amount, timestamp, status, txId, vaultId } = transaction;

  const typeConfig = {
    deposit: { label: 'Deposit', icon: '↓', color: 'green' },
    withdraw: { label: 'Withdraw', icon: '↑', color: 'blue' },
    'claim-rewards': { label: 'Claim Rewards', icon: '🎁', color: 'purple' },
    emergency: { label: 'Emergency Withdraw', icon: '⚠️', color: 'red' },
  };

  const config = typeConfig[type] || typeConfig.deposit;

  return (
    <div className={`transaction-item transaction-${status}`}>
      <div className={`transaction-icon transaction-icon-${config.color}`}>
        {config.icon}
      </div>
      
      <div className="transaction-details">
        <div className="transaction-header">
          <span className="transaction-type">{config.label}</span>
          {vaultId && (
            <span className="transaction-vault">Vault #{vaultId}</span>
          )}
        </div>
        
        <div className="transaction-meta">
          <span className="transaction-time">
            {formatRelativeTime(timestamp)}
          </span>
          <span className="transaction-status">
            {status === 'pending' && '⏳ '}
            {status}
          </span>
        </div>
      </div>
      
      <div className="transaction-amount">
        <span className={`transaction-value transaction-value-${type === 'deposit' ? 'negative' : 'positive'}`}>
          {type === 'deposit' ? '-' : '+'}{formatSTX(amount)} STX
        </span>
        
        <a 
          href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="transaction-link"
        >
          View →
        </a>
      </div>
    </div>
  );
}

/**
 * Transaction skeleton for loading
 */
function TransactionSkeleton() {
  return (
    <div className="transaction-item transaction-skeleton">
      <div className="skeleton-icon" />
      <div className="skeleton-details">
        <div className="skeleton-line skeleton-line-md" />
        <div className="skeleton-line skeleton-line-sm" />
      </div>
      <div className="skeleton-amount">
        <div className="skeleton-line skeleton-line-lg" />
      </div>
    </div>
  );
}

export default TransactionList;
