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
import { Tooltip } from './Tooltip';
import './VaultDetails.css';

const ACTIVE_NETWORK =
  String(import.meta.env.VITE_NETWORK || 'mainnet').trim().toLowerCase() === 'testnet'
    ? 'testnet'
    : 'mainnet';

/**
 * VaultDetails - Full page view for individual vault details.
 *
 * Displays comprehensive vault information including balance, lock progress,
 * timing details, and available actions (withdraw, claim rewards, emergency).
 * Handles both owner and read-only views.
 *
 * @returns {JSX.Element} Vault details page element
 * @example
 * // Used in Router
 * <Route path="/vault/:id" element={<VaultDetails />} />
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

  const approximateRemainingLabel = useMemo(() => {
    if (countdownSeconds === null || countdownSeconds === undefined) return '--';
    if (countdownSeconds <= 0) return 'Ready now';

    const days = Math.floor(countdownSeconds / 86400);
    const hours = Math.ceil((countdownSeconds % 86400) / 3600);

    if (days > 0) {
      return `~${days}d ${hours}h`;
    }

    return `~${Math.ceil(countdownSeconds / 3600)}h`;
  }, [countdownSeconds]);

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

  const statusBanner = useMemo(() => {
    if (!normalizedVault) {
      return {
        title: 'Loading vault state',
        message: 'Waiting for vault data from the network.',
        tone: 'neutral',
      };
    }

    if (vaultStatus === 'withdrawn') {
      return {
        title: 'Vault already withdrawn',
        message: 'Funds have already left this vault, so no further actions are available here.',
        tone: 'neutral',
      };
    }

    if (vaultStatus === 'emergency') {
      return {
        title: 'Emergency path used',
        message: 'This vault has already gone through the emergency unlock path.',
        tone: 'danger',
      };
    }

    if (vaultStatus === 'unlocked') {
      return {
        title: isOwner ? 'Vault is ready for withdrawal' : 'Vault has reached unlock height',
        message: isOwner
          ? 'You can withdraw the principal now and claim rewards if any are queued.'
          : 'This vault is now withdrawable by its owner.',
        tone: 'success',
      };
    }

    return {
      title: 'Vault is still time-locked',
      message: isOwner
        ? `Wait until block #${normalizedVault.unlockHeight.toLocaleString()} or use the emergency path if you accept penalties.`
        : `This vault stays locked until block #${normalizedVault.unlockHeight.toLocaleString()}.`,
      tone: 'warning',
    };
  }, [normalizedVault, vaultStatus, isOwner]);

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
        <p>Vault #{id} could not be loaded. It may not exist on this network, or the route may be stale.</p>
        <div className="vault-error-tips">
          <span>Check the vault id in the URL.</span>
          <span>Return to the dashboard to browse available vaults.</span>
          <span>Retry if the network is still loading.</span>
        </div>
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
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
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
              href={`https://explorer.hiro.so/address/${normalizedVault.owner}?chain=${ACTIVE_NETWORK}`}
              className="vault-header-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View vault owner on Hiro Explorer (opens in new tab)"
              title="Open vault owner in Hiro Explorer"
            >
              View owner
            </a>
          </div>
        </div>
      </header>

      <div className="vault-summary-strip">
        <div className="vault-summary-chip">
          <span>Blocks remaining</span>
          <strong>{blocksRemaining === null ? '--' : blocksRemaining.toLocaleString()}</strong>
        </div>
        <div className="vault-summary-chip">
          <span>Rewards queued</span>
          <strong>{formatSTX(normalizedVault.rewards)} STX</strong>
        </div>
        <div className="vault-summary-chip">
          <span>Owner status</span>
          <strong>{isOwner ? 'Your vault' : 'Read-only view'}</strong>
        </div>
      </div>

      <section className={`vault-status-banner vault-status-banner-${statusBanner.tone}`}>
        <div>
          <span className="vault-status-banner-label">Current state</span>
          <strong>{statusBanner.title}</strong>
        </div>
        <p>{statusBanner.message}</p>
      </section>

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

        <section className="vault-section vault-timing">
          <h2>Chain Timing</h2>
          <div className="vault-timing-grid">
            <div className="vault-timing-card">
              <span>Current block</span>
              <strong>{blockHeight?.toLocaleString() || '--'}</strong>
            </div>
            <div className="vault-timing-card">
              <span>Unlock block</span>
              <strong>#{normalizedVault.unlockHeight.toLocaleString()}</strong>
            </div>
            <div className="vault-timing-card">
              <span>Approx. time left</span>
              <strong>{approximateRemainingLabel}</strong>
            </div>
          </div>
          <p className="vault-timing-note">
            Stacks timing is block-based. Calendar estimates help with planning, but the unlock block is the source of truth.
          </p>
        </section>

        {/* Vault Info */}
        <section className="vault-section vault-info">
          <h2>Details</h2>
          <dl className="info-list">
            <div className="info-item">
              <dt>Owner</dt>
              <dd>
                <a
                  href={`https://explorer.hiro.so/address/${normalizedVault.owner}?chain=${ACTIVE_NETWORK}`}
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
            <div className="vault-action-guidance">
              <div className="vault-action-guidance-item">
                <strong>Withdraw</strong>
                <span className={`vault-action-state ${vaultStatus === 'unlocked' ? 'vault-action-state-live' : ''}`}>
                  {vaultStatus === 'unlocked' ? 'Available now' : 'Unlock required'}
                </span>
                <span className="vault-action-copy">Available once the vault unlock height is reached.</span>
              </div>
              <div className="vault-action-guidance-item">
                <strong>Claim rewards</strong>
                <span className={`vault-action-state ${normalizedVault.rewards > 0 ? 'vault-action-state-live' : ''}`}>
                  {normalizedVault.rewards > 0 ? 'Rewards queued' : 'Nothing queued'}
                </span>
                <span className="vault-action-copy">Only appears when rewards are currently queued on this vault.</span>
              </div>
              <div className="vault-action-guidance-item">
                <strong>Emergency withdraw</strong>
                <span className={`vault-action-state ${vaultStatus === 'locked' ? 'vault-action-state-warning' : ''}`}>
                  {vaultStatus === 'locked' ? 'Available with penalty' : 'No longer needed'}
                </span>
                <span className="vault-action-copy">Use only if you need early access and accept the penalty path.</span>
              </div>
            </div>
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
 * VaultDetailsSkeleton - Loading placeholder for vault details page.
 * @returns {JSX.Element} Skeleton layout
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
 * getStatusVariant - Map vault status to Badge component variant.
 * @param {string} status - Vault status string
 * @returns {string} Badge variant ('success', 'warning', 'danger', 'default')
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

/**
 * normalizeVault - Normalize vault data from various API response formats.
 * @param {Object} vault - Raw vault data from contract read
 * @returns {Object|null} Normalized vault object with consistent property names
 */
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

/**
 * formatCreatedDisplay - Format vault creation timestamp for display.
 * Handles various timestamp formats (milliseconds, seconds, block height).
 * @param {number} createdAt - Creation timestamp
 * @param {number} createdHeight - Block height at creation
 * @returns {string} Formatted display string
 */
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
