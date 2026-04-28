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

/**
 * Format microSTX to a fixed 6-decimal STX string without currency symbol.
 * @param {number|string} microStx - Value in microSTX
 * @returns {string} STX string with 6 decimal places
 */
export const formatMicroStx = (microStx) => (Number(microStx) / 1e6).toFixed(6);

/**
 * Format basis points as a percentage string.
 * @param {number|string} bps - Basis points (100 bps = 1%)
 * @returns {string} Percentage string with two decimal places (e.g. "0.50%")
 */
export const formatBps = (bps) => (Number(bps) / 100).toFixed(2) + "%";

/**
 * Estimate hours from a block count based on the 10-minute block time.
 * @param {number|string} blocks - Number of Stacks blocks
 * @returns {string} Estimated hours as a decimal string (1 decimal place)
 */
export const formatBlocksToHours = (blocks) => (Number(blocks) / 6).toFixed(1);

/**
 * Estimate days from a block count based on 144 blocks per day (mainnet).
 * @param {number|string} blocks - Number of Stacks blocks
 * @returns {string} Estimated days as a decimal string (1 decimal place)
 */
export const formatBlocksToDays = (blocks) => (Number(blocks) / 144).toFixed(1);

/**
 * Format a whole STX value with locale separators and " STX" suffix.
 * @param {number|string} stx - STX amount (not microSTX)
 * @returns {string} Formatted amount string (e.g. "1,500 STX")
 */
export const formatStxAmount = (stx) => Number(stx).toLocaleString() + " STX";

/**
 * Convert a Unix timestamp (in seconds) to an ISO 8601 date-time string.
 * @param {number|string} ts - Unix timestamp in seconds
 * @returns {string} ISO 8601 formatted string (e.g. "2025-04-28T10:00:00.000Z")
 */
export const formatTimestamp = (ts) => new Date(Number(ts) * 1000).toISOString();

export const truncateAddress = (addr) => addr ? addr.slice(0,6) + "..." + addr.slice(-4) : "";

export const formatLockDuration = (blocks) => blocks + " blocks (~" + (Number(blocks)/144).toFixed(0) + " days)";

export const formatFeeAmount = (fee) => Number(fee).toLocaleString() + " uSTX";

export const formatVaultId = (id) => "Vault #" + String(id).padStart(4,"0");

/** Formats a microSTX amount as a rounded STX string with 2 decimal places. */
export const formatStxShort = (microStx) => (Number(microStx) / 1e6).toFixed(2) + ' STX';

/** Formats a block count as an approximate day range string, e.g. "~30 days". */
export const formatBlocksApprox = (blocks) => `~${Math.round(Number(blocks) / 144)} days`;

/** Returns a short locale date string from a Unix timestamp in seconds. */
export const formatDateShort = (ts) => new Date(Number(ts) * 1000).toLocaleDateString();

/** Formats a percentage (0-100) with one decimal place, e.g. "42.5%". */
export const formatPct = (ratio) => `${(Number(ratio) * 100).toFixed(1)}%`;

/** Formats a vault status string with the first letter capitalized. */
export const formatVaultStatus = (status) =>
  typeof status === 'string' && status.length > 0
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : '';

/** Formats a block height and lock period as a "Block X → Block Y" range string. */
export const formatBlockRange = (depositHeight, lockPeriod) =>
  `Block ${Number(depositHeight).toLocaleString()} → Block ${(Number(depositHeight) + Number(lockPeriod)).toLocaleString()}`;

/** Formats an error code as a string, e.g. "Error #103". */
export const formatErrorCode = (code) => `Error #${Number(code)}`;

/** Returns a human-readable duration string from a number of seconds. */
export const formatDuration = (secs) => {
  const s = Math.floor(Math.abs(Number(secs)));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
};

/** Returns a compact locale number string (e.g. 1,234,567). */
export const formatNumber = (n) => Number(n).toLocaleString();

/** Shortens a Stacks transaction ID to first 8 + last 4 chars. */
export const formatTxId = (txId) => {
  const s = String(txId || '');
  if (s.length < 12) return s;
  return `${s.slice(0, 8)}…${s.slice(-4)}`;
};
