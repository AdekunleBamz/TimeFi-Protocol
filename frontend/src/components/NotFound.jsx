import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { Tooltip } from './Tooltip';
import './NotFound.css';

/**
 * NotFound - 404 error page component.
 *
 * Displays when a user navigates to a non-existent route.
 * Provides navigation shortcuts to help users recover quickly.
 *
 * @returns {JSX.Element} 404 page with navigation options
 * @example
 * // Used in Router as catch-all route
 * <Route path="*" element={<NotFound />} />
 */
export function NotFound() {
  const location = useLocation();

  return (
    <main className="not-found">
      <div className="not-found-content">
        <div className="not-found-illustration" aria-hidden="true">
          <div className="vault-outline">
            <div className="vault-lock-handle" />
          </div>
        </div>
        <div className="not-found-code">404</div>

        <h1>Page Not Found</h1>
        <p>The page you requested is unavailable. Use the shortcuts below to get back on track.</p>
        <div className="not-found-path">Requested path: <code>{location.pathname}</code></div>
        <div className="not-found-actions">
          <Link to="/">
            <Button variant="primary" size="lg" title="Return to the dashboard home">
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/#create-vault">
            <Button variant="secondary" size="lg">
              Create a Vault
            </Button>
          </Link>
        </div>
        <span className="not-found-help">If this keeps happening, check the URL for typos.</span>
      </div>
    </main>
  );
}

export default NotFound;
