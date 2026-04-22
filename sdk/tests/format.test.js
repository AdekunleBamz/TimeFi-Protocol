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
  formatBlocksToTime
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

    it('should throw on invalid inputs', () => {
      expect(() => formatPercent('invalid')).toThrow('Invalid percentage value');
      expect(() => formatPercent(NaN)).toThrow('Invalid percentage value');
      expect(() => formatPercent(Infinity)).toThrow('Invalid percentage value');
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
  });
});
