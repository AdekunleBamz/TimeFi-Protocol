import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useBlockHeight } from '../hooks/useBlockHeight';
import { useContract } from '../hooks/useContract';
import { useReadOnly } from '../hooks/useReadOnly';
import { formatSTX, formatAddress, formatRelativeTime } from '../utils/format';
import { Progress } from './Progress';
import { Badge } from './Badge';
import { Button } from './Button';
import { Countdown } from './Countdown';
import { CopyButton } from './CopyButton';
import { useToast } from './Toast';
import { Skeleton } from './Skeleton';
import './VaultDetails.css';

/**
 * Vault details page component
 */
export function VaultDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const { blockHeight } = useBlockHeight();
  const { withdraw, emergencyWithdraw, claimRewards, loading: txLoading } = useContract();
  const { toast } = useToast();
  const vaultId = Number.parseInt(id, 10);

  const { data: vault, loading, error, refetch } = useReadOnly(
    'get-vault-details',
    Number.isFinite(vaultId) ? [vaultId] : [],
    { enabled: Number.isFinite(vaultId) }
  );

  const normalizedVault = useMemo(() => normalizeVault(vault), [vault]);

  const isOwner = useMemo(() => {
    return normalizedVault?.owner === address;
  }, [normalizedVault, address]);

  const blocksRemaining = useMemo(() => {
    if (!normalizedVault || !blockHeight) return null;
    return Math.max(normalizedVault.unlockHeight - blockHeight, 0);
  }, [normalizedVault, blockHeight]);

  const countdownSeconds = useMemo(() => {
    if (blocksRemaining === null || blocksRemaining === undefined) return null;
    return blocksRemaining * 600;
  }, [blocksRemaining]);

  const vaultStatus = useMemo(() => {
    if (!normalizedVault) return null;

    if (normalizedVault.withdrawn) return 'withdrawn';
    if (normalizedVault.emergencyUnlocked) return 'emergency';
    if (blocksRemaining === 0) return 'unlocked';
    return 'locked';
  }, [normalizedVault, blocksRemaining]);

  const progressPercent = useMemo(() => {
    if (!normalizedVault) return 0;
    if (blocksRemaining === null || blocksRemaining === undefined) return 0;

    const total = normalizedVault.lockDuration
      || Math.max(normalizedVault.unlockHeight - normalizedVault.createdHeight, 1);
    const elapsed = Math.max(total - blocksRemaining, 0);

    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }, [normalizedVault, blocksRemaining]);

  const handleWithdraw = async () => {
    try {
      await withdraw(vaultId, {
        onFinish: ({ txId }) => {
          toast.success(`Withdraw submitted: ${txId.slice(0, 10)}...`);
          refetch();
        },
        onCancel: () => toast.info('Withdraw transaction cancelled'),
      });
    } catch (withdrawError) {
      toast.error(withdrawError.message || 'Withdraw failed');
    }
  };

  const handleClaimRewards = async () => {
    try {
      await claimRewards(vaultId, {
        onFinish: ({ txId }) => {
          toast.success(`Rewards claim submitted: ${txId.slice(0, 10)}...`);
          refetch();
        },
        onCancel: () => toast.info('Rewards claim cancelled'),
      });
    } catch (claimError) {
      toast.error(claimError.message || 'Failed to claim rewards');
    }
  };

  const handleEmergencyWithdraw = async () => {
    const proceed = window.confirm(
      'Emergency withdraw can include penalties and bypasses the normal unlock schedule. Continue?'
    );
    if (!proceed) return;

    try {
      await emergencyWithdraw(vaultId, {
        onFinish: ({ txId }) => {
          toast.warning(`Emergency withdraw submitted: ${txId.slice(0, 10)}...`);
          refetch();
        },
        onCancel: () => toast.info('Emergency withdraw cancelled'),
      });
    } catch (emergencyError) {
      toast.error(emergencyError.message || 'Emergency withdraw failed');
    }
  };

  if (loading) {
    return <VaultDetailsSkeleton />;
  }

  if (error || !vault) {
    return (
      <div className="vault-details-error">
        <h2>Vault Not Found</h2>
        <p>The vault you're looking for doesn't exist or has been removed.</p>
        <div className="vault-error-actions">
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          <Button variant="secondary" onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-details">
      <header className="vault-details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="vault-header-row">
          <div className="vault-title">
            <h1>Vault #{id}</h1>
            <Badge variant={getStatusVariant(vaultStatus)}>
              {vaultStatus}
            </Badge>
          </div>
          <div className="vault-header-actions">
            <CopyButton text={String(id)} variant="text" successMessage="Vault id copied" />
            <a
              href={`https://explorer.hiro.so/address/${normalizedVault.owner}?chain=mainnet`}
              className="vault-header-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              View owner
            </a>
          </div>
        </div>
      </header>

      <div className="vault-details-grid">
        {/* Main Stats */}
        <section className="vault-section vault-stats">
          <h2>Balance</h2>
          <div className="vault-balance">
            <span className="balance-amount">{formatSTX(normalizedVault.amount)}</span>
            <span className="balance-currency">STX</span>
          </div>
          
          {normalizedVault.rewards > 0 && (
            <div className="vault-rewards">
              <span className="rewards-label">Pending Rewards</span>
              <span className="rewards-amount">+{formatSTX(normalizedVault.rewards)} STX</span>
            </div>
          )}
        </section>

        {/* Lock Progress */}
        <section className="vault-section vault-progress">
          <h2>Lock Progress</h2>
          <Progress value={progressPercent} size="lg" showLabel />
          
          <div className="progress-details">
            {vaultStatus === 'locked' && countdownSeconds !== null && (
              <>
                <span className="progress-label">Unlocks in</span>
                <Countdown 
                  seconds={countdownSeconds}
                  variant="compact"
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
                  href={`https://explorer.hiro.so/address/${normalizedVault.owner}?chain=mainnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formatAddress(normalizedVault.owner)}
                </a>
                <CopyButton text={normalizedVault.owner} className="vault-owner-copy" />
                {isOwner && <Badge variant="info" size="sm">You</Badge>}
              </dd>
            </div>
            <div className="info-item">
              <dt>Unlock Block</dt>
              <dd>#{normalizedVault.unlockHeight.toLocaleString()}</dd>
            </div>
            <div className="info-item">
              <dt>Created</dt>
              <dd>{formatCreatedDisplay(normalizedVault.createdAt, normalizedVault.createdHeight)}</dd>
            </div>
            <div className="info-item">
              <dt>Lock Duration</dt>
              <dd>{normalizedVault.lockDuration.toLocaleString()} blocks</dd>
            </div>
            <div className="info-item">
              <dt>Blocks Remaining</dt>
              <dd>{blocksRemaining === null ? '--' : blocksRemaining.toLocaleString()}</dd>
            </div>
          </dl>
        </section>

        {/* Actions */}
        {isOwner && isConnected && (
          <section className="vault-section vault-actions">
            <h2>Actions</h2>
            <div className="action-buttons">
              {vaultStatus === 'unlocked' && (
                <Button variant="primary" size="lg" fullWidth loading={txLoading} onClick={handleWithdraw}>
                  Withdraw Funds
                </Button>
              )}
              {normalizedVault.rewards > 0 && (
                <Button variant="secondary" size="lg" fullWidth loading={txLoading} onClick={handleClaimRewards}>
                  Claim Rewards
                </Button>
              )}
              {vaultStatus === 'locked' && (
                <Button variant="danger" size="lg" fullWidth loading={txLoading} onClick={handleEmergencyWithdraw}>
                  Emergency Withdraw
                </Button>
              )}
            </div>
          </section>
        )}

        {!isConnected && (
          <section className="vault-section vault-actions">
            <h2>Actions</h2>
            <p className="vault-actions-note">Connect your wallet to interact with this vault.</p>
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
    emergency: 'danger'
  };
  return variants[status] || 'default';
}

function normalizeVault(vault) {
  if (!vault) return null;

  return {
    amount: Number(vault.amount ?? vault['amount'] ?? 0),
    rewards: Number(vault.rewards ?? vault['pending-rewards'] ?? 0),
    owner: vault.owner ?? vault['owner'] ?? '',
    unlockHeight: Number(vault.unlockHeight ?? vault['unlock-height'] ?? vault['unlock-block'] ?? 0),
    lockDuration: Number(vault.lockDuration ?? vault['lock-duration'] ?? 0),
    createdAt: Number(vault.createdAt ?? vault['created-at'] ?? 0),
    createdHeight: Number(vault.createdHeight ?? vault['created-height'] ?? vault['deposit-block'] ?? 0),
    withdrawn: Boolean(vault.withdrawn ?? vault.isWithdrawn ?? vault['withdrawn']),
    emergencyUnlocked: Boolean(vault.emergencyUnlocked ?? vault['emergency-unlocked']),
  };
}

function formatCreatedDisplay(createdAt, createdHeight) {
  if (createdAt > 1_000_000_000_000) {
    return formatRelativeTime(createdAt);
  }
  if (createdAt > 1_000_000_000) {
    return formatRelativeTime(createdAt * 1000);
  }
  if (createdHeight > 0) {
    return `Block #${createdHeight.toLocaleString()}`;
  }
  return '--';
}

export default VaultDetails;
