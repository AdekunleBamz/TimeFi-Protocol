import { createContext, useContext, useState, useCallback } from 'react';
import { showConnect, disconnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const WalletContext = createContext(null);

const appDetails = {
  name: 'TimeFi Protocol',
  icon: '/logo.svg',
};

export function WalletProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const network = new StacksMainnet();

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
  }, []);

  const value = {
    userData,
    isConnected: !!userData,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
    network,
    stxAddress: userData?.profile?.stxAddress?.mainnet || null,
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
