/**
 * Formatting Utilities
 * Standard formatting for STX, addresses, numbers, and dates
 */

/**
 * Format microSTX to STX with 6 decimal places
 * @param {number|string} microStx - Amount in microSTX
 * @returns {string} Formatted STX amount
 */
export const formatSTX = (microStx) => {
    if (microStx === undefined || microStx === null) return '0.000000';
    const stx = Number(microStx) / 1_000_000;
    return stx.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
    });
};

/**
 * Format Stacks address (e.g. SP12...3456)
 * @param {string} address - Full Stacks address
 * @param {number} prefix - Number of characters to show at start
 * @param {number} suffix - Number of characters to show at end
 * @returns {string} Truncated address
 */
export const formatAddress = (address, prefix = 4, suffix = 4) => {
    if (!address) return '';
    if (address.length <= prefix + suffix) return address;
    return `${address.slice(0, prefix + 2)}...${address.slice(-suffix)}`;
};

/**
 * Format a number with locale formatting
 * @param {number|string} val - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString();
};

/**
 * Format a block height (add commas)
 * @param {number|string} height - Block height
 * @returns {string} Formatted block height
 */
export const formatBlockHeight = (height) => {
    return formatNumber(height);
};

/**
 * Format a percentage
 * @param {number} val - Ratio (e.g. 0.05 for 5%)
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercent = (val, decimals = 2) => {
    if (val === undefined || val === null) return '0%';
    return (val * 100).toFixed(decimals) + '%';
};

/**
 * Format a date object or timestamp
 * @param {Date|number|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format relative time (e.g. "2 hours ago")
 * @param {Date|number|string} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    if (!date) return '--';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(date);
};
