import React from 'react';
import './StatsCard.css';

/**
 * StatsCard component for displaying key metrics
 * @param {string} label - Metric name
 * @param {string|number} value - Main value
 * @param {string} subValue - Secondary value (e.g., USD equivalent)
 * @param {number} change - Percentage change
 * @param {ReactNode} icon - Icon element
 * @param {boolean} loading - Shows skeleton when true
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
      <div className={`stats-card stats-card-loading ${className}`}>
        <div className="stats-skeleton stats-skeleton-icon" />
        <div className="stats-content">
          <div className="stats-skeleton stats-skeleton-label" />
          <div className="stats-skeleton stats-skeleton-value" />
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
        
        <div className="stats-values">
          <span className="stats-value">{value}</span>
          
          {change !== undefined && (
            <span className={`stats-change ${change >= 0 ? 'stats-change-positive' : 'stats-change-negative'}`}>
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
