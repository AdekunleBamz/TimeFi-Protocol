import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import './NotFound.css';

/**
 * 404 Not Found page
 */
export function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-icon" aria-hidden="true">🧭</div>
        <div className="not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you requested is unavailable. Use the shortcuts below to recover quickly.</p>
        <div className="not-found-actions">
          <Link to="/">
            <Button variant="primary" size="lg">
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
    </div>
  );
}

export default NotFound;
