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
 * Output uses up to 6 decimal places (the precision of STX).
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
 * @param {number} [prefixLength=4] - Number of characters to keep at the start.
 * @param {number} [suffixLength=4] - Number of characters to keep at the end.
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

export const formatNumber = (val, decimals = 2) => {
    const safeDec = !Number.isInteger(decimals) ? 2 : decimals < 0 ? 2 : decimals > 20 ? 20 : decimals;
    if (val === undefined || val === null) return (0).toLocaleString(undefined, { minimumFractionDigits: safeDec, maximumFractionDigits: safeDec });
    const cleaned = typeof val === 'string' ? val.replace(/,/g, '').trim() : val;
    const num = Number(cleaned);
    if (isNaN(num) || !isFinite(num)) return (0).toLocaleString(undefined, { minimumFractionDigits: safeDec, maximumFractionDigits: safeDec });
    return num.toLocaleString(undefined, { minimumFractionDigits: safeDec, maximumFractionDigits: safeDec });
};

export const formatPercent = (val, decimals = 2) => {
    const safeDec = !Number.isInteger(decimals) ? 2 : decimals < 0 ? 2 : decimals > 20 ? 20 : decimals;
    if (val === undefined || val === null) return (0).toFixed(safeDec) + '%';
    const cleaned = typeof val === 'string' ? val.replace(/,/g, '').trim() : val;
    const num = Number(cleaned);
    if (isNaN(num) || !isFinite(num)) return (0).toFixed(safeDec) + '%';
    return num.toLocaleString(undefined, { minimumFractionDigits: safeDec, maximumFractionDigits: safeDec }) + '%';
};

export const formatDate = (date) => {
    if (date === undefined || date === null || typeof date === 'boolean' || (typeof date === 'number' && isNaN(date))) return '--';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Returns a relative time string compared to the current moment (e.g., '5 minutes ago', 'in 1 hour').
 * Returns '--' if the input is missing or cannot be parsed.
 * @param {Date|string|number} dateToFormat - The date to compare with now.
 * @returns {string} Formatted relative time string.
 * @throws {Error} If date cannot be parsed.
 */
export function formatRelativeTime(dateToFormat) {
    if (dateToFormat === undefined || dateToFormat === null || dateToFormat === '') return '--';
    if (typeof dateToFormat === 'boolean') return '--';
    const dateInstance = new Date(dateToFormat);
    if (isNaN(dateInstance.getTime())) return '--';

    const diffInSeconds = Math.floor((Date.now() - dateInstance.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

    // Handle future dates
    if (diffInSeconds < -1) {
        const absDiff = Math.abs(diffInSeconds);
        if (absDiff < 60) return rtf.format(-Math.round(absDiff), 'second');
        if (absDiff < 3600) return rtf.format(-Math.floor(absDiff / 60), 'minute');
        if (absDiff < 86400) return rtf.format(-Math.floor(absDiff / 3600), 'hour');
        return rtf.format(-Math.floor(absDiff / 86400), 'day');
    }

    if (diffInSeconds < 60) return rtf.format(-Math.round(diffInSeconds), 'second');
    const minutesDiff = Math.floor(diffInSeconds / 60);
    if (minutesDiff < 60) return rtf.format(-minutesDiff, 'minute');
    const hoursDiff = Math.floor(minutesDiff / 60);
    if (hoursDiff < 24) return rtf.format(-hoursDiff, 'hour');
    const daysDiff = Math.floor(hoursDiff / 24);
    return rtf.format(-daysDiff, 'day');
}

/**
 * Converts a block count into a human-readable duration string.
 * @param {number} blocks - Number of Stacks blocks.
 * @param {number} [blockTimeSecs=600] - Seconds per block (default mainnet ~10 min).
 * @returns {string} Duration string such as '30 days' or '1 year'.
 */
export function formatBlocksToTime(blocks, blockTimeSecs = 600) {
    const normalizedBlocks = Number(blocks);
    const normalizedBlockTimeSecs = Number(blockTimeSecs);
    if (!Number.isFinite(normalizedBlockTimeSecs) || normalizedBlockTimeSecs <= 0) return '0 days';
    if (!Number.isFinite(normalizedBlocks)) return '0 days';
    if (!normalizedBlocks || normalizedBlocks <= 0) return '0 days';
    const totalSeconds = normalizedBlocks * normalizedBlockTimeSecs;
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
 * Converts a block count to milliseconds for timers and animations.
 * @param {number} blocks - Number of Stacks blocks.
 * @param {number} [blockTimeSecs=600] - Seconds per block (default mainnet ~10 min).
 * @returns {number} Duration in milliseconds.
 */
export function blocksToMs(blocks, blockTimeSecs = 600) {
    const normalizedBlocks = Number(blocks);
    const normalizedBlockTimeSecs = Number(blockTimeSecs);
    if (!Number.isFinite(normalizedBlocks) || !Number.isFinite(normalizedBlockTimeSecs)) return 0;
    return normalizedBlocks * normalizedBlockTimeSecs * 1000;
}

/**
 * Alias for formatSTX — accepts microSTX and returns a human-readable STX string.
 * @param {number|BigInt|string|Object} microStx - Amount in microSTX.
 * @returns {string} Formatted STX string.
 */
export const formatMicroSTX = formatSTX;

/**
 * Validates that a microSTX amount is within acceptable bounds.
 * @param {number|BigInt|string} microStx - Amount in microSTX.
 * @returns {boolean} True if amount is positive and finite.
 */
export function isValidSTXAmount(microStx) {
    if (microStx === undefined || microStx === null) return false;
    const value = typeof microStx === 'bigint' ? Number(microStx) : Number(microStx);
    return Number.isFinite(value) && value > 0;
}
