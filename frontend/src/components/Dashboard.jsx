import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useReadOnly } from '../hooks/useReadOnly';
import { useBlockHeight } from '../hooks/useBlockHeight';
import { formatSTX } from '../utils/format';
import { StatsCard } from './StatsCard';
import { VaultCard } from './VaultCard';
import { CreateVaultForm } from './CreateVaultForm';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import { Tooltip } from './Tooltip';
import './Dashboard.css';


/**
 * Dashboard - Main landing page for TimeFi protocol.
 *
 * Displays protocol-wide statistics (TVL, vault count, block height),
 * user vault management with search/sort, and vault creation form.
 * Serves as the primary entry point for both connected and guest users.
 *
 * @returns {JSX.Element} Dashboard page element
 * @example
 * // Used as main route
 * <Route path="/" element={<Dashboard />} />
 */
export function Dashboard() {
  const { address, balance, isConnected, connect } = useWallet();
  const { blockHeight } = useBlockHeight();
  const location = useLocation();
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultSort, setVaultSort] = useState('newest');

  // Fetch user vaults
  const { data: vaultIds, loading: vaultsLoading } = useReadOnly(
    'get-user-vaults',
    address ? [address] : null,
    { enabled: isConnected }
  );

  // Fetch protocol stats
  const { data: totalLocked } = useReadOnly('get-total-locked', []);
  const { data: vaultCount } = useReadOnly('get-vault-count', []);

  // Calculate user stats
  const userStats = useMemo(() => {
    if (!vaultIds) return { totalVaults: 0, activeVaults: 0 };

    return {
      totalVaults: vaultIds.length,
      activeVaults: vaultIds.length, // Would filter by active status
    };
  }, [vaultIds]);

  const protocolSnapshot = useMemo(() => ([
    {
      label: 'Protocol TVL',
      value: totalLocked === null || totalLocked === undefined ? '--' : `${formatSTX(totalLocked)} STX`,
      tone: 'teal',
    },
    {
      label: 'Vault count',
      value: vaultCount === null || vaultCount === undefined ? '--' : vaultCount.toLocaleString(),
      tone: 'amber',
    },
    {
      label: 'Current block',
      value: blockHeight === null || blockHeight === undefined ? '--' : `#${blockHeight.toLocaleString()}`,
      tone: 'slate',
    },
  ]), [totalLocked, vaultCount, blockHeight]);

  const filteredVaultIds = useMemo(() => {
    if (!Array.isArray(vaultIds)) return [];

    const query = vaultSearch.trim().toLowerCase();
    const searched = query
      ? vaultIds.filter((vaultId) => String(vaultId).toLowerCase().includes(query))
      : vaultIds;

    const sorted = [...searched].sort((a, b) => {
      if (vaultSort === 'oldest') return a - b;
      return b - a;
    });

    return sorted;
  }, [vaultIds, vaultSearch, vaultSort]);

  useEffect(() => {
    if (!location.hash) return;
    const targetId = location.hash.replace('#', '');
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="dashboard-hero" id="dashboard">
        <div className="dashboard-hero-eyebrow">Time-locked savings protocol on Stacks</div>
        <h1>Welcome to TimeFi</h1>
        <p>Time-locked vaults for disciplined savings on Stacks</p>
        <div className="dashboard-hero-links">
          <a href="#create-vault" className="dashboard-hero-link">Start a vault</a>
          <a href="#your-vaults" className="dashboard-hero-link">Browse your vaults</a>
        </div>
        <div className="dashboard-hero-metrics" role="list" aria-label="Protocol snapshot">
          {protocolSnapshot.map((metric) => (
            <Tooltip key={metric.label} content={`Live ${metric.label.toLowerCase()} tracking`}>
              <div
                className={`dashboard-hero-metric dashboard-hero-metric-${metric.tone}`}
                role="listitem"
              >
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            </Tooltip>
          ))}

        </div>
        <div className="dashboard-hero-highlights">
          <span>Fixed lock windows</span>
          <span>On-chain reward requests</span>
          <span>Emergency flow support</span>
        </div>
        {!isConnected && (
          <button type="button" className="dashboard-hero-cta" onClick={connect}>
            Connect Wallet to Start
          </button>
        )}
      </section>

      {isConnected && (
        <section className="dashboard-wallet-panel">
          <div className="dashboard-wallet-primary">
            <span className="dashboard-wallet-label">Connected wallet</span>
            <strong>{address?.slice(0, 8)}...{address?.slice(-6)}</strong>
            <p>Track vault progress, watch unlock timing, and jump directly into your next action.</p>
          </div>
          <div className="dashboard-wallet-stat">
            <span className="dashboard-wallet-label">Available balance</span>
            <strong>{(balance / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 4 })} STX</strong>
          </div>
          <div className="dashboard-wallet-stat">
            <span className="dashboard-wallet-label">Your vaults</span>
            <strong>{userStats.totalVaults.toLocaleString()}</strong>
          </div>
          <div className="dashboard-wallet-stat">
            <span className="dashboard-wallet-label">Current block</span>
            <strong>{blockHeight?.toLocaleString() || '--'}</strong>
          </div>
          <div className="dashboard-wallet-actions">
            <a href="#create-vault" className="dashboard-wallet-action">Create another vault</a>
            <a href="#your-vaults" className="dashboard-wallet-action dashboard-wallet-action-secondary">Review portfolio</a>
          </div>
        </section>
      )}

      {/* Protocol Stats */}
      <section className="dashboard-stats">
        <StatsCard
          label="Total Value Locked"
          value={
            totalLocked === null || totalLocked === undefined
              ? '--'
              : `${formatSTX(totalLocked)} STX`
          }
          icon="🏦"
          subValue="Protocol-wide deposits"
          loading={totalLocked === null || totalLocked === undefined}
        />
        <StatsCard
          label="Total Vaults"
          value={vaultCount?.toLocaleString() || '--'}
          icon="🧱"
          subValue="All active + matured vaults"
          loading={vaultCount === null || vaultCount === undefined}
        />
        <StatsCard
          label="Current Block"
          value={blockHeight?.toLocaleString() || '--'}
          icon="⛓️"
          subValue="Live chain height"
          loading={blockHeight === null || blockHeight === undefined}
        />
        {isConnected && (
          <StatsCard
            label="Your Vaults"
            value={userStats.totalVaults.toString()}
            icon="🗂️"
            subValue="Vaults linked to this wallet"
            loading={vaultsLoading}
          />
        )}
      </section>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Create Vault */}
        <section className="dashboard-section" id="create-vault">
          <div className="dashboard-section-header dashboard-section-header-create">
            <div>
              <h2>Create New Vault</h2>
              <p className="dashboard-section-copy">Choose an amount, lock window, and expected yield before you sign.</p>
            </div>
          </div>
          {isConnected ? (
            <div className="create-vault-layout">
              <CreateVaultForm />
              <aside className="create-vault-guide">
                <h3>Before you submit</h3>
                <ul>
                  <li>Longer locks improve reward potential.</li>
                  <li>Keep extra STX free for network fees.</li>
                  <li>Vault withdrawals unlock by block height, not local clock time.</li>
                </ul>
              </aside>
            </div>
          ) : (
            <div className="connect-prompt">
              <p>Connect your wallet to start creating time-locked vaults with live reward previews.</p>
              <div className="connect-prompt-highlights">
                <span>Preview unlock block before signing</span>
                <span>Track every vault from one dashboard</span>
                <span>Claim rewards when they mature</span>
              </div>
              <button type="button" className="dashboard-hero-cta" onClick={connect}>
                Connect Wallet to Continue
              </button>
            </div>
          )}
        </section>

        {/* User Vaults */}
        {isConnected && (
          <section className="dashboard-section" id="your-vaults">
            <div className="dashboard-section-header">
              <h2>Your Vaults</h2>
              {Array.isArray(vaultIds) && vaultIds.length > 0 && (
                <span className="vault-count-chip">
                  {filteredVaultIds.length} / {vaultIds.length}
                </span>
              )}
            </div>
            {!vaultsLoading && Array.isArray(vaultIds) && vaultIds.length > 0 && (
              <>
                <div className="vault-controls">
                  <label className="vault-control-field">
                    <span>Search</span>
                    <input
                      type="text"
                      className="vault-control-input"
                      placeholder="Find by vault id"
                      value={vaultSearch}
                      onChange={(e) => setVaultSearch(e.target.value)}
                      aria-label="Search vaults by ID"
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          setVaultSearch('');
                        }
                      }}
                    />
                  </label>
                  <label className="vault-control-field">
                    <span>Sort</span>
                    <select
                      className="vault-control-select"
                      value={vaultSort}
                      onChange={(e) => setVaultSort(e.target.value)}
                      aria-label="Sort vaults"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  </label>
                </div>
                <div className="vault-browser-summary">
                  <span role="status" aria-live="polite">
                    Showing {filteredVaultIds.length} vault{filteredVaultIds.length === 1 ? '' : 's'}
                    {vaultSearch.trim() ? ` matching "${vaultSearch.trim()}"` : ''}
                  </span>
                  <div className="vault-browser-state">
                    <span className="vault-browser-chip">
                      {vaultSort === 'newest' ? 'Newest first' : 'Oldest first'}
                    </span>
                    {vaultSearch.trim() && (
                      <span className="vault-browser-chip vault-browser-chip-accent">
                        Filter active
                      </span>
                    )}
                  </div>
                  {(vaultSearch.trim() || vaultSort !== 'newest') && (
                    <button
                      type="button"
                      className="vault-browser-reset"
                      onClick={() => {
                        setVaultSearch('');
                        setVaultSort('newest');
                      }}
                      title="Reset vault search and sorting"
                    >
                      Reset search and sort
                    </button>
                  )}
                </div>
              </>
            )}
            {vaultsLoading ? (
              <div className="vaults-grid">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={200} borderRadius={12} />
                ))}
              </div>
            ) : filteredVaultIds.length > 0 ? (
              <div className="vaults-grid">
                {filteredVaultIds.map((id) => (
                  <VaultCard key={id} vaultId={id} />
                ))}
              </div>
            ) : vaultSearch.trim() ? (
              <EmptyState
                title="No matching vaults"
                description={`No vault id matched "${vaultSearch.trim()}".`}
                icon="🧭"
                action={
                  <button
                    type="button"
                    className="dashboard-clear-filters"
                    onClick={() => setVaultSearch('')}
                  >
                    Clear Search
                  </button>
                }
              />
            ) : (
              <EmptyState
                title="No vaults yet"
                description="Create your first time-locked vault to start saving"
                icon="🔐"
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
