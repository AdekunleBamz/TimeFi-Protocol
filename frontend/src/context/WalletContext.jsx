import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { showConnect, disconnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

const WalletContext = createContext(null);

const appDetails = {
  name: 'TimeFi Protocol',
  icon: '/logo.svg',
};

export function WalletProvider({ children }) {
  const [userData, setUserData] = useLocalStorage(STORAGE_KEYS.WALLET_SESSION, null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(0);

  const network = useMemo(() => (
    import.meta.env.VITE_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet()
  ), []);
  const address = useMemo(() => {
    if (!userData?.profile?.stxAddress) return null;
    return import.meta.env.VITE_NETWORK === 'mainnet'
      ? userData.profile.stxAddress.mainnet
      : userData.profile.stxAddress.testnet;
  }, [userData]);

  const connect = useCallback(() => {
    setIsConnecting(true);
    showConnect({
      appDetails,
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
    setBalance(0);
  }, []);

  useEffect(() => {
    if (!address) return;

    let mounted = true;
    const fetchBalance = async () => {
      try {
        const response = await fetch(`${network.coreApiUrl}/extended/v1/address/${address}/balances`);
        if (!response.ok) throw new Error('Failed to fetch balance');
        const data = await response.json();
        if (mounted) {
          setBalance(Number(data?.stx?.balance || 0));
        }
      } catch (error) {
        console.error('Wallet balance fetch failed:', error);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [address, network]);

  const value = {
    userData,
    isConnected: !!userData,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
    network,
    address,
    balance,
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
