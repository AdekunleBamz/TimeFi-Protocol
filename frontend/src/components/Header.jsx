import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { CopyButton } from './CopyButton';
import './Header.css';

/**
 * Main application header with wallet connection
 */
export function Header() {
  const { isConnected, isConnecting, address, balance, connect, disconnect } = useWallet();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const networkLabel = (import.meta.env.VITE_NETWORK || 'mainnet').toUpperCase();
  const pageLabel = location.pathname.startsWith('/vault/')
    ? `Vault ${location.pathname.replace('/vault/', '#')}`
    : location.pathname === '/404'
      ? 'Route not found'
      : 'Dashboard';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  const formatBalance = (bal) => {
    if (bal === null || bal === undefined) return '--';
    return (bal / 1_000_000).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src="/logo.svg" alt="TimeFi" className="header-logo-img" />
          <div className="header-brand-copy">
            <span className="header-logo-text">TimeFi</span>
            <span className="header-network-pill">{networkLabel}</span>
          </div>
        </Link>

        <div className="header-page-label">{pageLabel}</div>

        <button
          type="button"
          className="header-menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="header-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="header-menu-toggle-label">Menu</span>
          <span className="header-menu-toggle-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <nav
          id="header-navigation"
          className={`header-nav ${isMenuOpen ? 'header-nav-open' : ''}`}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `header-nav-link ${
                isActive && location.hash !== '#create-vault' && location.hash !== '#your-vaults'
                  ? 'header-nav-link-active'
                  : ''
              }`
            }
          >
            Dashboard
          </NavLink>
          <Link
            to="/#create-vault"
            className={`header-nav-link ${
              location.pathname === '/' && location.hash === '#create-vault' ? 'header-nav-link-active' : ''
            }`}
          >
            Create Vault
          </Link>
          <Link
            to="/#your-vaults"
            className={`header-nav-link ${
              location.pathname === '/' && location.hash === '#your-vaults' ? 'header-nav-link-active' : ''
            }`}
          >
            Your Vaults
          </Link>
        </nav>

        <div className={`header-actions ${isMenuOpen ? 'header-actions-open' : ''}`}>
          {isConnected ? (
            <div className="header-wallet">
              <div className="header-balance">
                <span className="header-wallet-state">
                  <span className="header-wallet-dot" />
                  Wallet live
                </span>
                <span className="header-balance-value">{formatBalance(balance)}</span>
                <span className="header-balance-label">STX</span>
              </div>

              <div className="header-wallet-actions">
                <a
                  href={`https://explorer.hiro.so/address/${address}?chain=mainnet`}
                  className="header-wallet-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {truncateAddress(address)}
                </a>
                <CopyButton text={address} className="header-copy-address" successMessage="Address copied" />
                <button
                  className="header-disconnect"
                  onClick={disconnect}
                  aria-label="Disconnect wallet"
                  title="Disconnect wallet"
                >
                  Disconnect
                </button>
              </div>
              <div className="header-wallet-compact">
                <span>{truncateAddress(address)}</span>
                <strong>{formatBalance(balance)} STX</strong>
              </div>
            </div>
          ) : (
            <button className="header-connect" onClick={connect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
