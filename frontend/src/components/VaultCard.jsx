import React, { useState, useEffect } from 'react';
import { useReadOnly } from '../hooks/useReadOnly';

/**
 * VaultCard component displays vault information
 */
export function VaultCard({ vaultId, onWithdraw, onApproveBot }) {
  const [vault, setVault] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [canWithdrawNow, setCanWithdrawNow] = useState(false);
  const { getVault, getTimeRemaining, canWithdraw, loading } = useReadOnly();

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const vaultData = await getVault(vaultId);
        setVault(vaultData.value);

        const remaining = await getTimeRemaining(vaultId);
        setTimeRemaining(remaining.value);

        const withdrawable = await canWithdraw(vaultId);
        setCanWithdrawNow(withdrawable.value);
      } catch (err) {
        console.error('Failed to fetch vault data:', err);
      }
    };

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
      <div className="vault-card loading">
        <div className="skeleton"></div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="vault-card error">
        <p>Vault not found</p>
      </div>
    );
  }

  return (
    <div className={`vault-card ${canWithdrawNow ? 'withdrawable' : ''}`}>
      <div className="vault-header">
        <h3>Vault #{vaultId}</h3>
        <span className={`status ${canWithdrawNow ? 'ready' : 'locked'}`}>
          {canWithdrawNow ? '🟢 Ready' : '🔒 Locked'}
        </span>
      </div>
      
      <div className="vault-details">
        <div className="detail-row">
          <span className="label">Amount:</span>
          <span className="value">{formatSTX(vault.amount)} STX</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Time Remaining:</span>
          <span className="value">{formatTime(timeRemaining)}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Unlock Block:</span>
          <span className="value">{vault['unlock-block']}</span>
        </div>
        
        {vault.bot && (
          <div className="detail-row">
            <span className="label">Bot:</span>
            <span className="value bot">{vault.bot.slice(0, 10)}...</span>
          </div>
        )}
      </div>
      
      <div className="vault-actions">
        {canWithdrawNow ? (
          <button 
            className="btn btn-primary"
            onClick={() => onWithdraw(vaultId)}
          >
            Withdraw
          </button>
        ) : (
          <button 
            className="btn btn-secondary"
            onClick={() => onApproveBot(vaultId)}
          >
            Manage Bot
          </button>
        )}
      </div>
    </div>
  );
}

export default VaultCard;
