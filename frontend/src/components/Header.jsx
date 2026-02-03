import React from 'react';
import { useWallet } from '../context/WalletContext';
import './Header.css';

/**
 * Main application header with wallet connection
 */
export function Header() {
  const { isConnected, address, balance, connect, disconnect } = useWallet();

  const formatBalance = (bal) => {
    if (!bal) return '0';
    return (bal / 1_000_000).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <span className="header-logo-icon">⏰</span>
          <span className="header-logo-text">TimeFi</span>
        </div>

        <nav className="header-nav">
          <a href="#dashboard" className="header-nav-link header-nav-link-active">
            Dashboard
          </a>
          <a href="#vaults" className="header-nav-link">
            Vaults
          </a>
          <a href="#rewards" className="header-nav-link">
            Rewards
          </a>
        </nav>

        <div className="header-actions">
          {isConnected ? (
            <div className="header-wallet">
              <div className="header-balance">
                <span className="header-balance-value">{formatBalance(balance)}</span>
                <span className="header-balance-label">STX</span>
              </div>
              
              <button 
                className="header-address"
                onClick={disconnect}
                title="Click to disconnect"
              >
                {truncateAddress(address)}
              </button>
            </div>
          ) : (
            <button className="header-connect" onClick={connect}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
