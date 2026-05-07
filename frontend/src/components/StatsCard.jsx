import React from 'react';
import './StatsCard.css';

/**
 * StatsCard - Metric display card for dashboard statistics.
 *
 * Shows a labeled value with optional sub-value, percentage change
 * indicator, icon, and refresh button. Includes loading state.
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Metric name/label
 * @param {string|number} props.value - Primary value to display
 * @param {string} [props.subValue] - Secondary value (e.g., USD equivalent)
 * @param {number} [props.change] - Percentage change (positive or negative)
 * @param {React.ReactNode} [props.icon] - Icon element for visual context
 * @param {boolean} [props.loading=false] - Shows skeleton placeholder when true
 * @param {Function} [props.onRefresh] - Callback for refresh button click
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Stats card element
 * @example
 * <StatsCard
 *   label="Total Value Locked"
 *   value="1,234.56 STX"
 *   subValue="$1,500.00"
 *   change={5.2}
 *   icon={<VaultIcon />}
 *   onRefresh={fetchTVL}
 * />
 */
export function StatsCard({
  label,
  value,
  subValue,
  change,
  icon,
  loading = false,
  onRefresh,
  className = '',
}) {

  if (loading) {
    return (
      <div className={`stats-card stats-card-loading ${className}`} aria-busy="true" role="status" aria-live="polite">
        <div className="stats-skeleton stats-skeleton-icon" aria-hidden="true" />
        <div className="stats-content">
          <div className="stats-skeleton stats-skeleton-label" aria-hidden="true" />
          <div className="stats-skeleton stats-skeleton-value" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className={`stats-card ${className}`}>
      <div className="stats-card-header">
        {icon && <div className="stats-icon">{icon}</div>}
        {onRefresh && (
          <button
            type="button"
            className="stats-refresh"
            onClick={onRefresh}
            aria-label={`Refresh ${label}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}
      </div>


      <div className="stats-content">
        <span className="stats-label">{label}</span>

        <div className="stats-values" role="status" aria-live="polite" aria-atomic="true">
          <span className="stats-value">{value}</span>

          {change !== undefined && (
            <span
              className={`stats-change ${change >= 0 ? 'stats-change-positive' : 'stats-change-negative'}`}
              aria-label={`${change >= 0 ? 'up' : 'down'} ${Math.abs(change)} percent`}
            >
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          )}
        </div>

        {subValue && <span className="stats-subvalue">{subValue}</span>}
      </div>
    </div>
  );
}

export default StatsCard;
