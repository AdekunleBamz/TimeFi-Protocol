/**
 * Formatting Utilities
 * Standard formatting for STX, addresses, numbers, and dates
 */

/**
+ * Formats a microSTX value into a human-readable STX string.
+ * @param {number|BigInt|string|Object} microStx - The value in microSTX.
+ * @returns {string} Formatted STX string.
+ */
 export const formatSTX = (microStx) => {
    if (microStx === undefined || microStx === null) return '0.000000';
    try {
        // Extract inner value if wrapped in an object
        const rawValue = (typeof microStx === 'object' && microStx !== null && 'value' in microStx)
            ? microStx.value
            : microStx;

        // Convert to Number safely, handles string, bigint, etc.
        const value = Number(rawValue);
        if (isNaN(value)) return '0.000000';
        
        const stx = value / 1_000_000;
        return stx.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
        });
    } catch (e) {
        console.error('Error formatting STX:', e);
        return '0.000000';
    }
};

export const formatAddress = (address, prefix = 4, suffix = 4) => {
    if (!address) return '';
    if (address.length <= prefix + suffix) return address;
    return `${address.slice(0, prefix + 2)}...${address.slice(-suffix)}`;
};

export const formatNumber = (val) => {
    if (val === undefined || val === null) return '0';
    const num = Number(val);
    return isNaN(num) ? '0' : num.toLocaleString();
};

export const formatPercent = (val, decimals = 2) => {
    if (val === undefined || val === null) return '0%';
    const num = Number(val);
    if (isNaN(num)) return '0%';
    return (num * 100).toFixed(decimals) + '%';
};

export const formatDate = (date) => {
    if (!date) return '--';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatRelativeTime = (date) => {
    if (!date) return '--';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    // Handle future dates
    if (diffInSeconds < -1) {
        const absDiff = Math.abs(diffInSeconds);
        if (absDiff < 60) return 'in a few seconds';
        if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)}m`;
        if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)}h`;
        return `in ${Math.floor(absDiff / 86400)}d`;
    }

    if (diffInSeconds < 5) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(date);
};
