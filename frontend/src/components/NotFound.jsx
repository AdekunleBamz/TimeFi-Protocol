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
        <div className="not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button variant="primary" size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
