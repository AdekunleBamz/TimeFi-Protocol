import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { showConnect, disconnect, getStacksProvider } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';

const WalletContext = createContext(null);

const APP_DETAILS = {
  name: 'TimeFi Protocol',
  icon: window.location.origin + '/logo.svg',
};

const NETWORK = new StacksMainnet();

export function WalletProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const provider = getStacksProvider();
    if (provider) {
      // Check if already connected
      const session = localStorage.getItem('blockstack-session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.userData) {
            setUserData(parsed.userData);
          }
        } catch (e) {
          console.error('Failed to restore session:', e);
        }
      }
    }
  }, []);

  // Fetch balance when connected
  useEffect(() => {
    if (userData?.profile?.stxAddress?.mainnet) {
      fetchBalance(userData.profile.stxAddress.mainnet);
    }
  }, [userData]);

  const fetchBalance = async (address) => {
    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/address/${address}/balances`
      );
      const data = await response.json();
      setBalance(data.stx?.balance || '0');
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const connect = useCallback(() => {
    setIsConnecting(true);
    showConnect({
      appDetails: APP_DETAILS,
      onFinish: ({ userSession }) => {
        const data = userSession.loadUserData();
        setUserData(data);
        setIsConnecting(false);
      },
      onCancel: () => {
        setIsConnecting(false);
      },
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setUserData(null);
    setBalance(null);
    localStorage.removeItem('blockstack-session');
  }, []);

  const value = {
    userData,
    isConnected: !!userData,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
    network: NETWORK,
    stxAddress: userData?.profile?.stxAddress?.mainnet || null,
    balance,
    refreshBalance: () => {
      if (userData?.profile?.stxAddress?.mainnet) {
        fetchBalance(userData.profile.stxAddress.mainnet);
      }
    },
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
