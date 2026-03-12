import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
    <div style={{ padding: '2rem' }} role="status" aria-live="polite">
      <Skeleton height={200} borderRadius={12} />
      <div style={{ marginTop: '1rem' }}>
        <Skeleton height={400} borderRadius={12} />
      </div>
    </div>
  );
}

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  return null;
}

/**
 * App router configuration
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Header />
      <main className="app-main">
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
