"use strict";

/**
 * TimeFi Formatting Utilities
 *
 * Provides standardized formatting functions for STX amounts,
 * Stacks addresses, numbers, percentages, and dates throughout
 * the TimeFi SDK and applications.
 *
 * @module format
 */

const normalizeFractionDigits = (fractionDigits, fallback = 2) => {
    const parsedDigits = Number(fractionDigits);
    if (!Number.isInteger(parsedDigits) || parsedDigits < 0) return fallback;
    return Math.min(parsedDigits, 20);
};

const normalizeDisplayNumber = (value) => (
    typeof value === 'string' ? value.replace(/,/g, '').trim() : value
);

/**
 * Formats a microSTX value into a human-readable STX string.
 * @param {number|BigInt|string|Object} microStx - The value in microSTX.
 * @returns {string} Formatted STX string.
 * @throws {Error} If microStx cannot be converted to a number.
 */
export const formatSTX = (amountMicroStx) => {
    if (amountMicroStx === undefined || amountMicroStx === null) return '0.000000';
    try {
        // Extract inner value if wrapped in an object
        const rawValue = (typeof amountMicroStx === 'object' && amountMicroStx !== null && 'value' in amountMicroStx)
            ? amountMicroStx.value
            : amountMicroStx;

        // Convert to Number safely, handles string, bigint, etc.
        const normalizedRawValue = typeof rawValue === 'string' ? rawValue.replace(/,/g, '').trim() : rawValue;
        const value = Number(normalizedRawValue);
        if (!Number.isFinite(value)) return '0.000000';

        const stx = value / 1_000_000;
        return stx.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
        });
    } catch (e) {
        return '0.000000';
    }
};

/**
 * Truncates a Stacks address for display.
 * @param {string} address - The full Stacks address.
 * @param {number} [prefix=4] - Number of characters to keep at the start.
 * @param {number} [suffix=4] - Number of characters to keep at the end.
 * @returns {string} Truncated address string.
 * @throws {Error} If stacksAddress is not a string.
 */
export const formatAddress = (stacksAddress, prefixLength = 4, suffixLength = 4) => {
    if (!stacksAddress) return '';
    if (typeof stacksAddress !== 'string') return '';
    const normalizedAddress = stacksAddress.trim();
    if (normalizedAddress.length <= prefixLength + suffixLength + 3) return normalizedAddress;
    return `${normalizedAddress.slice(0, prefixLength)}...${normalizedAddress.slice(-suffixLength)}`;
};

/**
 * Formats a number with locale-specific separators.
 * @param {number|string} val - The numeric value to format.
 * @returns {string} Formatted number string.
 * @throws {Error} If val cannot be converted to a number.
 */
export function formatNumber(numberToFormat, fractionDigits = 2) {
    if (numberToFormat === undefined || numberToFormat === null) return '0.00';
    const normalizedValue = normalizeDisplayNumber(numberToFormat);
    const parsedNumber = Number(normalizedValue);
    if (!Number.isFinite(parsedNumber)) return '0.00';
    const normalizedFractionDigits = normalizeFractionDigits(fractionDigits);
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: normalizedFractionDigits,
        maximumFractionDigits: normalizedFractionDigits
    }).format(parsedNumber);
}

/**
 * Formats a percentage-point value as a percentage string.
 * @param {number|string} val - Percentage points (e.g., 5.25).
 * @param {number} [decimals=2] - Number of decimal places to include.
 * @returns {string} Formatted percentage string.
 * @throws {Error} If decimalValue cannot be converted to a number.
 */
export function formatPercent(valueToFormat, fractionDigits = 2) {
    const normalizedValue = normalizeDisplayNumber(valueToFormat);
    const parsedNumber = Number(normalizedValue);
    if (valueToFormat === undefined || valueToFormat === null || !Number.isFinite(parsedNumber)) {
        throw new Error('Invalid percentage value');
    }
    const normalizedFractionDigits = normalizeFractionDigits(fractionDigits);
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: normalizedFractionDigits,
        maximumFractionDigits: normalizedFractionDigits
    }).format(parsedNumber / 100);
}

/**
 * Formats a date or timestamp into a localized date string.
 * @param {Date|string|number} date - The date to format.
 * @returns {string} Formatted date string or '--' if invalid.
 * @throws {Error} If date cannot be parsed.
 */
export function formatDate(dateToFormat) {
    if (dateToFormat === undefined || dateToFormat === null || dateToFormat === '') return '--';
    const dateInstance = new Date(dateToFormat);
    if (isNaN(dateInstance.getTime())) return '--';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(dateInstance);
}

/**
 * Returns a relative time string (e.g., '5m ago', 'in 1h').
 * @param {Date|string|number} date - The date to compare with now.
 * @returns {string} Formatted relative time string.
 * @throws {Error} If date cannot be parsed.
 */
export function formatRelativeTime(dateToFormat) {
    if (dateToFormat === undefined || dateToFormat === null || dateToFormat === '') return '--';
    const dateInstance = new Date(dateToFormat);
    if (isNaN(dateInstance.getTime())) return '--';

    const secondsDiff = Math.floor((dateInstance - new Date()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

    if (Math.abs(secondsDiff) < 60) return rtf.format(secondsDiff, 'second');
    const minutesDiff = Math.floor(secondsDiff / 60);
    if (Math.abs(minutesDiff) < 60) return rtf.format(minutesDiff, 'minute');
    const hoursDiff = Math.floor(minutesDiff / 60);
    if (Math.abs(hoursDiff) < 24) return rtf.format(hoursDiff, 'hour');
    const daysDiff = Math.floor(hoursDiff / 24);
    return rtf.format(daysDiff, 'day');
}

/**
 * Converts a block count into a human-readable duration string.
 * @param {number} blocks - Number of Stacks blocks.
 * @param {number} [blockTimeSecs=600] - Seconds per block (default mainnet ~10 min).
 * @returns {string} Duration string such as '30 days' or '1 year'.
 */
export function formatBlocksToTime(blocks, blockTimeSecs = 600) {
    if (!Number.isFinite(blockTimeSecs) || blockTimeSecs <= 0) return '0 days';
    if (!Number.isFinite(blocks)) return '0 days';
    if (!blocks || blocks <= 0) return '0 days';
    const totalSeconds = blocks * blockTimeSecs;
    const days = Math.round(totalSeconds / 86400);
    if (days >= 365) {
        const years = (days / 365).toFixed(1).replace(/\.0$/, '');
        return `${years} year${years === '1' ? '' : 's'}`;
    }
    if (days >= 30) {
        const months = Math.round(days / 30);
        return `${months} month${months === 1 ? '' : 's'}`;
    }
    return `${days} day${days === 1 ? '' : 's'}`;
}

/**
 * Alias for formatSTX — accepts microSTX and returns a human-readable STX string.
 * @param {number|BigInt|string|Object} microStx - Amount in microSTX.
 * @returns {string} Formatted STX string.
 */
export const formatMicroSTX = formatSTX;
