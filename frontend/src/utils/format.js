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
    return Number(height).toLocaleString();
};
