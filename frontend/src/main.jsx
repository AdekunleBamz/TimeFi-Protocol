import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './Router';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <AppRouter />
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>
);
