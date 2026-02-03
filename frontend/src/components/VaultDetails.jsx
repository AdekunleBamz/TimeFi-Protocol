import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useReadOnly } from '../hooks/useReadOnly';
import { formatSTX, formatAddress, formatRelativeTime } from '../utils/format';
import { Progress } from './Progress';
import { Badge } from './Badge';
import { Button } from './Button';
import { Countdown } from './Countdown';
import { Skeleton } from './Skeleton';
import './VaultDetails.css';

/**
 * Vault details page component
 */
export function VaultDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();

  const { data: vault, loading, error, refetch } = useReadOnly(
    'get-vault-details',
    [parseInt(id)]
  );

  const isOwner = useMemo(() => {
    return vault?.owner === address;
  }, [vault, address]);

  const vaultStatus = useMemo(() => {
    if (!vault) return null;
    
    const now = Date.now();
    const unlockTime = vault.unlockHeight * 10 * 60 * 1000; // Approximate
    
    if (vault.withdrawn) return 'withdrawn';
    if (now >= unlockTime) return 'unlocked';
    if (vault.emergencyUnlocked) return 'emergency';
    return 'locked';
  }, [vault]);

  const progressPercent = useMemo(() => {
    if (!vault) return 0;
    
    const now = Date.now();
    const startTime = vault.createdAt || now - 86400000;
    const unlockTime = vault.unlockHeight * 10 * 60 * 1000;
    
    const total = unlockTime - startTime;
    const elapsed = now - startTime;
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }, [vault]);

  if (loading) {
    return <VaultDetailsSkeleton />;
  }

  if (error || !vault) {
    return (
      <div className="vault-details-error">
        <h2>Vault Not Found</h2>
        <p>The vault you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="vault-details">
      <header className="vault-details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="vault-title">
          <h1>Vault #{id}</h1>
          <Badge variant={getStatusVariant(vaultStatus)}>
            {vaultStatus}
          </Badge>
        </div>
      </header>

      <div className="vault-details-grid">
        {/* Main Stats */}
        <section className="vault-section vault-stats">
          <h2>Balance</h2>
          <div className="vault-balance">
            <span className="balance-amount">{formatSTX(vault.amount)}</span>
            <span className="balance-currency">STX</span>
          </div>
          
          {vault.rewards > 0 && (
            <div className="vault-rewards">
              <span className="rewards-label">Pending Rewards</span>
              <span className="rewards-amount">+{formatSTX(vault.rewards)} STX</span>
            </div>
          )}
        </section>

        {/* Lock Progress */}
        <section className="vault-section vault-progress">
          <h2>Lock Progress</h2>
          <Progress value={progressPercent} size="lg" showLabel />
          
          <div className="progress-details">
            {vaultStatus === 'locked' && (
              <>
                <span className="progress-label">Unlocks in</span>
                <Countdown 
                  targetBlock={vault.unlockHeight}
                  onComplete={refetch}
                />
              </>
            )}
            {vaultStatus === 'unlocked' && (
              <span className="progress-complete">Ready to withdraw!</span>
            )}
          </div>
        </section>

        {/* Vault Info */}
        <section className="vault-section vault-info">
          <h2>Details</h2>
          <dl className="info-list">
            <div className="info-item">
              <dt>Owner</dt>
              <dd>
                <a 
                  href={`https://explorer.hiro.so/address/${vault.owner}?chain=mainnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formatAddress(vault.owner)}
                </a>
                {isOwner && <Badge variant="info" size="sm">You</Badge>}
              </dd>
            </div>
            <div className="info-item">
              <dt>Unlock Block</dt>
              <dd>#{vault.unlockHeight.toLocaleString()}</dd>
            </div>
            <div className="info-item">
              <dt>Created</dt>
              <dd>{formatRelativeTime(vault.createdAt)}</dd>
            </div>
            <div className="info-item">
              <dt>Lock Duration</dt>
              <dd>{vault.lockDuration} blocks</dd>
            </div>
          </dl>
        </section>

        {/* Actions */}
        {isOwner && isConnected && (
          <section className="vault-section vault-actions">
            <h2>Actions</h2>
            <div className="action-buttons">
              {vaultStatus === 'unlocked' && (
                <Button variant="primary" size="lg" fullWidth>
                  Withdraw Funds
                </Button>
              )}
              {vault.rewards > 0 && (
                <Button variant="secondary" size="lg" fullWidth>
                  Claim Rewards
                </Button>
              )}
              {vaultStatus === 'locked' && (
                <Button variant="danger" size="lg" fullWidth>
                  Emergency Withdraw
                </Button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton loading state
 */
function VaultDetailsSkeleton() {
  return (
    <div className="vault-details">
      <header className="vault-details-header">
        <Skeleton width={80} height={32} />
        <div className="vault-title">
          <Skeleton width={150} height={40} />
          <Skeleton width={80} height={24} />
        </div>
      </header>
      
      <div className="vault-details-grid">
        <section className="vault-section">
          <Skeleton width={100} height={24} />
          <Skeleton width={200} height={48} style={{ marginTop: '1rem' }} />
        </section>
        <section className="vault-section">
          <Skeleton width={120} height={24} />
          <Skeleton height={8} style={{ marginTop: '1rem' }} />
        </section>
        <section className="vault-section">
          <Skeleton width={80} height={24} />
          <Skeleton height={120} style={{ marginTop: '1rem' }} />
        </section>
      </div>
    </div>
  );
}

/**
 * Get badge variant from status
 */
function getStatusVariant(status) {
  const variants = {
    locked: 'warning',
    unlocked: 'success',
    withdrawn: 'default',
    emergency: 'error'
  };
  return variants[status] || 'default';
}

export default VaultDetails;
