import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Skeleton } from './components/Skeleton';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const VaultDetails = lazy(() => import('./components/VaultDetails'));
const NotFound = lazy(() => import('./components/NotFound'));

/**
 * Page loading fallback
 */
function PageLoader() {
  return (
    <div style={{ padding: '2rem' }}>
      <Skeleton height={200} borderRadius={12} />
      <div style={{ marginTop: '1rem' }}>
        <Skeleton height={400} borderRadius={12} />
      </div>
    </div>
  );
}

/**
 * App router configuration
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/vault/:id" element={<VaultDetails />} />
            
            {/* 404 fallback */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}

export default AppRouter;
