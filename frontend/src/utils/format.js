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
    const numericHeight = typeof height === 'object' ? NaN : Number(height);
    if (!Number.isFinite(numericHeight) || numericHeight < 0) return '--';
    return Math.floor(numericHeight).toLocaleString();
};

/**
 * formatSignedNumber - Format numeric values with explicit sign when positive.
 * @param {number|string} value - Number to format
 * @returns {string} Signed number string (e.g. +12, -3, 0)
 */
export const formatSignedNumber = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '0';
    if (numericValue > 0) return `+${numericValue}`;
    return `${numericValue}`;
};

export const formatMicroStx = (microStx) => (Number(microStx) / 1e6).toFixed(6);

export const formatBps = (bps) => (Number(bps) / 100).toFixed(2) + "%";

export const formatBlocksToHours = (blocks) => (Number(blocks) / 6).toFixed(1);

export const formatBlocksToDays = (blocks) => (Number(blocks) / 144).toFixed(1);

export const formatStxAmount = (stx) => Number(stx).toLocaleString() + " STX";

export const formatTimestamp = (ts) => new Date(Number(ts) * 1000).toISOString();
