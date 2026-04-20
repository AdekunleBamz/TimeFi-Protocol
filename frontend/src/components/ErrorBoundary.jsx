/**
 * ErrorBoundary Component - Error handling wrapper for React components.
 *
 * @module components/ErrorBoundary
 * @author adekunlebamz
 */
import React, { Component } from 'react';
import { Button } from './Button';
import './ErrorBoundary.css';

const isDevelopment = import.meta.env.DEV;

/**
 * ErrorBoundary - React error boundary component for catching and handling errors.
 *
 * Catches JavaScript errors anywhere in the component tree, logs them,
 * and displays a fallback UI instead of crashing the entire application.
 *
 * @class
 * @extends React.Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {React.ReactNode} [props.fallback] - Custom fallback UI
 * @param {boolean} [props.minimal=false] - Use minimal error UI
 * @param {Function} [props.onError] - Error callback handler
 * @example
 * <ErrorBoundary fallback={<CustomError />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error to console in development
    if (isDevelopment) {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Minimal fallback for inline errors
      if (this.props.minimal) {
        return (
          <div className="error-boundary-minimal">
            <p>Something went wrong</p>
            <button type="button" onClick={this.handleRetry}>Try again</button>
          </div>
        );
      }

      // Full page error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">⚠️</div>
            <h1>Something went wrong</h1>
            <p>The interface hit an unexpected state. Your wallet and funds are not affected by this display error.</p>

            <div className="error-boundary-guidance">
              <div className="error-boundary-guidance-item">
                <strong>Try again</strong>
                <span>Re-render the current view without leaving the page.</span>
              </div>
              <div className="error-boundary-guidance-item">
                <strong>Reload</strong>
                <span>Refresh app state and reconnect data from the network.</span>
              </div>
              <div className="error-boundary-guidance-item">
                <strong>Go home</strong>
                <span>Return to the dashboard if this route is unstable.</span>
              </div>
            </div>

            {isDevelopment && this.state.error && (
              <details className="error-boundary-details">
                <summary>Error Details</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-boundary-actions">
              <Button variant="primary" onClick={this.handleRetry}>
                Try Again
              </Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button variant="ghost" onClick={() => window.location.assign('/')}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary - Higher-order component for wrapping with ErrorBoundary.
 *
 * Provides a convenient way to add error boundary protection to any component.
 *
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} [errorBoundaryProps={}] - Props to pass to ErrorBoundary
 * @returns {React.FunctionComponent} Wrapped component with error boundary
 * @example
 * const ProtectedComponent = withErrorBoundary(MyComponent, { minimal: true });
 */
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
