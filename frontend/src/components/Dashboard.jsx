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
import './Dashboard.css';

/**
 * Main dashboard page component
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
          <div>
            <span className="dashboard-wallet-label">Connected wallet</span>
            <strong>{address?.slice(0, 8)}...{address?.slice(-6)}</strong>
          </div>
          <div>
            <span className="dashboard-wallet-label">Available balance</span>
            <strong>{(balance / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 4 })} STX</strong>
          </div>
          <div>
            <span className="dashboard-wallet-label">Current block</span>
            <strong>{blockHeight?.toLocaleString() || '--'}</strong>
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
              <p>Connect your wallet to create a time-locked vault</p>
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
              <div className="vault-controls">
                <label className="vault-control-field">
                  <span>Search</span>
                  <input
                    type="text"
                    className="vault-control-input"
                    placeholder="Find by vault id"
                    value={vaultSearch}
                    onChange={(e) => setVaultSearch(e.target.value)}
                  />
                </label>
                <label className="vault-control-field">
                  <span>Sort</span>
                  <select
                    className="vault-control-select"
                    value={vaultSort}
                    onChange={(e) => setVaultSort(e.target.value)}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </label>
              </div>
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
