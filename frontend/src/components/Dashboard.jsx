import React, { useMemo } from 'react';
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
  const { address, isConnected } = useWallet();
  const { blockHeight } = useBlockHeight();
  
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

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <h1>Welcome to TimeFi</h1>
        <p>Time-locked vaults for disciplined savings on Stacks</p>
      </section>

      {/* Protocol Stats */}
      <section className="dashboard-stats">
        <StatsCard
          label="Total Value Locked"
          value={totalLocked ? formatSTX(totalLocked) + ' STX' : '--'}
          loading={!totalLocked}
        />
        <StatsCard
          label="Total Vaults"
          value={vaultCount?.toLocaleString() || '--'}
          loading={!vaultCount}
        />
        <StatsCard
          label="Current Block"
          value={blockHeight?.toLocaleString() || '--'}
          loading={!blockHeight}
        />
        {isConnected && (
          <StatsCard
            label="Your Vaults"
            value={userStats.totalVaults.toString()}
            loading={vaultsLoading}
          />
        )}
      </section>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Create Vault */}
        <section className="dashboard-section">
          <h2>Create New Vault</h2>
          {isConnected ? (
            <CreateVaultForm />
          ) : (
            <div className="connect-prompt">
              <p>Connect your wallet to create a time-locked vault</p>
            </div>
          )}
        </section>

        {/* User Vaults */}
        {isConnected && (
          <section className="dashboard-section">
            <h2>Your Vaults</h2>
            {vaultsLoading ? (
              <div className="vaults-grid">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={200} borderRadius={12} />
                ))}
              </div>
            ) : vaultIds && vaultIds.length > 0 ? (
              <div className="vaults-grid">
                {vaultIds.map((id) => (
                  <VaultCard key={id} vaultId={id} />
                ))}
              </div>
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
