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
        const value = Number(rawValue);
        if (isNaN(value)) return '0.000000';
        
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
    if (stacksAddress.length <= prefixLength + suffixLength + 3) return stacksAddress;
    return `${stacksAddress.slice(0, prefixLength)}...${stacksAddress.slice(-suffixLength)}`;
};

/**
 * Formats a number with locale-specific separators.
 * @param {number|string} val - The numeric value to format.
 * @returns {string} Formatted number string.
 * @throws {Error} If val cannot be converted to a number.
 */
 export function formatNumber(numberToFormat, fractionDigits = 2) {
    if (numberToFormat === undefined || numberToFormat === null) return '0.00';
    const parsedNumber = Number(numberToFormat);
    if (isNaN(parsedNumber)) return '0.00';
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(parsedNumber);
}

/**
 * Formats a decimal value as a percentage string.
 * @param {number|string} val - The decimal value (e.g., 0.05).
 * @param {number} [decimals=2] - Number of decimal places to include.
 * @returns {string} Formatted percentage string.
 * @throws {Error} If decimalValue cannot be converted to a number.
 */
export function formatPercent(valueToFormat, fractionDigits = 2) {
    const parsedNumber = Number(valueToFormat);
    if (isNaN(parsedNumber)) throw new Error('Invalid percentage value');
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
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
