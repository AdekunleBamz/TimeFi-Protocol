import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { showConnect, AppConfig, UserSession } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const WalletContext = createContext(null);

/** Stacks Connect app metadata displayed in the wallet connection modal. */
const appDetails = {
  name: 'TimeFi Protocol',
  icon: `${typeof window !== 'undefined' ? window.location.origin : ''}/logo.svg`,
};

/** Requests read/write and publish permissions from the connected wallet. */
const appConfig = new AppConfig(['store_write', 'publish_data']);
/** Shared user session — reused across auth flows and contract transactions. */
export const userSession = new UserSession({ appConfig });

/**
 * WalletProvider - Provides wallet connection state to the component tree.
 *
 * Manages Leather/Hiro wallet auth, handles the post-auth redirect, and
 * exposes connect/disconnect helpers plus the active Stacks address.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function WalletProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const network = new StacksMainnet();

  // Handle redirect-back from Leather / Hiro after auth confirm
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((data) => {
        setUserData(data);
      }).catch(() => {
        // auth response invalid or cancelled — ignore
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  /**
   * connect - Open the Stacks wallet connection modal and update auth state on success.
   */
  const connect = useCallback(() => {
    setIsConnecting(true);
    showConnect({
      appDetails,
      userSession,
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
        setIsConnecting(false);
      },
      onCancel: () => {
        setIsConnecting(false);
      },
    });
  }, []);

  /**
   * disconnectWallet - Sign the user out and clear wallet state.
   */
  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setUserData(null);
  }, []);

  const stxAddress = userData?.profile?.stxAddress?.mainnet || null;

  const value = {
    userData,
    isConnected: !!userData,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
    network,
    stxAddress,
    address: stxAddress,
    balance: null,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * useWallet - Consume the WalletContext.
 *
 * Must be used inside a `<WalletProvider>`. Throws if called outside.
 *
 * @returns {{ userData: Object|null, isConnected: boolean, isConnecting: boolean, connect: Function, disconnect: Function, network: StacksMainnet, stxAddress: string|null, address: string|null, balance: null }}
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
