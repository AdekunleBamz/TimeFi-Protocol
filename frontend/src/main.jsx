import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './Router';
import { WalletProvider } from './context/WalletContext';
import { ToastProvider } from './components/Toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </WalletProvider>
  </React.StrictMode>
);
