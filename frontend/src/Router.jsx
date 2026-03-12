import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Skeleton } from './components/Skeleton';
import { ScrollToTop } from './components/ScrollToTop';
import { Tooltip } from './components/Tooltip';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const VaultDetails = lazy(() => import('./components/VaultDetails'));
const NotFound = lazy(() => import('./components/NotFound'));

/**
 * PageLoader - Suspense fallback component for lazy-loaded routes.
 * @returns {JSX.Element} Loading skeleton layout
 */
function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-hero">
        <Skeleton height={20} width={140} />
        <Skeleton height={56} width="58%" />
        <Skeleton height={18} width="42%" />
      </div>
      <div className="page-loader-grid">
        <Skeleton height={180} />
        <Skeleton height={180} />
        <Skeleton height={180} />
      </div>
      <div className="page-loader-detail">
        <Skeleton height={18} width={160} />
        <Skeleton height={320} style={{ marginTop: '1rem' }} />
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
 * ScrollManager - Scroll to top on route change (except hash navigation).
 * @returns {null} No visual output
 */
function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  return null;
}

/**
 * AppRouter - Main application router with lazy-loaded pages.
 *
 * Configures React Router with code-split pages, scroll management,
 * skip link accessibility, and 404 fallback handling.
 *
 * @returns {JSX.Element} Router configuration element
 * @example
 * // Used in main.jsx
 * ReactDOM.createRoot(document.getElementById('root')).render(
 *   <AppRouter />
 * );
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <a href="#app-main-content" className="skip-link">Skip to content</a>
      <ScrollManager />
      <Header />
      <main className="app-main" id="app-main-content">
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
