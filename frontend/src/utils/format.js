/**
 * Format Utilities - Common formatting functions for display values.
 *
 * Provides consistent formatting for STX amounts, addresses, timestamps,
 * and other values displayed throughout the application.
 *
 * @module utils/format
 * @author adekunlebamz
 */

/**
 * @typedef {Object} Formatters
 * @property {Function} formatSTX - Format microSTX to human-readable STX
 * @property {Function} formatAddress - Truncate and format Stacks addresses
 * @property {Function} formatNumber - Format numbers with locale separators
 * @property {Function} formatPercent - Format percentages with decimal places
 * @property {Function} formatDate - Format timestamps to readable dates
 * @property {Function} formatRelativeTime - Format time differences (e.g., "2 hours ago")
 */

export {
    formatSTX,
    formatAddress,
    formatNumber,
    formatPercent,
    formatDate,
    formatRelativeTime,
    formatBlocksToTime
} from 'timefi-sdk';

/**
 * formatBlockHeight - Format blockchain block height for display.
 *
 * Converts block height values to locale-formatted strings with
 * proper handling of edge cases and invalid inputs.
 *
 * @param {number|string|undefined|null} height - Block height value to format
 * @returns {string} Formatted block height with thousands separators or '--' if invalid
 * @example
 * formatBlockHeight(123456) // returns "123,456"
 * formatBlockHeight(null) // returns "--"
 * formatBlockHeight('') // returns "--"
 */
export const formatBlockHeight = (height) => {
    if (height === undefined || height === null || height === '') return '--';
    const numericHeight = Number(height);
    if (!Number.isFinite(numericHeight) || numericHeight < 0) return '--';
    return Math.floor(numericHeight).toLocaleString();
};
