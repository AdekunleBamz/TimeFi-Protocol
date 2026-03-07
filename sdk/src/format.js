/**
 * Formatting Utilities
 * Standard formatting for STX, addresses, numbers, and dates
 */

export const formatSTX = (microStx) => {
    if (microStx === undefined || microStx === null) return '0.000000';
    try {
        const value = typeof microStx === 'bigint' ? Number(microStx) : Number(microStx);
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
    return Number(val).toLocaleString();
};

export const formatPercent = (val, decimals = 2) => {
    if (val === undefined || val === null) return '0%';
    return (val * 100).toFixed(decimals) + '%';
};

export const formatDate = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString(undefined, {
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

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(date);
};
