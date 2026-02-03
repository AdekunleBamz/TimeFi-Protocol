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
      {icon && <div className="stats-icon">{icon}</div>}
      
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
