/**
 * Format STX amount from microSTX
 * @param {number|string} microStx - Amount in microSTX
 * @param {number} decimals - Decimal places (default: 6)
 * @returns {string} Formatted STX amount
 */
export function formatSTX(microStx, decimals = 6) {
  if (microStx === null || microStx === undefined) return '0';
  
  const stx = Number(microStx) / 1_000_000;
  
  if (stx === 0) return '0';
  if (stx < 0.000001) return '<0.000001';
  
  return stx.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @param {number} digits - Significant digits (default: 2)
 * @returns {string} Formatted number
 */
export function formatCompact(num, digits = 2) {
  if (num === null || num === undefined) return '0';
  
  const value = Number(num);
  
  if (Math.abs(value) < 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: digits });
  }
  
  const lookup = [
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' },
  ];
  
  const item = lookup.find(item => Math.abs(value) >= item.value);
  
  if (item) {
    return (value / item.value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }) + item.symbol;
  }
  
  return value.toString();
}

/**
 * Format time duration from seconds
 * @param {number} seconds - Duration in seconds
 * @returns {string} Human-readable duration
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  if (secs > 0 && days === 0 && hours === 0) parts.push(`${secs}s`);
  
  return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * Format Stacks address with ellipsis
 * @param {string} address - Full Stacks address
 * @param {number} startChars - Chars at start (default: 6)
 * @param {number} endChars - Chars at end (default: 4)
 * @returns {string} Truncated address
 */
export function formatAddress(address, startChars = 6, endChars = 4) {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format percentage
 * @param {number} value - Decimal value (0.05 = 5%)
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted percentage
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '0%';
  
  return (Number(value) * 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }) + '%';
}

/**
 * Format date relative to now
 * @param {Date|number|string} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  const now = Date.now();
  const timestamp = new Date(date).getTime();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format block height with commas
 * @param {number} height - Block height
 * @returns {string} Formatted block height
 */
export function formatBlockHeight(height) {
  if (!height) return '0';
  return Number(height).toLocaleString('en-US');
}
