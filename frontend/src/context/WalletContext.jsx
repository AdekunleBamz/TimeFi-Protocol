import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { showConnect, AppConfig, UserSession } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { env } from '../config/env';
import { getAccountBalance } from '../services/api';

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
  const [accountBalance, setAccountBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const balanceRequestId = useRef(0);

  const network = env.isTestnet || env.isDevnet ? new StacksTestnet() : new StacksMainnet();
  const walletAddresses = userData?.profile?.stxAddress || {};
  const configuredAddress = env.isTestnet || env.isDevnet
    ? walletAddresses.testnet || null
    : walletAddresses.mainnet || null;
  const fallbackAddress = env.isTestnet || env.isDevnet
    ? walletAddresses.mainnet || null
    : walletAddresses.testnet || null;
  const stxAddress = configuredAddress || fallbackAddress || null;

  const refreshBalance = useCallback(async () => {
    const requestId = balanceRequestId.current + 1;
    balanceRequestId.current = requestId;

    if (!stxAddress) {
      setAccountBalance(null);
      setBalanceError(null);
      setBalanceLoading(false);
      return null;
    }

    setBalanceLoading(true);
    setBalanceError(null);

    try {
      let nextBalance = await getAccountBalance(stxAddress);
      const shouldTryFallbackBalance = fallbackAddress
        && fallbackAddress !== stxAddress
        && Number(nextBalance?.estimatedBalance ?? nextBalance?.balance ?? 0) === 0
        && Number(nextBalance?.totalReceived ?? 0) === 0;

      if (shouldTryFallbackBalance) {
        const fallbackBalance = await getAccountBalance(fallbackAddress);
        const fallbackEstimatedBalance = Number(fallbackBalance?.estimatedBalance ?? fallbackBalance?.balance ?? 0);
        if (fallbackEstimatedBalance > 0 || Number(fallbackBalance?.totalReceived ?? 0) > 0) {
          nextBalance = {
            ...fallbackBalance,
            address: fallbackAddress,
            sourceNetwork: env.isTestnet || env.isDevnet ? 'mainnet' : 'testnet',
          };
        }
      }

      if (balanceRequestId.current === requestId) {
        setAccountBalance(nextBalance);
      }
      return nextBalance;
    } catch (error) {
      const message = error?.message || 'Unable to fetch wallet balance';
      if (balanceRequestId.current === requestId) {
        setBalanceError(message);
        setAccountBalance(null);
      }
      return null;
    } finally {
      if (balanceRequestId.current === requestId) {
        setBalanceLoading(false);
      }
    }
  }, [stxAddress]);

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
    balanceRequestId.current += 1;
    userSession.signUserOut();
    setUserData(null);
    setAccountBalance(null);
    setBalanceError(null);
    setBalanceLoading(false);
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const value = {
    userData,
    isConnected: !!userData,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
    network,
    stxAddress,
    address: stxAddress,
    accountBalance,
    balance: accountBalance?.estimatedBalance ?? accountBalance?.balance ?? null,
    lockedBalance: accountBalance?.locked ?? null,
    balanceLoading,
    balanceError,
    refreshBalance,
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
 * @returns {{ userData: Object|null, isConnected: boolean, isConnecting: boolean, connect: Function, disconnect: Function, network: StacksMainnet|StacksTestnet, stxAddress: string|null, address: string|null, balance: number|null, lockedBalance: number|null, balanceLoading: boolean, balanceError: string|null, refreshBalance: Function }}
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
