/**
 * TimeFi Protocol - Frontend Entry Point
 *
 * Initializes the React application with all required providers:
 * - ThemeProvider: Light/dark mode support
 * - WalletProvider: Stacks wallet connection
 * - ToastProvider: Global toast notifications
 * - AppRouter: React Router with lazy-loaded pages
 *
 * @module main
 * @author adekunlebamz
 * @see {@link https://timefi.io} for protocol documentation
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './Router';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';
import { ToastProvider } from './components/Toast';
import './index.css';

/**
 * App Root - Mounts the application to the DOM.
 *
 * Wraps the app in React.StrictMode for development warnings
 * and provides all global context providers.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>
);
