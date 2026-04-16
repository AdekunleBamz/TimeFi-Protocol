import React from 'react';
import { formatSTX, formatRelativeTime, formatAddress } from '../utils/format';
import { CopyButton } from './CopyButton';
import './TransactionList.css';

const ACTIVE_NETWORK =
  String(import.meta.env.VITE_NETWORK || 'mainnet').trim().toLowerCase() === 'testnet'
    ? 'testnet'
    : 'mainnet';

/**
 * TransactionList - List view for blockchain transaction history.
 *
 * Displays a chronological list of vault-related transactions including
 * deposits, withdrawals, rewards claims, and emergency actions.
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.transactions=[]] - Array of transaction objects
 * @param {boolean} [props.loading=false] - Shows loading skeletons when true
 * @returns {JSX.Element} Transaction list container
 * @example
 * <TransactionList
 *   transactions={userTransactions}
 *   loading={isLoading}
 * />
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
      <div className="transaction-list-empty" aria-live="polite">
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
 * TransactionItem - Individual transaction row display.
 * @param {Object} props - Component props
 * @param {Object} props.transaction - Transaction data object
 * @returns {JSX.Element} Transaction item element
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
  const shortTxId = formatAddress(txId);
  const normalizedStatus = status === 'success' ? 'confirmed' : status;

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
          <span className={`transaction-status transaction-status-${status}`}>
            {normalizedStatus}
          </span>
          <span className="transaction-txid-group">
            <span className="transaction-txid">{shortTxId}</span>
            <CopyButton text={txId} variant="icon" className="transaction-tx-copy" />
          </span>

        </div>

        <div className="transaction-context">
          <a 
            href={`https://explorer.hiro.so/txid/${txId}?chain=${ACTIVE_NETWORK}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transaction-link"
          >
            View on explorer
          </a>
          {vaultId && (
            <span className="transaction-context-note">Linked to vault #{vaultId}</span>
          )}
        </div>
      </div>
      
      <div className="transaction-amount">
        <span className={`transaction-value transaction-value-${type === 'deposit' ? 'negative' : 'positive'}`}>
          {type === 'deposit' ? '-' : '+'}{formatSTX(amount)} STX
        </span>

        <span className="transaction-direction">
          {type === 'deposit' ? 'Sent to vault' : 'Returned to wallet'}
        </span>
      </div>
    </div>
  );
}

/**
 * TransactionSkeleton - Loading placeholder for transaction items.
 * @returns {JSX.Element} Skeleton element
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
