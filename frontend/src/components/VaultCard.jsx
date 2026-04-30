import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReadOnly } from '../hooks/useReadOnly';
import './VaultCard.css';

/**
 * VaultCard - Card display for individual vault information.
 *
 * Shows vault status, time remaining, locked amount, unlock block,
 * and approved bot. Auto-refreshes every 30 seconds and highlights
 * when withdrawal is available.
 *
 * @param {Object} props - Component props
 * @param {number|string} props.vaultId - Unique vault identifier
 * @returns {JSX.Element} Vault card element
 * @example
 * <VaultCard vaultId={12345} />
 */
export function VaultCard({ vaultId }) {
  const [vault, setVault] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [canWithdrawNow, setCanWithdrawNow] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { getVault, getTimeRemaining, canWithdraw, loading } = useReadOnly();

  const fetchVaultData = async () => {
    try {
      const vaultData = await getVault(vaultId);
      const value = vaultData?.value ?? vaultData;
      setVault(value);

      const remaining = await getTimeRemaining(vaultId);
      setTimeRemaining(Number(remaining?.value ?? remaining ?? 0));

      const withdrawable = await canWithdraw(vaultId);
      setCanWithdrawNow(Boolean(withdrawable?.value ?? withdrawable));
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Unable to load vault');
    }
  };

  useEffect(() => {
    fetchVaultData();
    const interval = setInterval(fetchVaultData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [vaultId, getVault, getTimeRemaining, canWithdraw]);

  const formatSTX = (microStx) => {
    return (microStx / 1_000_000).toFixed(6);
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'Ready to withdraw';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading && !vault) {
    return (
      <div className="vault-card loading" aria-busy="true" aria-label="Loading vault">
        <div className="skeleton" aria-hidden="true"></div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="vault-card error" role="alert">
        <p>{error || 'Vault not found'}</p>
      </div>
    );
  }

  const unlockBlock = vault['unlock-block'] ?? vault.unlockHeight ?? '--';
  const bot = vault.bot ?? vault['approved-bot'] ?? null;
  const urgencyLabel = canWithdrawNow
    ? 'Withdrawal window open'
    : timeRemaining > 86400
      ? 'Long lock remaining'
      : 'Near unlock';
  const timeStateLabel = canWithdrawNow
    ? 'Ready now'
    : timeRemaining > 86400
      ? 'Still locked'
      : 'Unlocking soon';
  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--';

  return (
    <div className={`vault-card ${canWithdrawNow ? 'withdrawable' : ''}`}>
      <div className="vault-header">
        <div className="vault-title-group">
          <h3>Vault #{vaultId}</h3>
          <span className="vault-subtitle">{timeStateLabel}</span>
        </div>
        <span className={`status ${canWithdrawNow ? 'ready' : 'locked'}`} aria-label={canWithdrawNow ? 'Status: ready to withdraw' : 'Status: locked'}>
          {canWithdrawNow ? '🟢 Ready' : '🔒 Locked'}
        </span>
      </div>

      <div className="vault-time-spotlight">
        <span className="vault-time-label">Time remaining</span>
        <strong>{formatTime(timeRemaining)}</strong>
      </div>

      <div className="vault-details">
        <div className="detail-row">
          <span className="label">Amount:</span>
          <span className="value">{formatSTX(vault.amount)} STX</span>
        </div>

        <div className="detail-row">
          <span className="label">Unlock Block:</span>
          <span className="value">{unlockBlock}</span>
        </div>

        {bot && (
          <div className="detail-row">
            <span className="label">Bot:</span>
            <span className="value bot">{String(bot).slice(0, 10)}...</span>
          </div>
        )}
      </div>

      <div className="vault-card-footer-meta">
        <span className={`vault-urgency ${canWithdrawNow ? 'vault-urgency-ready' : ''}`}>{urgencyLabel}</span>
        <button
          type="button"
          className="vault-refresh-note"
          onClick={fetchVaultData}
          aria-label={`Refresh vault data. Last updated ${lastUpdatedLabel}`}
        >
          Updated {lastUpdatedLabel}
        </button>
      </div>

      <div className="vault-actions">
        <Link
          className="btn btn-secondary vault-open-link"
          to={`/vault/${vaultId}`}
          aria-label={`View details for vault ${vaultId}`}
        >
          View Details
        </Link>
        {canWithdrawNow && <span className="vault-ready-pill">Ready to Withdraw</span>}
      </div>
    </div>
  );
}

export default VaultCard;
