/**
 * TimeFi SDK Format Utilities Test Suite
 * 
 * Tests for formatting functions: formatSTX, formatAddress, formatNumber, formatPercent, formatDate, formatRelativeTime
 */

import { describe, it, expect } from 'vitest';
import { 
  formatSTX, 
  formatMicroSTX,
  formatAddress, 
  formatNumber, 
  formatPercent, 
  formatDate, 
  formatRelativeTime,
  formatBlocksToTime,
  blocksToMs,
  isValidSTXAmount
} from '../src/format.js';

describe('Format Utilities', () => {
  describe('formatSTX', () => {
    it('formatMicroSTX should be an alias for formatSTX', () => {
      expect(formatMicroSTX(1000000)).toBe(formatSTX(1000000));
      expect(formatMicroSTX(null)).toBe(formatSTX(null));
    });
    it('should convert microSTX to STX string', () => {
      expect(formatSTX(1000000)).toBe('1');
      expect(formatSTX(1500000)).toBe('1.5');
      expect(formatSTX(1234567)).toBe('1.234567');
    });

    it('should handle zero values', () => {
      expect(formatSTX(0)).toBe('0');
    });

    it('should handle null and undefined', () => {
      expect(formatSTX(null)).toBe('0.000000');
      expect(formatSTX(undefined)).toBe('0.000000');
    });

    it('should handle BigInt values', () => {
      expect(formatSTX(BigInt(1000000))).toBe('1');
      expect(formatSTX(BigInt(1500000))).toBe('1.5');
    });

    it('should handle string inputs', () => {
      expect(formatSTX('1000000')).toBe('1');
      expect(formatSTX('1500000')).toBe('1.5');
      expect(formatSTX('1,500,000')).toBe('1.5');
      expect(formatSTX(' 1000000 ')).toBe('1');
    });

    it('should handle objects with value property', () => {
      expect(formatSTX({ value: 1000000 })).toBe('1');
      expect(formatSTX({ value: 1500000 })).toBe('1.5');
    });

    it('should handle invalid inputs gracefully', () => {
      expect(formatSTX('invalid')).toBe('0.000000');
      expect(formatSTX(NaN)).toBe('0.000000');
      expect(formatSTX(Infinity)).toBe('0.000000');
    });

    it('should format negative microSTX values explicitly', () => {
      expect(formatSTX(-1000000)).toBe('-1');
    });

    it('should round fractional microSTX display precision', () => {
      expect(formatSTX(1234567.8)).toBe('1.234568');
    });

    it('should handle string values inside value objects', () => {
      expect(formatSTX({ value: '2500000' })).toBe('2.5');
    });

    it('should handle invalid value objects gracefully', () => {
      expect(formatSTX({ value: 'invalid' })).toBe('0.000000');
    });

    it('formatMicroSTX should handle comma-delimited strings', () => {
      expect(formatMicroSTX('2,500,000')).toBe('2.5');
    });
  });

  describe('formatAddress', () => {
    it('should truncate address with default lengths', () => {
      const address = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
      expect(formatAddress(address)).toBe('SP3F...GG6N');
    });

    it('should handle custom prefix and suffix lengths', () => {
      const address = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
      expect(formatAddress(address, 6, 3)).toBe('SP3FKN...G6N');
    });

    it('should return full address if too short to truncate', () => {
      const shortAddress = 'SP3...GG6N';
      expect(formatAddress(shortAddress)).toBe('SP3...GG6N');
    });

    it('should not truncate at the display threshold', () => {
      expect(formatAddress('12345678901')).toBe('12345678901');
    });

    it('should handle null and undefined', () => {
      expect(formatAddress(null)).toBe('');
      expect(formatAddress(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(formatAddress('')).toBe('');
    });

    it('should return empty string for non-string inputs', () => {
      expect(formatAddress(12345)).toBe('');
    });

    it('should trim surrounding whitespace before truncating', () => {
      const address = '  SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N  ';
      expect(formatAddress(address)).toBe('SP3F...GG6N');
    });

    it('should truncate just above the display threshold', () => {
      expect(formatAddress('123456789012')).toBe('1234...9012');
    });

    it('should trim short addresses before returning them', () => {
      expect(formatAddress('  SP3...GG6N  ')).toBe('SP3...GG6N');
    });

    it('should apply custom address truncation thresholds', () => {
      expect(formatAddress('12345678', 2, 2)).toBe('12...78');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with locale separators', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.89');
      expect(formatNumber(1000)).toBe('1,000.00');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0.00');
    });

    it('should handle null and undefined', () => {
      expect(formatNumber(null)).toBe('0.00');
      expect(formatNumber(undefined)).toBe('0.00');
    });

    it('should handle string inputs', () => {
      expect(formatNumber('1234.56')).toBe('1,234.56');
      expect(formatNumber('1,234.56')).toBe('1,234.56');
    });

    it('should handle custom fraction digits', () => {
      expect(formatNumber(1234.5, 4)).toBe('1,234.5000');
    });

    it('should fall back when fraction digits are out of range', () => {
      expect(formatNumber(1234.5, -1)).toBe('1,234.50');
      expect(formatNumber(1234.5, 99)).toBe('1,234.50000000000000000000');
    });

    it('should handle invalid inputs gracefully', () => {
      expect(formatNumber('invalid')).toBe('0.00');
      expect(formatNumber(NaN)).toBe('0.00');
      expect(formatNumber(Infinity)).toBe('0.00');
      expect(formatNumber(-Infinity)).toBe('0.00');
    });

    it('should format negative numbers with separators', () => {
      expect(formatNumber(-1234.5)).toBe('-1,234.50');
    });

    it('should format numbers with zero fraction digits', () => {
      expect(formatNumber(1234.5, 0)).toBe('1,235');
    });

    it('should trim spaced numeric strings before formatting numbers', () => {
      expect(formatNumber(' 1234.5 ')).toBe('1,234.50');
    });

    it('should fall back for non-integer number fraction digits', () => {
      expect(formatNumber(1234.5, 1.5)).toBe('1,234.50');
    });

    it('should format empty numeric strings as zero', () => {
      expect(formatNumber('')).toBe('0.00');
    });
  });

  describe('formatPercent', () => {
    it('should format decimal as percentage', () => {
      expect(formatPercent(5)).toBe('5.00%');
      expect(formatPercent(12.5)).toBe('12.50%');
      expect(formatPercent(0.5)).toBe('0.50%');
    });

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('0.00%');
    });

    it('should handle custom fraction digits', () => {
      expect(formatPercent(5.123, 3)).toBe('5.123%');
    });

    it('should normalize invalid fraction digit options', () => {
      expect(formatPercent(5.1, -2)).toBe('5.10%');
      expect(formatPercent(5.1, 99)).toBe('5.10000000000000000000%');
    });

    it('should handle string inputs', () => {
      expect(formatPercent('5.5')).toBe('5.50%');
      expect(formatPercent('1,234.5')).toBe('1,234.50%');
    });

    it('should return zero percent for invalid inputs', () => {
      expect(formatPercent('invalid')).toBe('0.00%');
      expect(formatPercent(NaN)).toBe('0.00%');
      expect(formatPercent(Infinity)).toBe('0.00%');
    });

    it('should format negative percentages explicitly', () => {
      expect(formatPercent(-1.5)).toBe('-1.50%');
    });

    it('should format percentages with zero fraction digits', () => {
      expect(formatPercent(12.5, 0)).toBe('13%');
    });

    it('should honor custom digits for null percentages', () => {
      expect(formatPercent(null, 3)).toBe('0.000%');
    });

    it('should fall back for non-integer percent fraction digits', () => {
      expect(formatPercent(5.5, 1.5)).toBe('5.50%');
    });
  });

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toContain('2024');
      expect(formatDate(date)).toContain('Jan');
    });

    it('should format timestamp numbers', () => {
      const timestamp = Date.parse('2024-01-15');
      expect(formatDate(timestamp)).toContain('2024');
    });

    it('should accept unix epoch timestamps', () => {
      expect(formatDate(0)).toContain('1970');
    });

    it('should format ISO date strings', () => {
      expect(formatDate('2024-01-15')).toContain('2024');
    });

    it('should handle null and undefined', () => {
      expect(formatDate(null)).toBe('--');
      expect(formatDate(undefined)).toBe('--');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('--');
      expect(formatDate(NaN)).toBe('--');
      expect(formatDate(true)).toBe('--');
    });

    it('should handle false date inputs as invalid', () => {
      expect(formatDate(false)).toBe('--');
    });

    it('should handle empty date strings as invalid', () => {
      expect(formatDate('')).toBe('--');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent times in seconds', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(formatRelativeTime(past)).toContain('second');
    });

    it('should format times in minutes', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 120000); // 2 minutes ago
      expect(formatRelativeTime(past)).toContain('minute');
    });

    it('should format times in hours', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 7200000); // 2 hours ago
      expect(formatRelativeTime(past)).toContain('hour');
    });

    it('should format times in days', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 172800000); // 2 days ago
      expect(formatRelativeTime(past)).toContain('day');
    });

    it('should accept unix epoch timestamps', () => {
      expect(formatRelativeTime(0)).toContain('ago');
    });

    it('should handle null and undefined', () => {
      expect(formatRelativeTime(null)).toBe('--');
      expect(formatRelativeTime(undefined)).toBe('--');
    });

    it('should handle invalid dates', () => {
      expect(formatRelativeTime('invalid')).toBe('--');
      expect(formatRelativeTime(NaN)).toBe('--');
      expect(formatRelativeTime(false)).toBe('--');
    });

    it('should format future times in seconds', () => {
      const future = new Date(Date.now() + 30000);
      expect(formatRelativeTime(future)).toContain('second');
    });

    it('should format future times in minutes', () => {
      const future = new Date(Date.now() + 120000);
      expect(formatRelativeTime(future)).toContain('minute');
    });

    it('should handle empty relative-time inputs', () => {
      expect(formatRelativeTime('')).toBe('--');
    });
  });

  describe('formatBlocksToTime', () => {
    it('returns zero days for invalid block-time input', () => {
      expect(formatBlocksToTime(100, 0)).toBe('0 days');
    });

    it('accepts numeric string block counts', () => {
      expect(formatBlocksToTime('144')).toBe('1 day');
    });

    it('accepts numeric string block time values', () => {
      expect(formatBlocksToTime(144, '600')).toBe('1 day');
    });

    it('formats month-scale block durations', () => {
      expect(formatBlocksToTime(4320)).toBe('1 month');
    });

    it('formats year-scale block durations', () => {
      expect(formatBlocksToTime(52560)).toBe('1 year');
    });

    it('pluralizes month-scale block durations', () => {
      expect(formatBlocksToTime(8640)).toBe('2 months');
    });

    it('pluralizes year-scale block durations', () => {
      expect(formatBlocksToTime(105120)).toBe('2 years');
    });

    it('formats fractional year durations', () => {
      expect(formatBlocksToTime(78840)).toBe('1.5 years');
    });

    it('returns zero days for negative block counts', () => {
      expect(formatBlocksToTime(-1)).toBe('0 days');
    });

    it('returns zero days for null block counts', () => {
      expect(formatBlocksToTime(null)).toBe('0 days');
    });

    it('returns zero days for nonnumeric block time values', () => {
      expect(formatBlocksToTime(144, 'slow')).toBe('0 days');
    });

    it('rounds mid-range block durations to month labels', () => {
      expect(formatBlocksToTime(6480)).toBe('2 months');
    });
  });

  describe('blocksToMs', () => {
    it('should convert block durations to milliseconds', () => {
      expect(blocksToMs(2, 600)).toBe(1200000);
    });

    it('should accept numeric string block conversion inputs', () => {
      expect(blocksToMs('2', '600')).toBe(1200000);
    });

    it('should return zero milliseconds for invalid block inputs', () => {
      expect(blocksToMs('invalid', 600)).toBe(0);
    });

    it('should return zero milliseconds for invalid block-time inputs', () => {
      expect(blocksToMs(2, 'slow')).toBe(0);
    });

    it('should return zero milliseconds for negative block inputs', () => {
      expect(blocksToMs(-2, 600)).toBe(0);
    });
  });

  describe('isValidSTXAmount', () => {
    it('should accept positive BigInt microSTX amounts', () => {
      expect(isValidSTXAmount(BigInt(1))).toBe(true);
    });

    it('should reject zero microSTX amounts', () => {
      expect(isValidSTXAmount(0)).toBe(false);
    });

    it('should accept positive string microSTX amounts', () => {
      expect(isValidSTXAmount('1000000')).toBe(true);
    });

    it('should reject invalid string microSTX amounts', () => {
      expect(isValidSTXAmount('invalid')).toBe(false);
    });

    it('should reject null microSTX amounts', () => {
      expect(isValidSTXAmount(null)).toBe(false);
    });
  });
});
