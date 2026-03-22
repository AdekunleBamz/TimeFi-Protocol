/**
 * Formatting Utilities
 * Re-exporting from timefi-sdk
 */

export {
    formatSTX,
    formatAddress,
    formatNumber,
    formatPercent,
    formatDate,
    formatRelativeTime
} from 'timefi-sdk';

// App-specific formatting can be added here
export const formatBlockHeight = (height) => {
    if (height === undefined || height === null || height === '') return '--';
    const numericHeight = Number(height);
    if (!Number.isFinite(numericHeight)) return '--';
    return numericHeight.toLocaleString();
};
